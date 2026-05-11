const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// prefix: STUDENT → (55-sem), TEACHER → 20, ADMIN → 10
const generateId = async (role, semester) => {
  let prefix;
  if (role === 'STUDENT') prefix = String(55 - (parseInt(semester, 10) || 1)).padStart(2, '0');
  else if (role === 'TEACHER') prefix = '20';
  else prefix = '10';

  let id, exists;
  do {
    const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    id = `${prefix}${suffix}`;
    exists = await prisma.user.findUnique({ where: { matricula: id } });
  } while (exists);
  return id;
};

const buildEmail = (apellidoPaterno, matricula) => {
  const prefix = apellidoPaterno.slice(0, 2).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return `${prefix}${matricula}@dcg.edu.mx`;
};

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminId = await generateId('ADMIN');
  const admin = await prisma.user.upsert({
    where: { email: 'ad101234@dcg.edu.mx' },
    update: {},
    create: {
      name: 'Sistema Administrador',
      nombre: 'Sistema',
      apellidoPaterno: 'Administrador',
      apellidoMaterno: 'DCG',
      email: `ad${adminId}@dcg.edu.mx`,
      password: passwordHash,
      role: 'ADMIN',
      matricula: adminId,
    }
  });

  const teacherId = await generateId('TEACHER');
  const teacher = await prisma.user.upsert({
    where: { email: `ma${teacherId}@dcg.edu.mx` },
    update: {},
    create: {
      name: 'Martínez López, Juan',
      nombre: 'Juan',
      apellidoPaterno: 'Martínez',
      apellidoMaterno: 'López',
      email: `ma${teacherId}@dcg.edu.mx`,
      password: passwordHash,
      role: 'TEACHER',
      matricula: teacherId,
    }
  });

  const studentId = await generateId('STUDENT', '6');
  const student = await prisma.user.upsert({
    where: { email: `go${studentId}@dcg.edu.mx` },
    update: {},
    create: {
      name: 'González Ramírez, Ana',
      nombre: 'Ana',
      apellidoPaterno: 'González',
      apellidoMaterno: 'Ramírez',
      email: `go${studentId}@dcg.edu.mx`,
      password: passwordHash,
      role: 'STUDENT',
      matricula: studentId,
      semester: '6',
      group: '601',
    }
  });

  const course = await prisma.course.create({
    data: {
      title: 'Introducción al Desarrollo Web',
      description: 'Aprende HTML, CSS y JS desde cero.',
      instructorId: teacher.id,
      semester: '6',
      group: '601',
    }
  });

  await prisma.enrollment.create({ data: { userId: student.id, courseId: course.id } });

  const assignment = await prisma.assignment.create({
    data: {
      title: 'Maquetación de Landing Page',
      description: 'Sube una captura de pantalla de tu página renderizada.',
      courseId: course.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
  });

  await prisma.submission.create({
    data: {
      assignmentId: assignment.id,
      userId: student.id,
      imageUrl: 'https://placehold.co/600x400?text=Landing+Page',
      extractedText: 'Excelente estructura y diseño responsive.',
      confidence: 0.95,
      status: 'APPROVED',
      grade: 100,
    }
  });

  await prisma.setting.upsert({
    where: { id: 'global' },
    update: {},
    create: { id: 'global', theme: 'dark', primaryColor: 'indigo' }
  });

  await prisma.activityLog.create({
    data: { userId: admin.id, action: 'SYSTEM_INIT', details: 'Base de datos inicializada' }
  });

  console.log('\n=== CREDENCIALES ===');
  console.log(`ADMIN:   ${admin.email} / password123  (matrícula: ${adminId})`);
  console.log(`DOCENTE: ${teacher.email} / password123  (matrícula: ${teacherId})`);
  console.log(`ALUMNO:  ${student.email} / password123  (matrícula: ${studentId})`);
  console.log('Nota: También puede iniciar sesión usando la matrícula como usuario.');
  console.log('==================\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());
