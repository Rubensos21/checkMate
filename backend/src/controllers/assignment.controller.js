const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify teacher/admin owns or has access to the course
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

    if (req.user.role === 'TEACHER' && course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso a este curso' });
    }
    if (req.user.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.user.id, courseId } }
      });
      if (!enrollment) return res.status(403).json({ error: 'No estás inscrito en este curso' });
    }

    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      include: {
        _count: { select: { submissions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // For students, include their own submission status
    if (req.user.role === 'STUDENT') {
      const assignmentsWithStatus = await Promise.all(
        assignments.map(async (a) => {
          const submission = await prisma.submission.findFirst({
            where: { assignmentId: a.id, userId: req.user.id }
          });
          return { ...a, mySubmission: submission };
        })
      );
      return res.json(assignmentsWithStatus);
    }

    // For teachers/admins: include submissions with user info for grading
    const assignmentsWithSubs = await Promise.all(
      assignments.map(async (a) => {
        const submissions = await prisma.submission.findMany({
          where: { assignmentId: a.id },
          include: { user: { select: { name: true, matricula: true } } },
          orderBy: { createdAt: 'asc' }
        });
        return { ...a, submissions };
      })
    );
    res.json(assignmentsWithSubs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, dueDate } = req.body;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

    if (req.user.role === 'TEACHER' && course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Solo el docente del curso puede crear actividades' });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        courseId,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    await prisma.activityLog.create({
      data: { userId: req.user.id, action: 'ASSIGNMENT_CREATED', details: `Actividad creada: ${title}` }
    });

    res.json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear actividad' });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    await prisma.submission.deleteMany({ where: { assignmentId: req.params.id } });
    await prisma.assignment.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar actividad' });
  }
};

module.exports = { listAssignments, createAssignment, deleteAssignment };
