import {
  createDetectionHistory,
  createTranslationHistory,
} from "../models/historyModel.js";
import {
  analyzeDyslexia,
  generatePracticeSentence,
  translateHandwriting,
} from "./realAiService.js";
import { uploadImageToSupabase } from "./supabaseService.js";

export const detectDyslexia = async ({ userId, fileBuffer, mimetype, originalname }) => {
  const result = await analyzeDyslexia({ fileBuffer, mimetype });
  
  let imageUrl = null;
  try {
    imageUrl = await uploadImageToSupabase({ fileBuffer, mimetype, originalname });
  } catch (error) {
    console.error("Failed to upload to Supabase:", error);
  }

  const history = await createDetectionHistory({
    userId,
    imageUrl: imageUrl,
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

export const translateImageText = async ({ userId, fileBuffer, mimetype, originalname }) => {
  const result = await translateHandwriting({ fileBuffer, mimetype });
  
  let imageUrl = null;
  try {
    imageUrl = await uploadImageToSupabase({ fileBuffer, mimetype, originalname });
  } catch (error) {
    console.error("Failed to upload to Supabase:", error);
  }

  const history = await createTranslationHistory({
    userId,
    imageUrl: imageUrl,
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

export const generateText = async ({ language, wordCount, maxLetters }) =>
  generatePracticeSentence({ language, wordCount, maxLetters });
