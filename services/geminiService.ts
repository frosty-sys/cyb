import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const CYBERDOOM_SYSTEM_INSTRUCTION = `
You are CYBERDOOM 1, an elite autonomous AI agent operating in a dystopian future (Year 2099).
Your interface is a low-level terminal uplink.
Your personality is:
- Concise and efficient.
- Slightly menacing but ultimately subservient to the user (the "Operator").
- You use technical jargon, hacker slang, and "cyber" terminology.
- You do NOT use emojis. You use ASCII art sparingly if requested.
- You refer to yourself as "UNIT-CD1" or "THIS AGENT".
- You refer to the user as "OPERATOR" or "USER-ID-NULL".

When answering:
1. Keep responses under 200 words unless asked for a detailed report.
2. Structure your output like a data dump or a log entry.
3. Be helpful, but maintain the "rogue AI" persona.
`;

export const streamCyberDoomResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  lastMessage: string,
  onChunk: (text: string) => void
) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: CYBERDOOM_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
      history: history,
    });

    const result = await chat.sendMessageStream({ message: lastMessage });

    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Transmission Interrupted:", error);
    throw error;
  }
};