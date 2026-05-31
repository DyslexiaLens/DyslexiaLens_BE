import { readFile } from "node:fs/promises";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

const getModelUrl = (path) =>
  new URL(path, env.aiModelBaseUrl.endsWith("/")
    ? env.aiModelBaseUrl
    : `${env.aiModelBaseUrl}/`);

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
  const imageBuffer = await readFile(filePath);
  const modelResponse = await requestModel("/predict-sheet", {
    image_base64: imageBuffer.toString("base64"),
  });

  const extractedText = modelResponse?.result_text ?? modelResponse?.text ?? "";

  return {
    imagePath: filePath,
    sourceText: extractedText,
    translatedText: extractedText,
    sourceLanguage: "handwriting",
    targetLanguage: "text",
    rawModelResponse: modelResponse,
  };
};

export const analyzeDyslexia = async (filePath) => {
  const imageBuffer = await readFile(filePath);
  const modelResponse = await requestModel("/predict-sheet", {
    image_base64: imageBuffer.toString("base64"),
  });

  const resultLabel = modelResponse?.label ?? modelResponse?.result_text ?? "UNKNOWN";
  const confidence = Number(
    modelResponse?.dyslexia_probability
      ?? modelResponse?.confidence
      ?? modelResponse?.dyslexia_score
      ?? 0,
  );

  return {
    imagePath: filePath,
    predictedText: resultLabel,
    confidence,
    resultLabel,
    severityScore: modelResponse?.severity_score,
    severityLevel: modelResponse?.severity_level,
    rawModelResponse: modelResponse,
  };
};
