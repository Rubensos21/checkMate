const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllCourses = async (req, res) => {
  try {
    let courses = [];
    if (req.user.role === 'ADMIN') {
      courses = await prisma.course.findMany({
        include: {
          instructor: { select: { id: true, name: true } },
          enrollments: { include: { user: { select: { id: true, name: true, email: true } } } },
          _count: { select: { enrollments: true, assignments: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (req.user.role === 'TEACHER') {
      courses = await prisma.course.findMany({
        where: { instructorId: req.user.id },
        include: {
          instructor: { select: { id: true, name: true } },
          enrollments: { include: { user: { select: { id: true, name: true, email: true } } } },
          _count: { select: { enrollments: true, assignments: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (req.user.role === 'STUDENT') {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: req.user.id },
        include: {
          course: {
            include: {
              instructor: { select: { id: true, name: true } },
              _count: { select: { assignments: true } }
            }
          }
        }
      });
      courses = enrollments.map(e => e.course);
    }
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        instructor: { select: { id: true, name: true } },
        enrollments: { include: { user: { select: { id: true, name: true, email: true } } } },
        assignments: { orderBy: { createdAt: 'desc' }, include: { _count: { select: { submissions: true } } } }
      }
    });
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description, instructorId, semester, group } = req.body;
    const resolvedInstructorId = req.user.role === 'ADMIN' ? instructorId : req.user.id;

    if (!resolvedInstructorId) {
      return res.status(400).json({ error: 'Se requiere un docente' });
    }

    const course = await prisma.course.create({
      data: { title, description, instructorId: resolvedInstructorId, semester: semester || null, group: group || null },
      include: { instructor: { select: { id: true, name: true } } }
    });

    // Auto-enroll: if semester+group provided, enroll all matching students
    if (semester && group) {
      const matchingStudents = await prisma.user.findMany({
        where: { role: 'STUDENT', semester, group }
      });
      for (const student of matchingStudents) {
        await prisma.enrollment.create({
          data: { userId: student.id, courseId: course.id }
        }).catch(() => {}); // ignore duplicates
      }
    }

    await prisma.activityLog.create({
      data: { userId: req.user.id, action: 'COURSE_CREATED', details: `Curso creado: ${title} Sem:${semester} Grp:${group}` }
    });

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

const enrollStudent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.body;

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });
    if (existing) return res.status(400).json({ error: 'El alumno ya está inscrito' });

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    await prisma.activityLog.create({
      data: { userId: req.user.id, action: 'STUDENT_ENROLLED', details: `Alumno inscrito al curso ${courseId}` }
    });

    res.json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al inscribir alumno' });
  }
};

const unenrollStudent = async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    await prisma.enrollment.delete({
      where: { userId_courseId: { userId, courseId } }
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al desinscribir alumno' });
  }
};

const assignTeacher = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { instructorId } = req.body;
    const course = await prisma.course.update({
      where: { id: courseId },
      data: { instructorId },
      include: { instructor: { select: { id: true, name: true } } }
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Error al asignar docente' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    // Delete all related data in order
    const assignments = await prisma.assignment.findMany({ where: { courseId: id }, select: { id: true } });
    const assignmentIds = assignments.map(a => a.id);
    if (assignmentIds.length > 0) {
      await prisma.submission.deleteMany({ where: { assignmentId: { in: assignmentIds } } });
    }
    await prisma.assignment.deleteMany({ where: { courseId: id } });
    await prisma.enrollment.deleteMany({ where: { courseId: id } });
    await prisma.course.delete({ where: { id } });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar curso' });
  }
};

module.exports = { getAllCourses, getCourseById, createCourse, enrollStudent, unenrollStudent, assignTeacher, deleteCourse };
