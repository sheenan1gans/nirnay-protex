require('dotenv').config();
const express = require("express");
const app = express();
const Groq = require("groq-sdk");
const cors = require("cors");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY });
app.use(cors());
app.use(express.json());

// 🧠 Sentiment Function
function getSentiment(text) {
  text = text.toLowerCase();

  if (text.includes("bad") || text.includes("slow") || text.includes("late")) {
    return "Negative";
  }
  if (text.includes("great") || text.includes("amazing") || text.includes("loved")) {
    return "Positive";
  }
  return "Neutral";
}

// 🧠 Issue Extraction
function extractIssues(text) {
  text = text.toLowerCase();

  const issues = [];

  if (text.includes("food")) issues.push("Food Quality");
  if (text.includes("service")) issues.push("Service");
  if (text.includes("ambiance")) issues.push("Ambiance");

  return issues;
}

// 🤖 AI Function
async function generateAIInsights(sentimentData, issueData) {
  const prompt = `
You are a business analyst.

Based on the following data:

Sentiment:
${JSON.stringify(sentimentData)}

Top Issues:
${JSON.stringify(issueData)}

Generate:
1. 3-4 Key Insights
2. 3-4 Actionable Recommendations

Return ONLY valid JSON object. Do not include markdown formatting or explanations.
    
{
  "insights": ["insight 1", "insight 2"],
  "recommendations": ["rec 1", "rec 2"]
}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
  });

let content = response.choices[0].message.content;
content = content.replace(/```json|```/g, "").trim();
return JSON.parse(content);
}

// 🚀 API Route
app.post("/generate-report", async (req, res) => {
  try {
  const feedbacks = req.body.feedbacks;

  if (!feedbacks || feedbacks.length === 0 || !Array.isArray(feedbacks)) {
      return res.status(400).json({ error: "No feedback provided or invalid format" });
    }

  // 🟢 Sentiment Count
  let sentimentCount = {
    Positive: 0,
    Negative: 0,
    Neutral: 0
  };

  feedbacks.forEach(fb => {
    const sentiment = getSentiment(fb);
    sentimentCount[sentiment]++;
  });

  const total = feedbacks.length;

  const sentimentPercent = {
    Positive: ((sentimentCount.Positive / total) * 100).toFixed(1),
    Negative: ((sentimentCount.Negative / total) * 100).toFixed(1),
    Neutral: ((sentimentCount.Neutral / total) * 100).toFixed(1)
  };

  // 🔴 Issue Count (ONLY NEGATIVE)
  let issueCount = {};

  feedbacks.forEach(fb => {
    const sentiment = getSentiment(fb);

    if (sentiment === "Negative") {
      const issues = extractIssues(fb);

      issues.forEach(issue => {
        issueCount[issue] = (issueCount[issue] || 0) + 1;
      });
    }
  });

  const formattedIssues = Object.entries(issueCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([issue, count]) => ({ issue, count }));

// 🤖 AI CALL
    const aiData = await generateAIInsights(sentimentPercent, formattedIssues);

    res.json({
      sentiment: sentimentPercent,
      topIssues: formattedIssues,
      ...aiData
    });

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// 🟢 Root Route (optional)
app.get("/", (req, res) => {
  res.send("AI Report Generator API is running 🚀");
});

// 🟢 Start Server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});