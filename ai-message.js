const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateMessage(lead) {
  const prompt = `
You are a professional web design agency.

Create a short, friendly and personalized outreach message for this local business.

Business name: ${lead.name}
Area: ${lead.area || "Unknown"}
Category: ${lead.category || "Local business"}
Website: ${lead.website || "No website found"}

Offer: We create affordable, professional websites for local businesses.

Rules:
- Keep it natural and human.
- Do not sound spammy.
- Do not make false claims.
- Keep it under 120 words.
- Include a simple call to action.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt
  });

  return response.text;
}

generateMessage({
  name: "Test Restaurant",
  area: "Malegaon",
  category: "Restaurant",
  website: null
})
  .then(message => {
    console.log("\n--- AI MESSAGE ---\n");
    console.log(message);
  })
  .catch(error => {
    console.error("Gemini Error:", error.message);
  });
