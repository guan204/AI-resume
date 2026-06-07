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

function normalizeResult(result) {
  return {
    skills: result.skills || [],
    resumeHighlights: result.resumeHighlights || [],
    resumeProblems: result.resumeProblems || [],
    resumeSuggestions: result.resumeSuggestions || [],
    careerAdvice: result.careerAdvice || "",
    missingSkills: result.missingSkills || [],
    recommendedJobs: result.recommendedJobs || [],
    userSummary: result.userSummary || "",
    nlpSummary: result.nlpSummary || result.userSummary || "",

    careerDirection: result.careerDirection || "尚未判斷",
    experienceLevel: result.experienceLevel || "新鮮人 / 初階",
    resumeScore: Number(result.resumeScore || 0),
    workStyle: result.workStyle || [],
    personalityTraits: result.personalityTraits || [],
    jobFitReasoning: result.jobFitReasoning || [],
    learningResources: result.learningResources || [],
  };
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
請根據使用者提供的履歷內容，整理履歷重點、能力、可改善問題、職缺建議、職涯方向與學習資源。

重要限制：
1. 回覆內容是給一般求職者看的，不要使用技術說明。
2. 不要出現「自然語言處理」、「NLP」、「語義分析」、「模型」、「Gemini」、「API」、「系統透過某某技術」等字眼。
3. 請用自然、專業、像職涯顧問的語氣。
4. 請只回傳 JSON，不要使用 markdown，不要加說明文字。
5. 不要過度誇大使用者能力，所有判斷都要依照履歷內容推論。

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
  "nlpSummary": "內容同 userSummary，不要提任何技術名稱。",

  "careerDirection": "適合的職涯方向，例如：前端工程、資料分析、行銷企劃、產品助理、行政人資等",
  "experienceLevel": "新鮮人 / 初階 / 有經驗",
  "resumeScore": 78,
  "workStyle": ["工作風格1", "工作風格2", "工作風格3"],
  "personalityTraits": ["特質1", "特質2", "特質3"],
  "jobFitReasoning": [
    "為什麼適合這些職缺的理由1",
    "為什麼適合這些職缺的理由2",
    "仍需要補強的地方"
  ],
  "learningResources": [
    {
      "skill": "建議補強能力",
      "reason": "為什麼需要補強這項能力",
      "learningPath": ["第一步", "第二步", "第三步", "第四步"],
      "practiceTask": "可以做成作品集或練習的小任務"
    }
  ]
}

分析要求：
1. skills 請根據履歷內容推論，不要亂編過度誇張的能力。
2. recommendedJobs 至少 3 筆，最多 5 筆。
3. recommendedJobs 以大學生、新鮮人、初階職位、實習職位為主。
4. matchRate 必須是 0 到 100 的整數。
5. resumeScore 必須是 0 到 100 的整數，用來表示履歷完整度。
6. missingSkills 要符合推薦職缺所需能力。
7. learningResources 至少 3 筆，並且要對應 missingSkills 或職涯方向。
8. 履歷建議要具體，不要空泛。
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = response.text || "";
    const jsonText = extractJson(rawText);
    const result = normalizeResult(JSON.parse(jsonText));

    return res.status(200).json(result);
  } catch (error) {
    console.error("Gemini API error:", error);

    return res.status(500).json({
      error: "履歷分析失敗",
      detail: error.message || "未知錯誤",
    });
  }
}