const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Say hello in Hindi in one short sentence."
    });

    console.log(response.text);
  } catch (error) {
    console.error("Gemini Error:", error.message);
  }
}

test();
