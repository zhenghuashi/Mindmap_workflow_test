import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function summarizeTheme(themeLabel: string, ideas: string[]): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "AI synthesis unavailable. Please configure your API key.";
  }

  try {
    const prompt = `Synthesize the following ideas brainstorming about the theme "${themeLabel}" into a single concise, insightful sentence (max 20 words). If multiple ideas are unrelated, focus on the core commonality or most frequent sentiment.

Ideas:
${ideas.map(i => `- ${i}`).join('\n')}

Synthesis:`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text?.trim() || "Failed to generate synthesis.";
  } catch (error) {
    console.error("Gemini summarization error:", error);
    return "Failed to generate synthesis.";
  }
}
