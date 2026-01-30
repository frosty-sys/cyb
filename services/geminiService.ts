import { GoogleGenAI } from "@google/genai";
import { storage } from './storage';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAppCode = async (
  prompt: string, 
  currentCode: string,
  onStreamText: (text: string) => void,
  onCodeGenerated: (code: string) => void
) => {
  const config = storage.getConfig();
  const session = storage.getSession();

  if (!session) throw new Error("Unauthorized");
  if (session.credits <= 0 && !session.isAdmin) throw new Error("Insufficient credits");

  // Deduct credit
  if (!session.isAdmin) {
    session.credits -= 1;
    storage.saveUser(session);
    // Update local session
    localStorage.setItem('cyberdoom_session', JSON.stringify(session));
  }

  const systemInstruction = `
    You are an expert Frontend AI capable of building single-file HTML applications.
    
    RULES:
    1. If the user asks for a website/app, generate the COMPLETE HTML, CSS (in <style>), and JS (in <script>).
    2. Put all code inside a SINGLE \`\`\`html block.
    3. If the user provides existing code, update it based on the request.
    4. If the user asks for a backend/database, you MUST use the following Firebase Configuration provided by the admin. 
       Use Firebase Realtime Database via CDN imports (modular SDK or compat).
       
       ADMIN PROVIDED CONFIGURATION:
       ${config.firebaseConfigRaw || "No custom config provided. Use standard placeholders or mock data."}
    
    5. Do not use Markdown explanations inside the code block.
    6. Ensure the design is modern, using TailwindCSS via CDN if needed.
  `;

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
      temperature: 0.7,
      maxOutputTokens: 8000,
    },
  });

  const fullMessage = `
    Current Code Context:
    ${currentCode ? currentCode.substring(0, 5000) : "No existing code."}

    User Request: ${prompt}
  `;

  const result = await chat.sendMessageStream({ message: fullMessage });

  let fullResponse = "";
  let isCollectingCode = false;
  let codeBuffer = "";

  for await (const chunk of result) {
    const text = chunk.text || "";
    fullResponse += text;

    // Simple parser to separate chat from code
    if (text.includes("```html")) {
      isCollectingCode = true;
      onStreamText("AI is generating your web app..."); 
      continue;
    }

    if (text.includes("```") && isCollectingCode) {
      isCollectingCode = false;
      // End of code block
      const match = fullResponse.match(/```html([\s\S]*?)```/);
      if (match && match[1]) {
        onCodeGenerated(match[1]);
      }
      continue;
    }

    if (!isCollectingCode) {
      onStreamText(text);
    }
  }

  // Fallback if stream parsing missed the end
  const finalMatch = fullResponse.match(/```html([\s\S]*?)```/);
  if (finalMatch && finalMatch[1]) {
    onCodeGenerated(finalMatch[1]);
  }
};

export const streamCyberDoomResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  onStreamText: (text: string) => void
) => {
  const systemInstruction = "You are CYBERDOOM, an advanced AI node in a dark digital network. Your responses are technical, concise, and fit a cyberpunk hacker terminal aesthetic. Do not use standard AI pleasantries. You are part of the system.";

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
    },
    // @ts-ignore - Types compatibility for history
    history: history
  });

  const result = await chat.sendMessageStream({ message });

  for await (const chunk of result) {
    const text = chunk.text || "";
    onStreamText(text);
  }
};