const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const ExcelJS = require('exceljs');
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

const buildEmail = (apellidoPaterno, matricula) => {
  const prefix = apellidoPaterno
    .slice(0, 2)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return `${prefix}${matricula}@dcg.edu.mx`;
};

/**
 * Generate an Excel template for bulk user upload
 */
const downloadTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Usuarios');

    // Header row with styling
    sheet.columns = [
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Apellido Paterno', key: 'apellidoPaterno', width: 20 },
      { header: 'Apellido Materno (opcional)', key: 'apellidoMaterno', width: 22 },
      { header: 'Rol', key: 'role', width: 15 },
      { header: 'Semestre (solo para STUDENT)', key: 'semester', width: 20 },
      { header: 'Grupo (solo para STUDENT)', key: 'group', width: 18 },
      { header: 'Contraseña', key: 'password', width: 20 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'center', wrapText: true };

    // Add example rows
    sheet.addRow({
      nombre: 'Juan',
      apellidoPaterno: 'García',
      apellidoMaterno: 'López',
      role: 'STUDENT',
      semester: '6',
      group: '601',
      password: 'Temp123!',
    });

    sheet.addRow({
      nombre: 'María',
      apellidoPaterno: 'Rodríguez',
      apellidoMaterno: '',
      role: 'STUDENT',
      semester: '6',
      group: '601',
      password: 'Temp456!',
    });

    sheet.addRow({
      nombre: 'Carlos',
      apellidoPaterno: 'López',
      apellidoMaterno: 'Silva',
      role: 'TEACHER',
      semester: '',
      group: '',
      password: 'DocPass123!',
    });

    // Add validation rules sheet
    const infoSheet = workbook.addWorksheet('Instrucciones');
    infoSheet.columns = [
      { header: 'Campo', key: 'field', width: 25 },
      { header: 'Descripción', key: 'description', width: 60 },
    ];

    const infoHeaderRow = infoSheet.getRow(1);
    infoHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    infoHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

    infoSheet.addRow({
      field: 'Nombre',
      description: 'Requerido. Nombre del usuario.',
    });

    infoSheet.addRow({
      field: 'Apellido Paterno',
      description: 'Requerido. Apellido paterno del usuario.',
    });

    infoSheet.addRow({
      field: 'Apellido Materno',
      description: 'Opcional. Dejar vacío si no aplica.',
    });

    infoSheet.addRow({
      field: 'Rol',
      description: 'Requerido. Valores válidos: STUDENT, TEACHER, ADMIN',
    });

    infoSheet.addRow({
      field: 'Semestre',
      description: 'Solo para STUDENT. Ejemplo: 1, 2, 3, 4, 5, 6',
    });

    infoSheet.addRow({
      field: 'Grupo',
      description: 'Solo para STUDENT. Ejemplo: 601, 602',
    });

    infoSheet.addRow({
      field: 'Contraseña',
      description: 'Requerido. Contraseña temporal para el usuario.',
    });

    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=plantilla-usuarios.xlsx');

    await workbook.xlsx.write(res).then(() => {
      res.end();
    }).catch((err) => {
      console.error('Error writing workbook:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error generando plantilla' });
      }
    });
  } catch (error) {
    console.error('Template generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error generando plantilla' });
    }
  }
};

/**
 * Validate a row of data
 */
const validateRow = (row, rowNumber) => {
  const errors = [];

  if (!row.nombre || typeof row.nombre !== 'string' || row.nombre.trim() === '') {
    errors.push('Nombre es requerido');
  }

  if (!row.apellidoPaterno || typeof row.apellidoPaterno !== 'string' || row.apellidoPaterno.trim() === '') {
    errors.push('Apellido Paterno es requerido');
  }

  if (!row.role || !['STUDENT', 'TEACHER', 'ADMIN'].includes(row.role)) {
    errors.push('Rol inválido. Debe ser: STUDENT, TEACHER o ADMIN');
  }

  if (row.role === 'STUDENT') {
    if (!row.semester) {
      errors.push('Semestre es requerido para STUDENT');
    } else if (!/^\d+$/.test(String(row.semester))) {
      errors.push('Semestre debe ser un número');
    }
    if (!row.group) {
      errors.push('Grupo es requerido para STUDENT');
    }
  }

  if (!row.password || typeof row.password !== 'string' || row.password.trim() === '') {
    errors.push('Contraseña es requerida');
  }

  return errors;
};

