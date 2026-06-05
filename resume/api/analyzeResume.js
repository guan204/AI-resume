import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function extractJson(text) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("回傳內容不是有效 JSON");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST method is allowed",
    });
  }

  try {
    const { resumeText, fileName } = req.body || {};

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "缺少 GEMINI_API_KEY，請到 Vercel Environment Variables 設定。",
      });
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({
        error: "履歷文字內容太少，請貼上更完整的履歷內容。",
      });
    }

    const prompt = `
你是一個「履歷分析與職缺推薦系統」。
請根據使用者提供的履歷內容，整理履歷重點、能力、可改善問題、職缺建議與職涯建議。

重要限制：
1. 回覆內容是給一般求職者看的，不要使用技術說明。
2. 不要出現「自然語言處理」、「NLP」、「語義分析」、「模型」、「Gemini」、「API」、「系統透過某某技術」等字眼。
3. 請用自然、專業、像職涯顧問的語氣。
4. 請只回傳 JSON，不要使用 markdown，不要加說明文字。

檔案名稱：
${fileName || "未提供"}

履歷內容：
${resumeText}

請依照以下 JSON 格式回傳：

{
  "skills": ["能力1", "能力2", "能力3"],
  "resumeHighlights": ["履歷亮點1", "履歷亮點2", "履歷亮點3"],
  "resumeProblems": ["可改善問題1", "可改善問題2", "可改善問題3"],
  "resumeSuggestions": ["履歷優化建議1", "履歷優化建議2", "履歷優化建議3"],
  "careerAdvice": "一段適合大學生或新鮮人的職涯建議",
  "missingSkills": ["建議補強能力1", "建議補強能力2", "建議補強能力3"],
  "recommendedJobs": [
    {
      "title": "職缺名稱",
      "company": "公司名稱",
      "location": "地點",
      "type": "全職 / 實習 / 兼職",
      "matchRate": 85,
      "requiredSkills": ["需求能力1", "需求能力2"],
      "reason": "推薦原因，請用使用者看得懂的方式說明",
      "missingSkills": ["建議補強能力1"]
    }
  ],
  "userSummary": "用一段話說明這份履歷的主要優勢、適合方向與需要補強的地方。不要提任何技術名稱。",
  "nlpSummary": "內容同 userSummary，不要提任何技術名稱。"
}

分析要求：
1. 能力請根據履歷內容推論，不要亂編過度誇張的能力。
2. 推薦職缺以大學生、新鮮人、初階職位、實習職位為主。
3. recommendedJobs 至少 3 筆，最多 5 筆。
4. matchRate 必須是 0 到 100 的整數。
5. missingSkills 要符合推薦職缺所需能力。
6. 履歷建議要具體，不要空泛。
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = response.text || "";
    const jsonText = extractJson(rawText);
    const result = JSON.parse(jsonText);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Gemini API error:", error);

    return res.status(500).json({
      error: "履歷分析失敗",
      detail: error.message || "未知錯誤",
    });
  }
}