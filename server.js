const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("."));

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

app.post("/generate-resume", async (req, res) => {
  try {
    const { name, details, job } = req.body;
    if (!details || !job) return res.status(400).json({success:false,error:"Details and job description are required"});

    let response;
    const models = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"];
    let lastError;

    for (const model of models) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          response = await ai.models.generateContent({
            model,
            contents: `Create a premium, recruiter-friendly, ATS-optimized resume and tailored cover letter.

Name: ${name || "Candidate"}

Candidate details:
${details}

Job description:
${job}

Rules:
- Never invent employers, dates, degrees, certifications, skills, achievements or experience.
- Use only information supplied by the candidate.
- Never claim "extensive experience", "proven track record", "expert", "years of experience", or specific achievements unless explicitly supported by the candidate details.
- Naturally prioritize relevant job-description keywords without keyword stuffing.
- Make the resume concise, professional and easy for ATS and recruiters to scan.
- Use clear sections and do not create empty sections.
- Keep spacing between words and sentences correct.
- Use consistent capitalization: AI, SEO, WordPress, ChatGPT, Canva, Google Sheets.
- Avoid spelling mistakes, broken words, duplicated words, and awkward phrases.
- Do not use Markdown tables, emojis, decorative symbols, or excessive formatting.
- For missing experience or education, do not invent content.
- Prefer strong, truthful wording over exaggerated claims.
- Write a polished job-specific cover letter.
- Return ONLY valid JSON:
{"resume":"resume text","coverLetter":"cover letter text"}` 
          });
          break;
        } catch (e) {
          lastError = e;
          const wait = Math.min(30000, 2000 * Math.pow(2, attempt)) + Math.floor(Math.random() * 1000);
          if (attempt < 2) await new Promise(r => setTimeout(r, wait));
        }
      }
      if (response) break;
    }

    if (!response) throw lastError || new Error("All AI models are temporarily unavailable");

    let text = response.text.trim();
    text = text.replace(/^```json\s*/i, "");
    text = text.replace(/^```\s*/i, "");
    text = text.replace(/\s*```$/i, "");

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) throw new Error("Invalid AI response");

    const data = JSON.parse(text.slice(start, end + 1));
    res.json({success:true,resume:data.resume,coverLetter:data.coverLetter});
  } catch (error) {
    res.status(500).json({success:false,error:error.message});
  }
});

app.get("/", (req,res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("ResumePro AI running");
});
