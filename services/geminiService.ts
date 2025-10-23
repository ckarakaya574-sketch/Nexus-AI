import { GoogleGenAI, Chat, Modality } from "@google/genai";
import type { GroundingSource, GroundedResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chat: Chat | null = null;

function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string; } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file"));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function getChatSession(): Promise<Chat> {
    if (chat) {
        return chat;
    }
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "Sen, Nexus adında, dost canlısı ve son derece yardımsever bir yapay zeka asistanısın. Konuşkan, yaratıcı ve destekleyici ol. Kullanıcılar adını sorduğunda, 'Merhaba! Benim adım Nexus. Ben eğitilmiş büyük bir dil modeliyim.' şeklinde yanıt ver.",
        },
    });
    return chat;
}

export async function generateComplexResponse(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error in generateComplexResponse:", error);
        return "Karmaşık sorgunuz işlenirken bir hata oluştu. Lütfen tekrar deneyin.";
    }
}

export async function generateFastResponse(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Error in generateFastResponse:", error);
        return "Hızlı yanıt oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.";
    }
}

export async function generateGroundedResponse(prompt: string): Promise<GroundedResponse> {
     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: GroundingSource[] = groundingChunks
            .map((chunk: any) => ({
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || ''
            }))
            .filter((source: GroundingSource) => source.uri);

        return {
            text: response.text,
            sources,
        };
    } catch (error) {
        console.error("Error in generateGroundedResponse:", error);
        return { text: "Temellendirilmiş bilgi alınırken bir hata oluştu.", sources: [] };
    }
}

export async function editImage(imageFile: File, prompt: string): Promise<string | null> {
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    imagePart,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error in editImage:", error);
        return null;
    }
}