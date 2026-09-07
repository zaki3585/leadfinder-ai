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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a professional ATS-friendly resume and tailored cover letter.

Name: ${name || "Candidate"}

Candidate details:
${details}

Job description:
${job}

Return ONLY valid JSON:
{"resume":"resume text","coverLetter":"cover letter text"}

Do not invent facts, jobs, education, skills or achievements.`
    });

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
