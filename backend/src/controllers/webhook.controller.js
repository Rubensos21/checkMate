const ocrService = require('../services/ocr.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const handleWebhook = async (req, res) => {
  try {
    const payload = req.body;
    const { imageUrl, senderName } = payload;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    console.log(`[Webhook] Processing image for ${senderName || 'Unknown'}: ${imageUrl}`);

    const extractedText = await ocrService.extractTextFromImage(imageUrl);
    console.log(`[Webhook] Extracted text: ${extractedText.substring(0, 50).replace(/\n/g, ' ')}...`);

    const textLower = extractedText.toLowerCase();
    let activityType = 'Desconocido';
    let status = 'PENDING';
    let confidence = 0.5;

    if (textLower.includes('constancia') || textLower.includes('escolar')) {
      activityType = 'Escolar';
      status = 'APPROVED';
      confidence = 0.9;
    } else if (textLower.includes('curso') || textLower.includes('academia')) {
      activityType = 'Academia';
      status = 'APPROVED';
      confidence = 0.85;
    } else if (textLower.includes('vocacional')) {
      activityType = 'Vocacional';
      status = 'APPROVED';
      confidence = 0.88;
    } else {
      status = 'PENDING';
      confidence = 0.3;
    }

    // Guardar en BD real
    const evidence = await prisma.evidence.create({
      data: {
        fullName: senderName || 'Desconocido',
        activityType,
        imageUrl,
        status,
        confidence
      }
    });

    return res.status(200).json({ 
      message: 'Webhook processed successfully',
      evidence,
      extractedText
    });

  } catch (error) {
    console.error('[Webhook Error]', error);
    return res.status(500).json({ error: 'Internal server error processing webhook' });
  }
};

module.exports = {
  handleWebhook
};
