import {
  createDetectionHistory,
  createTranslationHistory,
} from "../models/historyModel.js";
import { analyzeDyslexia, translateHandwriting } from "./realAiService.js";

export const detectDyslexia = async ({ userId, filePath }) => {
  const result = await analyzeDyslexia(filePath);
  const history = await createDetectionHistory({
    userId,
    imageUrl: filePath,
    predictedText: result.predictedText,
    confidence: result.confidence,
    resultLabel: result.resultLabel,
    rawResponse: JSON.stringify(result),
  });

  return {
    result,
    history,
  };
};

export const translateImageText = async ({ userId, filePath }) => {
  const result = await translateHandwriting(filePath);
  const history = await createTranslationHistory({
    userId,
    imageUrl: filePath,
    sourceText: result.sourceText,
    translatedText: result.translatedText,
    sourceLanguage: result.sourceLanguage,
    targetLanguage: result.targetLanguage,
    rawResponse: JSON.stringify(result),
  });

  return {
    result,
    history,
  };
};
