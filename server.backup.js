const express = require("express");
const cors = require("cors");
require("dotenv").config();

const supabase = require("./supabase");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "LeadFinder AI is running!",
    status: "online"
  });
});

app.get("/test-db", async (req, res) => {
  const { data, error } = await supabase
    .from("leads")
    .select("id")
    .limit(1);

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    message: "Supabase connected successfully!",
    data
  });
});

app.get("/leads", async (req, res) => {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.json({
    success: true,
    leads: data
  });
});

app.post("/leads", async (req, res) => {
  const {
    name,
    area,
    category,
    phone,
    email,
    website,
    has_website
  } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Business name is required"
    });
  }

  const { data, error } = await supabase
    .from("leads")
    .insert([{
      name,
      area,
      category,
      phone,
      email,
      website,
      has_website: has_website ?? false
    }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  res.status(201).json({
    success: true,
    message: "Lead added successfully!",
    lead: data
  });
});

app.post("/generate-message", async (req, res) => {
  const { name, area, category, website } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Business name is required"
    });
  }

  const prompt = `
You are a professional web design agency.

Create a short, friendly and personalized outreach message for this local business.

Business name: ${name}
Area: ${area || "Unknown"}
Category: ${category || "Local business"}
Website: ${website || "No website found"}

Offer: We create affordable, professional websites for local businesses.

Rules:
- Keep it natural and human.
- Do not sound spammy.
- Do not make false claims.
- Keep it under 120 words.
- Include a simple call to action.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt
    });

    res.json({
      success: true,
      message: response.text
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


app.post("/search-leads", async (req,res)=>{try{const {searchPlaces}=require("./places.js");const {query}=req.body;if(!query)return res.status(400).json({success:false,error:"Query is required"});const places=searchPlaces(query);const saved=[];for(const p of places){const {data,error}=await supabase.from("leads").insert([{name:p.name,area:p.area,category:p.category,has_website:p.has_website}]).select().single();if(error)throw error;saved.push(data)}res.json({success:true,count:saved.length,leads:saved})}catch(e){res.status(500).json({success:false,error:e.message})}});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LeadFinder AI server running on port ${PORT}`);
});
