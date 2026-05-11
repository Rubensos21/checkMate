const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSystemReports = async (req, res) => {
  try {
    const activityLogs = await prisma.activityLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, role: true } } }
    });

    const activeStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalCourses = await prisma.course.count();
    
    // Group activity by day for charts (simulated simple aggregation)
    const recentActivity = await prisma.activityLog.groupBy({
      by: ['action'],
      _count: { action: true }
    });

    res.json({
      metrics: {
        activeStudents,
        totalCourses,
        totalActivities: activityLogs.length
      },
      recentActivity,
      logs: activityLogs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

const getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: studentId },
      include: { course: true }
    });

    const submissions = await prisma.submission.findMany({
      where: { userId: studentId },
      include: { assignment: true }
    });

    const grades = submissions.filter(s => s.grade !== null).map(s => s.grade);
    const averageGrade = grades.length > 0 ? (grades.reduce((a, b) => a + b, 0) / grades.length) : 0;

    res.json({
      enrollments,
      submissions,
      averageGrade,
      totalSubmissions: submissions.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch student progress' });
  }
};

module.exports = { getSystemReports, getStudentProgress };
