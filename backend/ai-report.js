const feedbacks = [
  "The food was delicious and the service was excellent",
  "Great food, loved it",
  "Service was slow",
  "Amazing food and ambiance",
  "Bad experience, won't come back",
];

//simulate AI report generation
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

console.log(sentimentPercent);

function extractIssues(text) {
  text = text.toLowerCase();  
  const issues = [];

  if (text.includes("service")) issues.push("Service");
  if (text.includes("food")) issues.push("Food Quality");
  if (text.includes("ambiance")) issues.push("Ambiance");

  return issues;
}

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

console.log(issueCount);

const topIssues = Object.entries(issueCount)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3);

console.log(topIssues);

const finalReport = {
  sentiment: sentimentPercent,

  topIssues: topIssues.map(item => ({
    issue: item[0],
    count: item[1]
  })),

  insights: [
    `${topIssues[0]?.[0] || "N/A"} is the most common issue`,
    `${topIssues[1]?.[0] || "N/A"} is also frequently reported`
  ],

  recommendations: [
    "Improve food preparation quality",
    "Train staff to enhance service experience"
  ]
};

console.log(finalReport);