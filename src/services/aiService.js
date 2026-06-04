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
  let imageUploadWarning = null;
  try {
    imageUrl = await uploadImageToSupabase({ fileBuffer, mimetype, originalname });
  } catch (error) {
    console.error("Failed to upload to Supabase:", error);
    imageUploadWarning = "Gagal mengunggah gambar ke penyimpanan cloud. Gambar tidak akan muncul di riwayat.";
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
    imageUploadWarning,
  };
};

export const translateImageText = async ({ userId, fileBuffer, mimetype, originalname }) => {
  const result = await translateHandwriting({ fileBuffer, mimetype });
  
  let imageUrl = null;
  let imageUploadWarning = null;
  try {
    imageUrl = await uploadImageToSupabase({ fileBuffer, mimetype, originalname });
  } catch (error) {
    console.error("Failed to upload to Supabase:", error);
    imageUploadWarning = "Gagal mengunggah gambar ke penyimpanan cloud. Gambar tidak akan muncul di riwayat.";
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
    imageUploadWarning,
  };
};

export const generateText = async ({ language, wordCount, maxLetters, seed }) =>
  generatePracticeSentence({ language, wordCount, maxLetters, seed });
