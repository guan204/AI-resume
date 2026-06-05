import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method is allowed" });
  }

  try {
    const { resumeText } = req.body;

    if (!resumeText || resumeText.trim() === "") {
      return res.status(400).json({ error: "缺少履歷文字內容" });
    }

    const prompt = `
你是一個專業的履歷分析與職缺推薦系統。
請根據以下履歷內容，進行 AI 履歷分析與職缺推薦。

履歷內容：
${resumeText}

請只回傳 JSON，不要加 markdown，不要加說明文字。
JSON 格式如下：

{
  "skills": ["技能1", "技能2"],
  "resumeHighlights": ["履歷亮點1", "履歷亮點2"],
  "resumeProblems": ["履歷問題1", "履歷問題2"],
  "resumeSuggestions": ["優化建議1", "優化建議2"],
  "careerAdvice": ["職涯建議1", "職涯建議2"],
  "recommendedJobs": [
    {
      "title": "職缺名稱",
      "company": "公司名稱",
      "location": "地點",
      "matchRate": 85,
      "reason": "推薦原因",
      "requiredSkills": ["技能1", "技能2"],
      "missingSkills": ["缺少技能1"]
    }
  ],
  "missingSkills": ["缺少技能1", "缺少技能2"]
}

請推薦 3 到 5 個適合新鮮人或大學生的職缺。
matchRate 請用 0 到 100 的整數。
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text || "";

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(text);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Gemini analyze error:", error);
    return res.status(500).json({
      error: "Gemini 分析失敗",
      detail: error.message,
    });
  }
}