
import { GoogleGenAI } from "@google/genai";
import { GeminiResponse } from "../types";

export const editImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<GeminiResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // The base64 string might include the data prefix, we need to strip it for the API
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    let imageUrl: string | null = null;
    let text: string | null = null;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          text = part.text;
        }
      }
    }

    return { imageUrl, text };
  } catch (error) {
    console.error("Gemini Image Editing Error:", error);
    throw error;
  }
};
