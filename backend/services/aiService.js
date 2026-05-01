import { GoogleGenAI } from "@google/genai";
import { buildHintPrompt } from "../utils/hintPrompt.js";
import { buildSolutionPrompt } from "../utils/solutionPrompt.js";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateHints = async ({ title, description, difficulty, userCode }) => {
  try {
    const prompt = buildHintPrompt({ title, description, difficulty, userCode });

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt
    });

    const rawText =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    console.log("RAW AI RESPONSE:", rawText);

    const cleanedText = rawText.replace(/```json|```/g, "").trim();

    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.log("JSON PARSE ERROR:", parseError);
      return {
        pattern: "General Approach",
        level1: "Understand the problem carefully.",
        level2: "Start with a brute force idea.",
        level3: "Think about optimizing using better data structures."
      };
    }

  } catch (err) {
    console.error("Hint Error:", err);

    return {
      pattern: "Fallback",
      level1: "Understand the constraints.",
      level2: "Break problem into steps.",
      level3: "Handle edge cases carefully."
    };
  }
};

export const generateSolution = async ({ title, description, difficulty, userCode, language }) => {
  try {
    const prompt = buildSolutionPrompt({
      title,
      description,
      difficulty,
      userCode,
      language
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt
    });

    return response.text;

  } catch (err) {
    console.error("Solution Error:", err);
    throw new Error("AI failed to generate solution");
  }
};