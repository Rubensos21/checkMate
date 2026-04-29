const Tesseract = require('tesseract.js');

const extractTextFromImage = async (imageUrl) => {
  try {
    console.log(`[OCR] Starting extraction for ${imageUrl}`);
    const result = await Tesseract.recognize(imageUrl, 'spa', {
      logger: m => console.log(`[OCR Progress] ${m.status}: ${Math.round(m.progress * 100)}%`)
    });
    return result.data.text;
  } catch (error) {
    console.error('[OCR Error]', error);
    throw error;
  }
};

module.exports = {
  extractTextFromImage
};
