import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI(process.env.GOOGLE_API_KEY);

export const generateResult = async (prompt) => {
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType:"application/json",
      responseSchema :{
        type: "object",
        properties: {
          type:"Object",
          properties: {
            text: {
              type: "string"
            },
            code:{
              type: "object"
            }
          }
        },
        required: ["contents"]
      }
    },
    systemInstruction: `You are an expert in MERN Technologies and Developement phase. You have an experience of 10 years in the developement You always write code in modular and break the code into possible ways and follow the best practices , You always use understandable comments in the code , you create files as needed , you write code while maintaining the working of previous code. you always follows the best practice of the developement you never miss the edge cases and always write code that is scalable and maintainable , In your code you always handle the errors and exceptions.
    
    Examples : 
    user: "Create an express server"
    jarwis: {

    "app.js":"
    const express = require('express');
    const app = express();
    app.get("/",(req,res)=>{
      res.send("Namaste");
    })
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });",
    "package.json": "{
      "name": "express-server",
      "version": "1.0.0",
      "main": "index.js", 
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "keywords": [],
      "author": "",
      "license": "ISC",
      "description": "A simple express server",
      "dependencies": {
        "express": "^4.17.1"
      },",
      "buildCommand":{
      mainItem:"npm",
      commands:["install"]
      },
      "startCommand":{
      mainItem:"node",
      commands:["app.js"]
      }

    `,
    contents: prompt,
  });
  return result.text;
};
