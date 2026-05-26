export const mockAnalyzeDyslexia = async (filePath) => {
  const randomScore = Number((Math.random() * (0.95 - 0.6) + 0.6).toFixed(2));
  const isLikelyDyslexicPattern = randomScore > 0.75;

  return {
    imagePath: filePath,
    predictedText: isLikelyDyslexicPattern
      ? "Ths is smple txt wth dyslxic ptrn"
      : "This is sample text with normal pattern",
    confidence: randomScore,
    resultLabel: isLikelyDyslexicPattern
      ? "LIKELY_DYSLEXIA_PATTERN"
      : "NORMAL_PATTERN",
    notes:
      "Mock AI response. Replace this service with real model inference later.",
  };
};

export const mockTranslateHandwriting = async (filePath) => ({
  imagePath: filePath,
  sourceText: "Ths is hndwrttn sentence",
  translatedText: "This is handwritten sentence",
  sourceLanguage: "id",
  targetLanguage: "en",
  notes:
    "Mock AI response. Replace this service with OCR/translation model later.",
});
