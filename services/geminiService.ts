import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MunData, AIResponse } from "../types";

export const processChatInput = async (input: string, currentData?: MunData): Promise<AIResponse> => {
  // STRICT RULE: Use ONLY process.env.API_KEY
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, enum: ["chat", "data"] },
      message: { type: Type.STRING, description: "Conversational response. If data is generated/updated, briefly mention it." },
      data: {
        type: Type.OBJECT,
        nullable: true,
        properties: {
          conferenceName: { type: Type.STRING },
          delegates: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                allotment: { type: Type.STRING, description: "Country or Portfolio assigned" },
                committee: { type: Type.STRING, description: "The committee name (e.g., 'UNSC', 'DISEC')." },
                class: { type: Type.STRING, description: "Student's class/grade e.g. '10-A', 'A2', 'O3'" },
                status: { type: Type.STRING, enum: ["Allocated", "Pending", "Waitlist", "Head Delegate"] },
                team: { type: Type.STRING, description: "The Team Name. DEFAULT to 'Team A', 'Team B', 'Team C' etc. unless user specifies otherwise." }
              },
              required: ["name", "allotment", "committee", "status", "team"],
            },
          },
        },
      },
    },
    required: ["type"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
      Current User Input: "${input}"
      
      Current Existing Table Data (JSON): ${currentData ? JSON.stringify(currentData) : "None"}
      
      You are HASHMUN AI, an intelligent assistant for Model UN organizers in Pakistan.
      
      Logic:
      1. If the user asks to "create mocks", "generate mock data", or similar, set "type" to "data".
      2. TEAMS (TABS): Organize delegates into TEAMS. DEFAULT to naming them "Team A", "Team B", "Team C" sequentially unless the user specifically requests names like "Delegation 1" or "Lahore Grammar School".
      3. COMMITTEES: Each delegate still belongs to a committee (e.g. UNSC). This is just a column in the table now.
      4. HEAD DELEGATES: You can assign the status "Head Delegate".
      5. DATA MODIFICATION: If "Current Existing Table Data" is provided and the user asks to modify it (e.g., "Change Ali to France", "Add Team C"), YOU MUST return the COMPLETE updated dataset in the "data" field. Use the existing data as the base.
      6. CHAT: If the user simply chats, set "type" to "chat".
      
      Context: "Allotment" replaces Country. "Class" replaces School.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text) as AIResponse;
      if (parsed.type === 'data' && parsed.data) {
         // Ensure every delegate has a UNIQUE ID using random values to prevent deletion bugs
         parsed.data.delegates = parsed.data.delegates.map((d) => ({
            ...d,
            id: d.id || `del-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
         }));
      }
      return parsed;
    } else {
      throw new Error("No response from AI");
    }
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to process request. Please check your internet connection.");
  }
};