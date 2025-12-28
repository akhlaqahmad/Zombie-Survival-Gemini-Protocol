
import { GoogleGenAI, Type } from "@google/genai";
import { Briefing } from "../types";

export const getBriefing = async (stageId: number, stageName: string): Promise<Briefing> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short, atmospheric zombie apocalypse mission briefing for Stage ${stageId}: ${stageName}. 
      The tone should be gritty, urgent, and cinematic. Include a creative threat assessment.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            threatLevel: { type: Type.STRING }
          },
          required: ["title", "description", "threatLevel"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      title: `Mission ${stageId}: ${stageName}`,
      description: "Static on the radio. Survivors reported movement in the area. Hold your position and eliminate all threats.",
      threatLevel: "UNKNOWN"
    };
  }
};
