const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dcg_super_secret_key';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Allow login by email OR matricula
    let user = null;
    if (/^\d{6}$/.test(email)) {
      // It's a 6-digit matricula
      user = await prisma.user.findUnique({ where: { matricula: email } });
    } else {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });

    await prisma.activityLog.create({
      data: { userId: user.id, action: 'LOGIN', details: 'Usuario inició sesión' }
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, matricula: user.matricula } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, matricula: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
};

module.exports = { login, getMe, JWT_SECRET };
