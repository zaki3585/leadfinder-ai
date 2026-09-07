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

    let response; for (let i = 0; i < 3; i++) { try { response = await ai.models.generateContent({
      model: i === 0 ? "gemini-3.8-flash" : i === 1 ? "gemini-3.5-flash" : "gemini-flash-latest",
      contents: `Create a premium, recruiter-friendly, ATS-optimized resume and tailored cover letter.

The resume must be clean, modern, concise, achievement-focused, and highly relevant to the provided job description. Use strong professional wording and naturally incorporate relevant keywords from the job description.

IMPORTANT:
- Never invent employers, job titles, dates, degrees, certifications, skills, achievements, numbers, or experience.
- Only use facts provided by the candidate.
- Do not add fake metrics or claims.
- Prioritize the most relevant skills for the target job.
- Keep the resume easy for both ATS systems and human recruiters to scan.
- Use clear sections: Professional Summary, Core Skills, Professional Experience, Education, Certifications, Projects, or other sections only when information is actually provided.
- Do not create empty sections.
- Keep the resume concise and professional.
- Write a polished cover letter specifically tailored to the job description.
- Return clean plain text inside the JSON values; do not use Markdown code fences or extra commentary.

Name: ${name || "Candidate"}

Candidate details:
${details}

Job description:
${job}

Return ONLY valid JSON:
{"resume":"resume text","coverLetter":"cover letter text"}

Do not invent facts, jobs, education, skills or achievements.`
    }); break; } catch (e) { if (i === 2) throw e; await new Promise(r => setTimeout(r, 3000)); } }

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
