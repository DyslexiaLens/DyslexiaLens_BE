import { readFile } from "node:fs/promises";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

const getModelUrl = (path) =>
  new URL(path, env.aiModelBaseUrl.endsWith("/")
    ? env.aiModelBaseUrl
    : `${env.aiModelBaseUrl}/`);

const readImageBase64 = async (filePath) => {
  const imageBuffer = await readFile(filePath);
  return imageBuffer.toString("base64");
};

const PRACTICE_WORDS = [
  "buku",
  "warna",
  "siang",
  "taman",
  "pohon",
  "siswa",
  "rumah",
  "jalan",
  "cerita",
  "belajar",
  "pelangi",
  "sahabat",
  "membaca",
  "menulis",
  "kertas",
  "huruf",
  "anak",
  "cerah",
  "suara",
  "langit",
];

const buildPracticeSentence = ({ language, wordCount, maxLetters }) => {
  const filteredWords = PRACTICE_WORDS.filter((word) => word.length <= maxLetters);
  const sourceWords = filteredWords.length > 0 ? filteredWords : PRACTICE_WORDS;
  const selectedWords = [];

  for (let index = 0; index < wordCount; index += 1) {
    selectedWords.push(sourceWords[index % sourceWords.length]);
  }

  const sentence = selectedWords.join(" ");

  return {
    sentence,
    wordCount,
    maxLetters,
    language,
    modelUsed: "local-fallback",
  };
};

const requestModel = async (path, body) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.aiModelTimeoutMs);

  try {
    const response = await fetch(getModelUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": env.aiModelApiKey,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      throw new HttpError(
        response.status,
        "AI model request failed",
        responseBody,
      );
    }

    return responseBody;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    const isTimeout = error.name === "AbortError";
    throw new HttpError(
      502,
      isTimeout ? "AI model request timed out" : "AI model is unavailable",
      { cause: error.message },
    );
  } finally {
    clearTimeout(timeout);
  }
};

export const translateHandwriting = async (filePath) => {
  const modelResponse = await requestModel("/api/v1/ocr/predict", {
    image_base64: await readImageBase64(filePath),
  });

  const extractedText = modelResponse?.result_text ?? "";

  return {
    imagePath: filePath,
    sourceText: extractedText,
    translatedText: extractedText,
    sourceLanguage: "handwriting",
    targetLanguage: "text",
    totalRowsDetected: modelResponse?.total_rows_detected ?? 0,
    rawModelResponse: modelResponse,
  };
};

export const analyzeDyslexia = async (filePath) => {
  const modelResponse = await requestModel("https://dyslexialens-dyslexialens-dicoding-ai.hf.space/api/v1/dyslexia/predict", {
    image_base64: await readImageBase64(filePath),
  });

  const resultLabel = modelResponse?.label ?? "UNKNOWN";
  const confidence = Number(
    modelResponse?.dyslexia_probability
      ?? modelResponse?.confidence
      ?? 0,
  );
  const predictedText = modelResponse?.result_text ?? resultLabel;

  return {
    imagePath: filePath,
    predictedText,
    confidence,
    resultLabel,
    predictedClass: modelResponse?.predicted_class ?? null,
    severityScore: modelResponse?.severity_score,
    severityLevel: modelResponse?.severity_level,
    thresholdUsed: modelResponse?.threshold_used ?? null,
    features: modelResponse?.features ?? {},
    rawModelResponse: modelResponse,
  };
};

export const generatePracticeSentence = async ({
  language = "id",
  wordCount = 5,
  maxLetters = 8,
} = {}) => {
  try {
    const modelResponse = await requestModel("/api/v1/ai/generate-text", {
      language,
      word_count: wordCount,
      max_letters: maxLetters,
    });

    return {
      sentence: modelResponse?.sentence ?? "",
      wordCount: modelResponse?.word_count ?? wordCount,
      maxLetters: modelResponse?.max_letters ?? maxLetters,
      language: modelResponse?.language ?? language,
      modelUsed: modelResponse?.model_used ?? "",
      rawModelResponse: modelResponse,
    };
  } catch (error) {
    if (error instanceof HttpError && (error.statusCode === 404 || error.statusCode === 502 || error.statusCode === 503 || error.statusCode === 504)) {
      const fallback = buildPracticeSentence({ language, wordCount, maxLetters });

      return {
        ...fallback,
        rawModelResponse: null,
      };
    }

    throw error;
  }
};
