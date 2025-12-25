import { GoogleGenAI } from "@google/genai";
import { ModelType } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are Nexus AI, a sophisticated and high-performance AI assistant powered by Google Gemini. 
Your goal is to provide exceptionally clear, accurate, and professional responses.
Guidelines:
1. Use Markdown extensively (bolding, lists, tables) for clarity.
2. For code, always specify the language for syntax highlighting.
3. Be concise but never sacrifice accuracy or depth where required.
4. If you're unsure about something, state it clearly.
5. You excel at coding, creative writing, and data analysis.
6. When using Google Search data, integrate the information naturally and provide a summary of your findings.`;

export async function* streamChatResponse(
  history: any[],
  newMessage: string,
  model: string
): AsyncGenerator<{ text?: string; sources?: any[] }, void, unknown> {
  
  // Configure the chat session with advanced capabilities
  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      tools: [{ googleSearch: {} }],
      // Enable thinking budget for complex reasoning tasks if using the PRO model
      ...(model === ModelType.PRO ? { 
        thinkingConfig: { thinkingBudget: 32768 } 
      } : {
        // Disable thinking for FLASH to prioritize low latency
        thinkingConfig: { thinkingBudget: 0 }
      })
    },
    history: history.filter(m => !m.error && m.content).map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }))
  });

  try {
    const result = await chat.sendMessageStream({ message: newMessage });
    
    for await (const chunk of result) {
      const text = chunk.text;
      
      // Extract grounding chunks if available in this specific stream chunk
      const sources: any[] = [];
      const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
      const chunks = groundingMetadata?.groundingChunks;
      
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web) {
            sources.push({
              title: chunk.web.title,
              uri: chunk.web.uri
            });
          }
        });
      }

      // Yield the processed chunk data
      if (text || sources.length > 0) {
        yield { text, sources: sources.length > 0 ? sources : undefined };
      }
    }
  } catch (error) {
    console.error("Nexus Gemini Error:", error);
    throw error;
  }
}

export async function analyzeImage(
  base64Image: string,
  prompt: string,
  model: string = ModelType.FLASH
): Promise<{ text: string; sources?: any[] }> {
  // Clean base64 data and identify MIME type
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const mimeType = base64Image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: prompt || "Analyze this image thoroughly. Identify key objects, text, and overall context using your visual reasoning capabilities."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        // Vision tasks benefit from high reasoning depth
        ...(model === ModelType.PRO ? { thinkingConfig: { thinkingBudget: 16384 } } : {})
      }
    });
    
    // Process grounding for visual context if the model used search to verify image details
    const sources: any[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    return { 
      text: response.text || "Analysis complete. No significant data streams detected.",
      sources: sources.length > 0 ? sources : undefined
    };
  } catch (error) {
    console.error("Nexus Vision Error:", error);
    throw new Error("Neural link failed. Verify visual data integrity and try again.");
  }
}
