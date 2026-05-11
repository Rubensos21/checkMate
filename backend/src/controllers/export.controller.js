const { PrismaClient } = require('@prisma/client');
const ExcelJS = require('exceljs');
const prisma = new PrismaClient();

// Shared header style
const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };

function applyHeader(sheet, columns) {
  sheet.columns = columns;
  const headerRow = sheet.getRow(1);
  headerRow.eachCell(cell => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } } };
  });
  headerRow.height = 24;
}

const exportExcel = async (req, res) => {
  try {
    const { by } = req.query; // 'student' | 'course' | 'group'
    const isTeacher = req.user.role === 'TEACHER';

    // Fetch all submissions (filtered by teacher's courses if TEACHER)
    const courseFilter = isTeacher ? { instructorId: req.user.id } : {};

    const submissions = await prisma.submission.findMany({
      include: {
        user: { select: { name: true, matricula: true, semester: true, group: true } },
        assignment: {
          include: {
            course: { select: { title: true, semester: true, group: true, instructorId: true } }
          }
        }
      },
      where: isTeacher
        ? { assignment: { course: { instructorId: req.user.id } } }
        : {},
      orderBy: { createdAt: 'asc' }
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Dynamic Cooperation Group';
    workbook.created = new Date();

    if (!by || by === 'student') {
      // --- Sheet: Por Alumno ---
      const sheet = workbook.addWorksheet('Por Alumno');
      applyHeader(sheet, [
        { header: 'Alumno', key: 'student', width: 30 },
        { header: 'Matrícula', key: 'matricula', width: 14 },
        { header: 'Grupo', key: 'group', width: 10 },
        { header: 'Semestre', key: 'semester', width: 12 },
        { header: 'Actividad', key: 'assignment', width: 35 },
        { header: 'Materia', key: 'course', width: 30 },
        { header: 'Estado', key: 'status', width: 14 },
        { header: 'Calificación', key: 'grade', width: 14 },
        { header: 'Fecha Entrega', key: 'date', width: 20 },
      ]);
      submissions.forEach(s => {
        sheet.addRow({
          student: s.user.name,
          matricula: s.user.matricula || '—',
          group: s.user.group || '—',
          semester: s.user.semester || '—',
          assignment: s.assignment.title,
          course: s.assignment.course.title,
          status: s.status,
          grade: s.grade != null ? s.grade : '—',
          date: s.createdAt.toLocaleDateString('es-MX'),
        });
      });
    }

    if (!by || by === 'course') {
      // --- Sheet: Por Materia ---
      const sheet = workbook.addWorksheet('Por Materia');
      applyHeader(sheet, [
        { header: 'Materia', key: 'course', width: 35 },
        { header: 'Semestre', key: 'semester', width: 12 },
        { header: 'Grupo', key: 'group', width: 10 },
        { header: 'Actividad', key: 'assignment', width: 35 },
        { header: 'Alumno', key: 'student', width: 30 },
        { header: 'Estado', key: 'status', width: 14 },
        { header: 'Calificación', key: 'grade', width: 14 },
      ]);
      const sorted = [...submissions].sort((a, b) => a.assignment.course.title.localeCompare(b.assignment.course.title));
      sorted.forEach(s => {
        sheet.addRow({
          course: s.assignment.course.title,
          semester: s.assignment.course.semester || '—',
          group: s.assignment.course.group || '—',
          assignment: s.assignment.title,
          student: s.user.name,
          status: s.status,
          grade: s.grade != null ? s.grade : '—',
        });
      });
    }

    if (!by || by === 'group') {
      // --- Sheet: Por Grupo ---
      const sheet = workbook.addWorksheet('Por Grupo');
      applyHeader(sheet, [
        { header: 'Semestre', key: 'semester', width: 12 },
        { header: 'Grupo', key: 'group', width: 10 },
        { header: 'Alumno', key: 'student', width: 30 },
        { header: 'Matrícula', key: 'matricula', width: 14 },
        { header: 'Materia', key: 'course', width: 30 },
        { header: 'Actividad', key: 'assignment', width: 35 },
        { header: 'Calificación', key: 'grade', width: 14 },
        { header: 'Estado', key: 'status', width: 14 },
      ]);
      const byGroup = [...submissions].sort((a, b) => {
        const ga = `${a.user.semester}-${a.user.group}`;
        const gb = `${b.user.semester}-${b.user.group}`;
        return ga.localeCompare(gb);
      });
      byGroup.forEach(s => {
        sheet.addRow({
          semester: s.user.semester || '—',
          group: s.user.group || '—',
          student: s.user.name,
          matricula: s.user.matricula || '—',
          course: s.assignment.course.title,
          assignment: s.assignment.title,
          grade: s.grade != null ? s.grade : '—',
          status: s.status,
        });
      });
    }

    // Alternate row coloring for all sheets
    workbook.eachSheet(sheet => {
      sheet.eachRow((row, rowNum) => {
        if (rowNum > 1 && rowNum % 2 === 0) {
          row.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5FF' } };
          });
        }
      });
    });

    const date = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=rendimiento_alumnos_${date}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el reporte Excel' });
  }
};

