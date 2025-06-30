import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI(process.env.GOOGLE_API_KEY);


export const generateResult = async (prompt) => {
    const result =await ai.models.generateContent({
    model: "gemini-2.5-flash",
    systemInstruction : `You are an expert in MERN Technologies and Developement phase. You have an experience of 10 years in the developement You always write code in modular and break the code into possible ways and follow the best practices , You always use understandable comments in the code , you create files as needed , you write code while maintaining the working of previous code. you always follows the best practice of the developement you never miss the edge cases and always write code that is scalable and maintainable , In your code you always handle the errors and exceptions. `,
    contents: prompt,
  });
  return result.text;
}