/**
 * Bulk upload users from Excel file
 */
const bulkUploadUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.getWorksheet('Usuarios');

    if (!sheet) {
      return res.status(400).json({ error: 'Sheet "Usuarios" not found in file' });
    }

    const results = {
      successful: [],
      failed: [],
      summary: {
        total: 0,
        created: 0,
        errors: 0,
      },
    };

    let rowNumber = 2; // Start from row 2 (skip header)

    // Process each row
    for (const row of sheet.getRows(2, sheet.actualRowCount - 1) || []) {
      const rowData = {
        nombre: row.getCell('A').value,
        apellidoPaterno: row.getCell('B').value,
        apellidoMaterno: row.getCell('C').value,
        role: row.getCell('D').value,
        semester: row.getCell('E').value,
        group: row.getCell('F').value,
        password: row.getCell('G').value,
      };

      // Skip empty rows
      if (!rowData.nombre && !rowData.apellidoPaterno) {
        rowNumber++;
        continue;
      }

      results.summary.total++;

      // Validate row
      const validationErrors = validateRow(rowData, rowNumber);
      if (validationErrors.length > 0) {
        results.failed.push({
          row: rowNumber,
          data: rowData,
          errors: validationErrors,
        });
        results.summary.errors++;
        rowNumber++;
        continue;
      }

      try {
        // Sanitize data
        const nombre = String(rowData.nombre).trim();
        const apellidoPaterno = String(rowData.apellidoPaterno).trim();
        const apellidoMaterno = rowData.apellidoMaterno ? String(rowData.apellidoMaterno).trim() : null;
        const role = String(rowData.role).trim();
        const semester = row.getCell('E').value ? String(row.getCell('E').value).trim() : null;
        const group = row.getCell('F').value ? String(row.getCell('F').value).trim() : null;
        const password = String(rowData.password).trim();

        // Generate ID
        const matricula = await generateId(role, semester);
        const email = buildEmail(apellidoPaterno, matricula);

        // Check email collision
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          results.failed.push({
            row: rowNumber,
            data: rowData,
            errors: [`Email generado ya existe: ${email}`],
          });
          results.summary.errors++;
          rowNumber++;
          continue;
        }

        // Create user
        const fullName = [apellidoPaterno, apellidoMaterno, nombre].filter(Boolean).join(' ');
        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
          data: {
            name: fullName,
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            email,
            password: passwordHash,
            role,
            matricula,
            semester: (role === 'STUDENT') ? semester : null,
            group: (role === 'STUDENT') ? group : null,
          },
        });

        // Auto-enroll student in matching courses
        if (role === 'STUDENT' && semester && group) {
          const matchingCourses = await prisma.course.findMany({ where: { semester, group } });
          for (const course of matchingCourses) {
            await prisma.enrollment.create({ data: { userId: user.id, courseId: course.id } }).catch(() => {});
          }
        }

        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'BULK_USER_CREATED',
            details: `${role} creado (bulk): ${fullName} (${matricula})`,
          },
        });

        results.successful.push({
          row: rowNumber,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            matricula: user.matricula,
            role: user.role,
          },
        });

        results.summary.created++;
      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        results.failed.push({
          row: rowNumber,
          data: rowData,
          errors: [error.message || 'Error al procesar fila'],
        });
        results.summary.errors++;
      }

      rowNumber++;
    }

    // Create activity log for bulk import
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'BULK_UPLOAD',
        details: `Bulk upload completado: ${results.summary.created} creados, ${results.summary.errors} errores`,
      },
    });

    res.json(results);
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Failed to process bulk upload' });
  }
};

module.exports = {
  downloadTemplate,
  bulkUploadUsers,
};
