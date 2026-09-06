const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function search(query) {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: `Find businesses matching: ${query}

Return ONLY a JSON array.
No markdown. No explanation.

Each item must contain:
name, address, category, phone, website

If phone or website is unknown, use null.
Do not invent data.`
  });

  let text = response.text.trim();

  text = text.replace(/^```json\s*/i, "");
  text = text.replace(/^```\s*/i, "");
  text = text.replace(/\s*```$/i, "");
  text = text.trim();

  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");

  if (start === -1 || end === -1) {
    throw new Error("Gemini did not return a JSON array");
  }

  text = text.slice(start, end + 1);

  return JSON.parse(text);
}

module.exports = { search };