// Notifications for students and teachers
const getNotifications = async (req, res) => {
  try {
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const notifications = [];

    if (req.user.role === 'STUDENT') {
      // Get student's enrolled courses
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: req.user.id },
        select: { courseId: true }
      });
      const courseIds = enrollments.map(e => e.courseId);

      // Get all assignments in those courses
      const assignments = await prisma.assignment.findMany({
        where: { courseId: { in: courseIds } },
        include: {
          course: { select: { title: true } },
          submissions: { where: { userId: req.user.id }, select: { id: true, status: true, grade: true } }
        },
        orderBy: { dueDate: 'asc' }
      });

      for (const a of assignments) {
        const submitted = a.submissions.length > 0;
        const dueDate = new Date(a.dueDate);
        const isExpired = dueDate < now;
        const isNew = new Date(a.createdAt) >= last7Days;
        const isExpiringSoon = !isExpired && dueDate <= in3Days;

        if (submitted) {
          const sub = a.submissions[0];
          if (sub.status === 'APPROVED') {
            notifications.push({
              id: `grade-${a.id}`, type: 'grade',
              title: `Calificación disponible: ${a.title}`,
              body: `Tu entrega fue calificada con ${sub.grade ?? 'Sin nota'} en ${a.course.title}`,
              dueDate: a.dueDate, course: a.course.title,
            });
          }
        } else {
          if (isExpired) {
            notifications.push({
              id: `expired-${a.id}`, type: 'expired',
              title: `Actividad vencida: ${a.title}`,
              body: `El plazo venció el ${dueDate.toLocaleDateString('es-MX')} en ${a.course.title}`,
              dueDate: a.dueDate, course: a.course.title,
            });
          } else if (isExpiringSoon) {
            notifications.push({
              id: `soon-${a.id}`, type: 'warning',
              title: `Por vencer: ${a.title}`,
              body: `Entrega en ${a.course.title} — vence el ${dueDate.toLocaleDateString('es-MX')}`,
              dueDate: a.dueDate, course: a.course.title,
            });
          } else if (isNew) {
            notifications.push({
              id: `new-${a.id}`, type: 'new',
              title: `Nueva actividad: ${a.title}`,
              body: `Publicada en ${a.course.title} — entrega: ${dueDate.toLocaleDateString('es-MX')}`,
              dueDate: a.dueDate, course: a.course.title,
            });
          }
        }
      }
    }

    if (req.user.role === 'TEACHER' || req.user.role === 'ADMIN') {
      // Pending submissions in teacher's courses
      const where = req.user.role === 'TEACHER'
        ? { status: 'PENDING', assignment: { course: { instructorId: req.user.id } } }
        : { status: 'PENDING' };

      const pending = await prisma.submission.findMany({
        where,
        include: {
          user: { select: { name: true, matricula: true } },
          assignment: { include: { course: { select: { title: true } } } }
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      for (const s of pending) {
        notifications.push({
          id: `sub-${s.id}`, type: 'review',
          title: `Entrega pendiente de revisión`,
          body: `${s.user.name} entregó "${s.assignment.title}" en ${s.assignment.course.title}`,
          dueDate: s.createdAt, course: s.assignment.course.title,
          student: s.user.name,
        });
      }
    }

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

module.exports = { exportExcel, getNotifications };
