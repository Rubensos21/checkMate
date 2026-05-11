const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ocrService = require('../services/ocr.service');

const getAllSubmissions = async (req, res) => {
  try {
    let submissions = [];
    if (req.user.role === 'ADMIN') {
      submissions = await prisma.submission.findMany({
        include: { user: true, assignment: { include: { course: true } } },
        orderBy: { createdAt: 'desc' }
      });
    } else if (req.user.role === 'TEACHER') {
      submissions = await prisma.submission.findMany({
        where: { assignment: { course: { instructorId: req.user.id } } },
        include: { user: true, assignment: { include: { course: true } } },
        orderBy: { createdAt: 'desc' }
      });
    } else if (req.user.role === 'STUDENT') {
      submissions = await prisma.submission.findMany({
        where: { userId: req.user.id },
        include: { assignment: { include: { course: true } } },
        orderBy: { createdAt: 'desc' }
      });
    }
    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    let { grade, feedback } = req.body;

    // Validate grade: 1.0 - 10.0
    grade = parseFloat(grade);
    if (isNaN(grade) || grade < 0 || grade > 10) {
      return res.status(400).json({ error: 'La calificación debe estar entre 0 y 10' });
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        grade,
        feedback: feedback || null,
        status: 'APPROVED',
      },
      include: {
        user: { select: { name: true, matricula: true } },
        assignment: { select: { title: true } }
      }
    });

    await prisma.activityLog.create({
      data: { userId: req.user.id, action: 'SUBMISSION_GRADED', details: `Entrega calificada: ${grade}/10` }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to grade submission' });
  }
};

const createSubmission = async (req, res) => {
  try {
    const { assignmentId, comment, imageUrl } = req.body;
    const userId = req.user.id;

    // Check not already submitted
    const existing = await prisma.submission.findFirst({ where: { assignmentId, userId } });
    if (existing) return res.status(400).json({ error: 'Ya entregaste esta actividad' });

    // Determine if late
    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) return res.status(404).json({ error: 'Actividad no encontrada' });
    const isLate = new Date() > new Date(assignment.dueDate);

    const url = imageUrl || null;
    let extractedText = comment || 'Entrega sin comentario';
    let confidence = 0.5;

    if (imageUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(imageUrl)) {
      try {
        extractedText = await ocrService.extractTextFromImage(imageUrl);
        confidence = extractedText.length > 50 ? 0.9 : 0.5;
      } catch (e) {
        console.error('OCR failed', e);
      }
    }

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        userId,
        imageUrl: url || 'https://placehold.co/600x400?text=Entrega',
        extractedText,
        confidence,
        status: 'PENDING',
        grade: null,
        isLate,
      }
    });

    await prisma.activityLog.create({
      data: { userId, action: 'SUBMISSION_CREATED', details: `Entrega ${isLate ? 'tardía' : 'a tiempo'} para "${assignment.title}"` }
    });

    res.json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
};

// Endpoint for student to poll their own submission status
const getSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await prisma.submission.findUnique({
      where: { id },
      select: { id: true, status: true, grade: true, feedback: true, isLate: true, updatedAt: true }
    });
    if (!submission) return res.status(404).json({ error: 'No encontrada' });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
};

const uploadSubmissionWithOCR = createSubmission;

const getStats = async (req, res) => {
  try {
    const totalCourses = await prisma.course.count();
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const pendingSubmissions = await prisma.submission.count({ where: { status: 'PENDING' } });
    const gradedSubmissions = await prisma.submission.count({ where: { status: 'APPROVED' } });
    res.json({ totalCourses, totalStudents, pendingSubmissions, gradedSubmissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

module.exports = { getAllSubmissions, gradeSubmission, uploadSubmissionWithOCR, createSubmission, getStats, getSubmissionStatus };
