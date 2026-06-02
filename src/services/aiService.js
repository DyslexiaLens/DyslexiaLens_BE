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

export const detectDyslexia = async ({ userId, filePath }) => {
  const result = await analyzeDyslexia(filePath);
  
  let imageUrl = filePath;
  try {
    imageUrl = await uploadImageToSupabase(filePath);
  } catch (error) {
    console.error("Failed to upload to Supabase, falling back to local path:", error);
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

export const translateImageText = async ({ userId, filePath }) => {
  const result = await translateHandwriting(filePath);
  
  let imageUrl = filePath;
  try {
    imageUrl = await uploadImageToSupabase(filePath);
  } catch (error) {
    console.error("Failed to upload to Supabase, falling back to local path:", error);
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
