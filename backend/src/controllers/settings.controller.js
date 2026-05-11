const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSettings = async (req, res) => {
  try {
    let settings = await prisma.setting.findUnique({ where: { id: 'global' } });
    if (!settings) {
      settings = await prisma.setting.create({
        data: { id: 'global', theme: 'dark', primaryColor: 'indigo' }
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { theme, primaryColor } = req.body;
    const settings = await prisma.setting.upsert({
      where: { id: 'global' },
      update: { theme, primaryColor },
      create: { id: 'global', theme, primaryColor }
    });

    await prisma.activityLog.create({
      data: { userId: req.user.id, action: 'SETTINGS_UPDATED', details: `Tema: ${theme}, Color: ${primaryColor}` }
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
};

module.exports = { getSettings, updateSettings };
