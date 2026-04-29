const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllEvidences = async (req, res) => {
  try {
    const evidences = await prisma.evidence.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(evidences);
  } catch (error) {
    console.error('[Evidence GET Error]', error);
    res.status(500).json({ error: 'Error fetching evidences' });
  }
};

const getStats = async (req, res) => {
  try {
    const total = await prisma.evidence.count();
    const approved = await prisma.evidence.count({ where: { status: 'APPROVED' } });
    const pending = await prisma.evidence.count({ where: { status: 'PENDING' } });
    const rejected = await prisma.evidence.count({ where: { status: 'REJECTED' } });
    
    res.json({ total, approved, pending, rejected });
  } catch (error) {
    console.error('[Stats GET Error]', error);
    res.status(500).json({ error: 'Error fetching stats' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['APPROVED', 'PENDING', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await prisma.evidence.update({
      where: { id },
      data: { status }
    });

    res.json(updated);
  } catch (error) {
    console.error('[Evidence PUT Error]', error);
    res.status(500).json({ error: 'Error updating evidence' });
  }
};

module.exports = {
  getAllEvidences,
  getStats,
  updateStatus
};
