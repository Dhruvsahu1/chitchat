import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI(process.env.GOOGLE_API_KEY);


export const generateResult = async (prompt) => {
    const result =await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return result.text;
}

