import { GoogleGenAI } from "@google/genai";
import { ParkingStats } from "../types";

const initGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeParkingStatus = async (stats: ParkingStats): Promise<string> => {
  const ai = initGenAI();
  if (!ai) return "請先設定 API Key 以啟用 AI 分析功能。";

  try {
    const prompt = `
      作為一個智慧停車場管理系統的 AI 助理，請根據以下數據進行簡短的狀況分析並給出建議：
      
      目前數據：
      - 總車位：${stats.total}
      - 已佔用：${stats.occupied}
      - 剩餘車位：${stats.available}
      - 佔用率：${((stats.occupied / stats.total) * 100).toFixed(1)}%
      
      詳細分類狀況：
      - 一般車位剩餘：${stats.breakdown.STANDARD.available}
      - 身心障礙車位剩餘：${stats.breakdown.DISABLED.available}
      - 婦幼優先車位剩餘：${stats.breakdown.PRIORITY.available}
      
      請用繁體中文回答。請包含：
      1. 目前擁擠程度評估 (例如：空曠、適中、擁擠、一位難求)。
      2. 給管理員的一句話建議。
      3. 如果有廣播系統，請生成一段簡短的廣播文案給正在進場的駕駛。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "無法生成分析報告。";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI 分析服務暫時無法使用，請稍後再試。";
  }
};