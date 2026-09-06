const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { search } = require("./places");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("."));
app.use(express.static("."));

app.get("/", (req, res) => {
  res.json({
    message: "LeadFinder AI is running!",
    status: "online"
  });
});

app.post("/search-leads", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required"
      });
    }

    const places = await search(query);

    res.json({
      success: true,
      count: places.length,
      leads: places
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("LeadFinder AI server running on port 3000");
});