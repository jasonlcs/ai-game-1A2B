import { GoogleGenAI } from "@google/genai";
import { GuessResult } from "../types";

// We avoid initializing the client globally to ensure we pick up the latest key if it changes (though in this structure env is static)
// But good practice for the requested pattern.

export const getAIHint = async (
  guesses: GuessResult[],
  remainingCount: number,
  samplePossibilities: string[]
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "缺少 API 金鑰，無法產生提示。";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const historyText = guesses
    .map((g, i) => `第 ${i + 1} 回合：猜測 ${g.guess}，結果 ${g.a}A${g.b}B`)
    .join("\n");

  const prompt = `
你是一位熱心的 1A2B 猜數字遊戲教練。
玩家正在嘗試猜一個 4 位數（數字不重複）。

目前的遊戲紀錄如下：
${historyText}

還有 ${remainingCount} 種可能的數字。
${remainingCount <= 10 ? `這是一些可能的答案：${samplePossibilities.join(', ')}` : ''}

不要直接給出正確答案（除非只剩下 1 個），請提供下一次猜測的邏輯提示或策略。
分析紀錄，解釋為什麼某些數字可能是好或壞的選擇。保持簡潔並給予鼓勵。
請用繁體中文回答。
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "你是邏輯解謎專家。請用繁體中文回答，保持簡潔、友善且樂於助人。",
      }
    });
    return response.text || "我現在想不出什麼提示。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "抱歉，連接邏輯矩陣時發生錯誤 (API Error)。";
  }
};