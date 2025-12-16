import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateQuotes = async (topic: string, mood: string): Promise<string[]> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning mock data.");
    return [
      "API Key Missing",
      "Feed Me Key",
      "No Token No Drip"
    ];
  }

  try {
    const prompt = `Generate 5 short, witty, viral-worthy T-shirt quotes about "${topic}".
    The vibe is "${mood}". 
    Keep them under 10 words. 
    Make them sound like something a Gen Z person would wear. 
    Use slang if appropriate but keep it readable. 
    Do not use hashtags.
    Return strictly a JSON array of strings.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const quotes = JSON.parse(text);
    return quotes;
  } catch (error) {
    console.error("Error generating quotes:", error);
    return [
      "Error 404: Creativity Not Found",
      "System Overload",
      "Try Again Later"
    ];
  }
};