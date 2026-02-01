
import { GoogleGenAI, Modality } from "@google/genai";
import { TTSSettings, VoiceTone } from "../types";

export async function generateThaiSpeech(settings: TTSSettings): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
  
  // Construct a prompt that guides the model on tone and language
  let toneInstruction = "";
  switch (settings.tone) {
    case VoiceTone.FORMAL:
      toneInstruction = "สุภาพ เป็นทางการ และชัดเจน";
      break;
    case VoiceTone.CONCISE:
      toneInstruction = "กระชับ ตรงไปตรงมา และรวดเร็ว";
      break;
    case VoiceTone.DYNAMIC:
      toneInstruction = "ตื่นเต้น มีพลัง และเร้าใจ";
      break;
  }

  const prompt = `พูดข้อความต่อไปนี้เป็นภาษาไทยด้วยน้ำเสียงที่ ${toneInstruction}: "${settings.text}"`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: settings.voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("ไม่สามารถสร้างไฟล์เสียงได้ในขณะนี้");
  }

  return base64Audio;
}
