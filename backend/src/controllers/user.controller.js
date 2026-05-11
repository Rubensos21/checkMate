const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Prefix mapping: STUDENT → (55 - semester), TEACHER → 20, ADMIN → 10
const generateId = async (role, semester) => {
  let prefix;
  if (role === 'STUDENT') prefix = String(55 - (parseInt(semester, 10) || 1)).padStart(2, '0');
  else if (role === 'TEACHER') prefix = '20';
  else prefix = '10';

  let id, exists;
  let attempts = 0;
  do {
    const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    id = `${prefix}${suffix}`;
    exists = await prisma.user.findUnique({ where: { matricula: id } });
    attempts++;
  } while (exists && attempts < 100);
  return id;
};

// Auto-generate email: first 2 letters of apellidoPaterno + matricula + @dcg.edu.mx
const buildEmail = (apellidoPaterno, matricula) => {
  const prefix = apellidoPaterno
    .slice(0, 2)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // remove accents
  return `${prefix}${matricula}@dcg.edu.mx`;
};

const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, name: true, nombre: true, apellidoPaterno: true, apellidoMaterno: true,
        email: true, role: true, matricula: true, semester: true, group: true, createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const createUser = async (req, res) => {
  try {
    const { nombre, apellidoPaterno, apellidoMaterno, password, role, semester, group } = req.body;

    if (!apellidoPaterno || !nombre) {
      return res.status(400).json({ error: 'Nombre y apellido paterno son obligatorios' });
    }

    // Generate ID (matricula) for ALL roles
    const matricula = await generateId(role, semester);

    // Auto-generate email
    const email = buildEmail(apellidoPaterno, matricula);

    // Check email collision (extremely unlikely but safe)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'El correo generado ya existe. Intenta de nuevo.' });

    // Build full name: "ApellidoPaterno ApellidoMaterno Nombre"
    const fullName = [apellidoPaterno, apellidoMaterno, nombre].filter(Boolean).join(' ');

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: fullName,
        nombre,
        apellidoPaterno,
        apellidoMaterno: apellidoMaterno || null,
        email,
        password: passwordHash,
        role,
        matricula,
        semester: semester || null,
        group: group || null,
      }
    });

    // Auto-enroll student in matching courses
    if (role === 'STUDENT' && semester && group) {
      const matchingCourses = await prisma.course.findMany({ where: { semester, group } });
      for (const course of matchingCourses) {
        await prisma.enrollment.create({ data: { userId: user.id, courseId: course.id } }).catch(() => {});
      }
    }

    await prisma.activityLog.create({
      data: { userId: req.user.id, action: 'USER_CREATED', details: `${role} creado: ${fullName} (${matricula})` }
    });

    res.json({
      id: user.id, name: user.name, nombre: user.nombre,
      apellidoPaterno: user.apellidoPaterno, apellidoMaterno: user.apellidoMaterno,
      email: user.email, role: user.role, matricula: user.matricula,
      semester: user.semester, group: user.group, createdAt: user.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellidoPaterno, apellidoMaterno, role, semester, group, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Usuario no encontrado' });

    let matricula = existing.matricula;
    let email = existing.email;

    // Regenerate ID if role or semester changed
    const roleChanged = role && role !== existing.role;
    const semesterChanged = semester && semester !== existing.semester;
    if (roleChanged || semesterChanged || !matricula) {
      matricula = await generateId(role || existing.role, semester || existing.semester);
      const ap = apellidoPaterno || existing.apellidoPaterno || 'us';
      email = buildEmail(ap, matricula);
    }

    // Rebuild full name if names changed
    const ap = apellidoPaterno || existing.apellidoPaterno;
    const am = apellidoMaterno !== undefined ? apellidoMaterno : existing.apellidoMaterno;
    const nb = nombre || existing.nombre;
    const fullName = [ap, am, nb].filter(Boolean).join(' ');

    const data = {
      name: fullName,
      nombre: nb,
      apellidoPaterno: ap,
      apellidoMaterno: am || null,
      email,
      role: role || existing.role,
      matricula,
      semester: (role === 'STUDENT') ? (semester || null) : null,
      group: (role === 'STUDENT') ? (group || null) : null,
    };

    if (password && password.trim() !== '') {
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({ where: { id }, data });

    await prisma.activityLog.create({
      data: { userId: req.user.id, action: 'USER_UPDATED', details: `Usuario ${updated.email} actualizado` }
    });

    res.json({
      id: updated.id, name: updated.name, nombre: updated.nombre,
      apellidoPaterno: updated.apellidoPaterno, apellidoMaterno: updated.apellidoMaterno,
      email: updated.email, role: updated.role, matricula: updated.matricula,
      semester: updated.semester, group: updated.group, createdAt: updated.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    await prisma.activityLog.deleteMany({ where: { userId: id } });
    await prisma.submission.deleteMany({ where: { userId: id } });
    await prisma.enrollment.deleteMany({ where: { userId: id } });
    const teacherCourses = await prisma.course.count({ where: { instructorId: id } });
    if (teacherCourses > 0) return res.status(400).json({ error: 'No se puede eliminar un docente con cursos asignados.' });
    await prisma.user.delete({ where: { id } });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
