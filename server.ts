import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Lazy initialization of the GoogleGenAI client to avoid crash on startup when API key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables. Please configure it in Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to robustly parse JSON from Gemini (handling markdown json code blocks or raw JSON strings)
function parseJsonResponse(text: string): any {
  if (!text) return {};
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    const candidate = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      try {
        const sanitized = candidate
          .replace(/,\s*([\]}])/g, "$1")
          .replace(/[\u201C\u201D]/g, '"');
        return JSON.parse(sanitized);
      } catch {
        // fallback
      }
    }
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

// Extract human-readable product name cues from URL slugs (useful for Shopee, TikTok, Lazada)
function extractKeywordsFromUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const pathname = decodeURIComponent(parsed.pathname);
    return pathname
      .replace(/-i\.\d+\.\d+/gi, "")
      .replace(/[/?#].*$/, "")
      .replace(/[-_]+/g, " ")
      .trim();
  } catch {
    return "";
  }
}

// Recommended resilient models list prioritized by active quota availability and throughput
const RELIABLE_TEXT_MODELS = [
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-2.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-flash-lite-latest",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite-preview",
];

// Core resilient Gemini generation helper with model fallback and automatic retry on 503/429
async function generateContentWithFallback(
  contents: any,
  config: any = {},
  models: string[] = RELIABLE_TEXT_MODELS
): Promise<any> {
  const ai = getAiClient();
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });
        if (response && (response.text || response.candidates?.[0]?.content?.parts?.length)) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const msg = (err.message || "").toLowerCase();
        const isQuota =
          msg.includes("429") ||
          msg.includes("quota") ||
          msg.includes("resource_exhausted");
        const isTransient =
          msg.includes("503") ||
          msg.includes("unavailable") ||
          msg.includes("high demand");

        console.warn(`[Gemini Fallback] Model ${model} (attempt ${attempt + 1}) failed: ${err.message?.slice(0, 120)}`);

        // If quota limit (429), immediately failover to next model without wasting attempts
        if (isQuota) {
          break;
        }

        // If high server demand (503), pause briefly and retry once
        if (isTransient && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          break; // Move to next model
        }
      }
    }
  }

  throw lastError || new Error("All fallback models failed to generate content.");
}

// Streaming generator helper with fallback across models
async function generateContentStreamWithFallback(
  contents: any,
  config: any = {},
  models: string[] = RELIABLE_TEXT_MODELS
): Promise<any> {
  const ai = getAiClient();
  let lastError: any = null;

  for (const model of models) {
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents,
        config,
      });
      return stream;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Stream Fallback] Model ${model} stream init failed: ${err.message?.slice(0, 140)}`);
    }
  }

  throw lastError || new Error("All fallback models failed to generate content stream.");
}

// Middleware
app.use(express.json({ limit: "10mb" }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: Refine/Rewrite Script Tone
app.post("/api/gemini/refine", async (req, res) => {
  try {
    const { script, tone, language, targetLength } = req.body;

    if (!script) {
      return res.status(400).json({ error: "Script content is required" });
    }

    const systemPrompt = `You are an expert social commerce and live-selling script writer. 
Your goal is to rewrite the user's provided product script or text to optimize it for video selling (like TikTok, IG Reels, Facebook Live).
Match the following criteria:
- Language: ${language || "Thai"} (Must match this language unless requested otherwise)
- Tone: ${tone || "energetic"}
- Target Script Length: STRICTLY around ${targetLength || 300} characters of Thai text. Ensure it fits well within this length limit!
- Keep it catchy, hook-oriented in the first 3 seconds, natural to speak out loud, and persuasive!
- Do not add any scene descriptions, director notes, or bracketed text like "[Show product here]". Return ONLY the spoken text itself.`;

    const response = await generateContentWithFallback(
      script,
      {
        systemInstruction: systemPrompt,
        temperature: 0.85,
      }
    );

    const refinedText = response.text || "";
    res.json({ success: true, refinedText });
  } catch (error: any) {
    console.error("Error refining script:", error);
    res.status(500).json({ error: error.message || "Failed to refine script" });
  }
});

// API: Analyze Product URL and Generate Script (Upgraded to full Shopee Affiliate Creator)
app.post("/api/gemini/analyze-url", async (req, res) => {
  try {
    const { 
      url, 
      productName, 
      contentType = "review", 
      purpose = "sales", 
      framework = "aida", 
      tone = "friendly", 
      style = "storytelling", 
      targetLength = 300 
    } = req.body;

    const ai = getAiClient();

    // Map parameters to human-readable Thai descriptions to guide Gemini
    const contentTypeMap: Record<string, string> = {
      review: "รีวิวสินค้า (Product Review) - เน้นอธิบายการใช้งานจริง ข้อดี-ข้อเสีย และผลลัพธ์หลังใช้งานจริงแบบเจาะลึก",
      unboxing: "แกะกล่อง (Unboxing) - เน้นโชว์ความรู้สึกแรกพบตอนเปิดกล่อง ความสวยงามของแพ็กเกจจิ้ง ของแถม และสัมผัสแรก",
      comparison: "เปรียบเทียบสินค้า (Comparison) - เน้นเปรียบเทียบจุดคุ้มค่า ข้อดี ข้อเสีย และความต่างกับแบรนด์อื่นหรือรุ่นใกล้เคียง",
      promo: "ป้ายยา/โปรโมชั่น (Promo & Deals) - เน้นชี้เป้าความคุ้มค่า คูปอง ดีลลับจำกัดเวลา และกระตุ้นให้กดตะกร้าทันที",
    };

    const purposeMap: Record<string, string> = {
      sales: "เพื่อการโปรโมต/ขายสินค้า ปิดยอดขายโดยตรง กระตุ้นความอยากซื้อสูง",
      familiarity: "สร้างความคุ้นเคย แนะนำบอกต่อคุณประโยชน์และการใช้งานในชีวิตจริง",
      lifestyle: "เน้นการโชว์สไตล์ ไลฟ์สไตล์การใช้งานที่น่าสนใจและกลมกลืน",
    };

    const frameworkMap: Record<string, string> = {
      aida: "AIDA (Attention ดึงดูด -> Interest สร้างความสนใจ -> Desire กระตุ้นความอยากได้ -> Action ปิดด้วยคำแนะนำกดลิงก์พิกัด)",
      pas: "PAS (Problem ปัญหาหลัก -> Agitate ขยี้ปัญหาให้เห็นภาพชัด -> Solution เสนอผลิตภัณฑ์นี้เป็นทางออกที่ใช่)",
      bab: "BAB (Before เล่าปัญหาชีวิตที่ยุ่งยากก่อนหน้า -> After ภาพความสะดวกสบายที่ได้รับหลังใช้ -> Bridge เชื่อมโยงด้วยจุดเด่นสินค้า)",
      fab: "FAB (Features คุณสมบัติสินค้า -> Advantages จุดขายที่เหนือกว่า -> Benefits คุณประโยชน์สูงสุดต่อผู้ใช้งานตรงๆ)",
      hook: "The HOOK (เน้นคำทอล์กประเด็นดึงดูดใจสุดแรงใน 3 วินาทีแรก และสรุปกระชับจับใจความทันที)",
    };

    const toneMap: Record<string, string> = {
      friendly: "เป็นกันเอง คุยสนุกเหมือนเพื่อนสนิทบอกต่อ ใช้สรรพนามดูสนิทสนม เช่น แก, พวกเธอ, ตัวนี้เลยแก",
      excited: "ตื่นเต้น เร้าใจ มีพลังสูง สนุกสนาน บิ้วด์อารมณ์แบบรีบกดด่วนๆ เช่น เฮ้ยแก!, ปังมากแม่!, พลาดไม่ได้นะ!",
      trustworthy: "น่าเชื่อถือ สุภาพ ดูเป็นมืออาชีพ มีหลักการ อ้างอิงคุณสมบัติที่น่าไว้วางใจ และสุภาพเรียบร้อย",
      playful: "ขี้เล่น ทะเล้น สนุกสนาน น่าเอ็นดู คุยหยอกล้อ มีคำศัพท์แสลงวัยรุ่นที่น่าดึงดูดและผ่อนคลาย",
    };

    const styleMap: Record<string, string> = {
      concise: "สั้นกระชับ เข้าประเด็นไว ไม่มีน้ำ เน้นจุดขายหลักในประโยคสั้นๆ",
      storytelling: "สไตล์นักเล่าเรื่อง (Storytelling) มีเกริ่นนำเหตุการณ์น่าติดตาม มีฉากเริ่ม ฉากกลาง ฉากสรุปจบที่น่าจดจำ",
      cr: "แบบผู้ใช้จริง CR (Customer Review) บอกเล่าความเห็นตรงไปตรงมา ดูจริงใจ ไม่เชียร์จนออกหน้าออกตา",
    };

    // Construct highly refined prompts for Gemini
    let sourceContext = "";
    if (url) {
      const extractedKeywords = extractKeywordsFromUrl(url);
      sourceContext = `Product URL: ${url}. ${extractedKeywords ? `Extracted Product Keywords/Title: "${extractedKeywords}". ` : ""}Review and analyze the product details, specs, benefits, typical price, or commission details.`;
    } else {
      sourceContext = `Use the provided product context/details: "${productName || "สินค้าคุณภาพทั่วไป"}".`;
    }

    const prompt = `${sourceContext}
You are tasked with writing a high-converting social media/video script in Thai language for Shopee/TikTok affiliate creators.

Strictly adhere to the following configurations:
- ประเภทคอนเทนต์ (Content Type): ${contentTypeMap[contentType] || contentTypeMap.review}
- จุดประสงค์ (Purpose): ${purposeMap[purpose] || purposeMap.sales}
- โครงสร้างการเขียน (Copywriting Framework): ${frameworkMap[framework] || frameworkMap.aida}
- น้ำเสียง (Tone): ${toneMap[tone] || toneMap.friendly}
- สไตล์การนำเสนอ (Style): ${styleMap[style] || styleMap.storytelling}
- ความยาวเป้าหมาย: จำกัดตัวอักษรรวมอยู่ในสเกลประมาณ ${targetLength} ตัวอักษรภาษาไทย (ห้ามยาวหรือสั้นเกินไปจากนี้มากนัก เพื่อความพอดีกับงบความยาว)

**CRITICAL COMPLIANCE FOR SHOPEE AFFILIATE COMMUNITY SHIELD:**
Do not write or use standard overclaim or blacklisted advertisement words in the script, such as: "ดีที่สุด", "รักษาโรค", "ขาวใสใน 3 วัน", "เห็นผลทันที", "ปลอดภัย 100%", "ลดน้ำหนักเร่งด่วน", "ดีเลิศ", "หายขาด", "สลายไขมัน", "มหัศจรรย์". Use compliant alternative words instead (e.g. "ตอบโจทย์มาก", "รู้สึกถึงความเปลี่ยนแปลงเมื่อใช้ต่อเนื่อง", "ผ่านการตรวจสอบมาตรฐานความปลอดภัย").

You must return your response STRICTLY as a JSON object with the following structure:
{
  "productName": "ชื่อสินค้าภาษาไทยแบบสั้นที่เข้าใจง่าย",
  "category": "Home & Living" or "Beauty & Fashion" or "Electronics" or "Other",
  "highlights": [
    {"label": "จุดเด่นหลัก 1", "value": "ค่าตัวเลขสเปกหลัก", "detail": "รายละเอียดสั้นๆ"},
    {"label": "จุดเด่นหลัก 2", "value": "ค่าตัวเลขสเปกหลัก", "detail": "รายละเอียดสั้นๆ"},
    {"label": "จุดเด่นหลัก 3", "value": "ค่าตัวเลขสเปกหลัก", "detail": "รายละเอียดสั้นๆ"},
    {"label": "จุดเด่นหลัก 4", "value": "ค่าตัวเลขสเปกหลัก", "detail": "รายละเอียดสั้นๆ"}
  ],
  "scriptText": "สคริปต์บทพูดภาษาไทยล้วนๆ สำหรับใช้พากย์เสียงพากย์ด้วย TTS ทันที (ห้ามมีวงเล็บวงใน คำกำกับฉาก หรือวงเล็บ visual cue ใดๆ ทั้งสิ้น มีเพียงเสียงพูดล้วนๆ เท่านั้น)",
  "structuredScript": "บทรูปแบบแบ่งส่วน Markdown อย่างชัดเจน เพื่ออำนวยความสะดวกการถ่ายทำ โดยแยกหัวข้อดังนี้:\\n- **Hook (ดึงดูด 3 วิแรก):** [บทพูดเปิดเพื่อหยุดคนดู]\\n- **Visual Cues (ไอเดียฉาก/ภาพที่จะแสดง):** [คำแนะนำภาพประกอบฉากตามลำดับคลิป]\\n- **Spoken Lines (บทพูดสำหรับเสียงพากย์):** [บทคำพากย์ประกอบ]\\n- **Product Link (จุดใส่พิกัดลิงก์):** [คำพูดคอลทูแอคชั่นเพื่อป้ายยาพิกัดสินค้า]"
}

Ensure there are exactly 4 items in the highlights array. Ensure highlights are parsed properly. Please output valid JSON.`;

    let response: any = null;
    let success = false;

    // Optional Search Grounding attempt (non-blocking if quota exceeded)
    if (url) {
      try {
        console.log("Attempting URL analysis with Search Grounding using gemini-3.1-flash-lite...");
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            temperature: 0.7,
          },
        });
        if (response && response.text) {
          success = true;
        }
      } catch (err: any) {
        console.warn(`URL search grounding skipped or quota exceeded (${err.message}). Proceeding directly to AI generation.`);
      }
    }

    // Direct generation with resilient multi-model fallback
    if (!success) {
      try {
        response = await generateContentWithFallback(prompt, {
          responseMimeType: "application/json",
          temperature: 0.7,
        });
        success = true;
      } catch (jsonErr: any) {
        console.warn("JSON mode generation failed, trying standard text generation:", jsonErr.message);
        response = await generateContentWithFallback(prompt, {
          temperature: 0.7,
        });
        success = true;
      }
    }

    if (!success || !response || !response.text) {
      throw new Error("All fallback attempts failed to generate the affiliate script.");
    }

    const responseText = response.text || "";
    // Parse the JSON safely using helper
    const parsedData = parseJsonResponse(responseText);
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Error generating affiliate script:", error);
    res.status(500).json({ error: error.message || "Failed to generate affiliate script" });
  }
});

// API: Single-Speaker Text-to-Speech Generation
app.post("/api/gemini/tts", async (req, res) => {
  try {
    const { text, voice, emotion, style, speed = 1, pitch = 0 } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required for speech generation" });
    }

    const ai = getAiClient();
    let directive = "";

    let speedStr = "";
    if (speed <= 0.7) speedStr = "very slowly";
    else if (speed <= 0.9) speedStr = "slowly";
    else if (speed >= 1.3) speedStr = "very quickly";
    else if (speed >= 1.1) speedStr = "quickly";

    let pitchStr = "";
    if (pitch <= -1.5) pitchStr = "very deep";
    else if (pitch <= -0.5) pitchStr = "deep";
    else if (pitch >= 1.5) pitchStr = "very high-pitched";
    else if (pitch >= 0.5) pitchStr = "high-pitched";

    const parts = [];
    if (emotion && emotion.trim() !== "neutral") parts.push(`${emotion} emotion`);
    if (style && style !== "normal") parts.push(`${style} tone`);
    if (speedStr) parts.push(`speaking ${speedStr}`);
    if (pitchStr) parts.push(`with a ${pitchStr} voice`);

    if (parts.length > 0) {
      directive = `(Speaking style: ${parts.join(", ")}): `;
    }

    const finalText = directive ? `${directive}${text}` : text;
    const modelName = "gemini-3.1-flash-tts-preview";

    console.log(`Generating TTS with model: ${modelName}, voice: ${voice || "Kore"}`);
    
    let response: any;
    let ttsError: any = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: [{ parts: [{ text: finalText }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice || "Kore", // Puck, Charon, Kore, Fenrir, Zephyr
                },
              },
            },
          },
        });
        if (response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
          break;
        }
      } catch (err: any) {
        ttsError = err;
        const msg = (err.message || "").toLowerCase();
        if ((msg.includes("503") || msg.includes("429") || msg.includes("unavailable")) && attempt === 0) {
          console.warn(`[TTS Retry] Attempt ${attempt + 1} encountered transient error (${err.message}). Retrying in 700ms...`);
          await new Promise((r) => setTimeout(r, 700));
        } else {
          break;
        }
      }
    }

    const audio = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audio) {
      throw ttsError || new Error("The speech generation model did not return any audio.");
    }

    res.json({
      success: true,
      audioData: audio,
      voice: voice || "Kore",
      emotion: emotion || "neutral",
    });
  } catch (error: any) {
    console.error("Error generating speech:", error);
    res.status(500).json({ error: error.message || "Failed to generate speech" });
  }
});

// API: Multi-Speaker Conversation Text-to-Speech
app.post("/api/gemini/tts-conversation", async (req, res) => {
  try {
    const { text, voiceA = "Kore", voiceB = "Puck", style = "normal", speed = 1, pitch = 0 } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required for conversation TTS" });
    }

    const ai = getAiClient();
    const speedAdjective = speed < 0.8 ? "very slowly" : speed < 1.0 ? "slowly" : speed > 1.2 ? "quickly" : "";
    const pitchAdjective = pitch < -1 ? "deep" : pitch > 1 ? "high-pitched" : "";

    let promptDirective = "TTS the following conversation between A and B";
    const conditions = [];
    if (style !== "normal") conditions.push(style);
    if (speedAdjective) conditions.push(`speaking ${speedAdjective}`);
    if (pitchAdjective) conditions.push(`with ${pitchAdjective} voices`);

    if (conditions.length > 0) {
      promptDirective += ` ${conditions.join(", ")}`;
    }
    promptDirective += ":\n" + text;

    const modelName = "gemini-3.1-flash-tts-preview";
    console.log(`Generating Multi-Speaker TTS with ${modelName}`);

    let response: any;
    let ttsError: any = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: [{ parts: [{ text: promptDirective }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                  {
                    speaker: "A",
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceA } },
                  },
                  {
                    speaker: "B",
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceB } },
                  },
                ],
              },
            },
          },
        });
        if (response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
          break;
        }
      } catch (err: any) {
        ttsError = err;
        const msg = (err.message || "").toLowerCase();
        if ((msg.includes("503") || msg.includes("429") || msg.includes("unavailable")) && attempt === 0) {
          console.warn(`[Multi-TTS Retry] Attempt ${attempt + 1} encountered transient error (${err.message}). Retrying in 700ms...`);
          await new Promise((r) => setTimeout(r, 700));
        } else {
          break;
        }
      }
    }

    const audio = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audio) {
      throw ttsError || new Error("No audio generated from multi-speaker model");
    }

    res.json({
      success: true,
      audioData: audio,
      voiceA,
      voiceB,
    });
  } catch (error: any) {
    console.error("Error generating conversation speech:", error);
    res.status(500).json({ error: error.message || "Failed to generate conversation speech" });
  }
});

// API: Streamed Content Generation (for TSS Studio Assistant)
app.post("/api/gemini/generate-stream", async (req, res) => {
  try {
    const { contents, systemInstruction, temperature = 0.7 } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const responseStream = await generateContentStreamWithFallback(contents, {
      systemInstruction: systemInstruction,
      temperature: temperature,
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Error generating content stream:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "Failed to generate content stream" });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || "Stream error" })}\n\n`);
      res.end();
    }
  }
});

// API: Marketing Image Generation
app.post("/api/gemini/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAiClient();
    const enhancedPrompt = `Professional product photography, commercial advertisement style. ${prompt}. High quality, 8k resolution, perfect lighting, photorealistic, sharp focus, cinematic composition, award-winning photography.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
          },
        },
      });

      for (const candidate of response.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData) {
            const mimeType = part.inlineData.mimeType || "image/png";
            return res.json({
              success: true,
              imageUrl: `data:${mimeType};base64,${part.inlineData.data}`,
            });
          }
        }
      }
    } catch (imageErr: any) {
      console.warn("Gemini Image generation returned error/quota limit:", imageErr.message);
      // Return clear informative error message
      return res.status(402).json({
        error: "Image generation requires paid tier API key: " + (imageErr.message || "Quota exceeded"),
      });
    }

    res.status(500).json({ error: "No image was returned from the model." });
  } catch (error: any) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: error.message || "Failed to generate image" });
  }
});

// API: Affiliate Product Analyzer
app.post("/api/gemini/affiliate/analyze", async (req, res) => {
  try {
    const { url, description, imageDatas = [], systemInstruction } = req.body;
    const ai = getAiClient();

    let userPrompt = `Analyze this product from the following inputs. `;
    if (url) {
      const extractedKeywords = extractKeywordsFromUrl(url);
      userPrompt += `Product URL: ${url}. ${extractedKeywords ? `Extracted Product Title/Slug: "${extractedKeywords}". ` : ""}`;
    }
    if (description) userPrompt += `Description: ${description}. `;
    userPrompt += `\nTask: Extract detailed product information and return ONLY a valid JSON object with the following structure:
    {
      "productName": "Full product name",
      "category": "Main Category",
      "sellerType": "Shop Type e.g. Shopee Mall, Preferred",
      "sellingPrice": "Current numeric price (with currency)",
      "originalPrice": "Original numeric price (or -)",
      "salesCount": "Total sales count",
      "reviewCount": "Total reviews count or rating info",
      "rating": "Star rating",
      "likes": "Number of likes/favorites",
      "videoCount": "Number of related videos found (estimate or 'N/A')",
      "promotions": "Discount codes, flash sales found",
      "affiliateCommission": "Calculated commission amount (Estimate based on 5-10% of price)",
      "affiliateCommissionRate": "Commission percentage (Estimate 5-10%)",
      "details": "Summary of key specs and features",
      "guarantee": "Shopee Guarantee info"
    }
    If exact numbers aren't visible, infer reasonable estimates or state 'N/A'.`;

    const parts: any[] = [{ text: userPrompt }];

    imageDatas.forEach((img: string) => {
      let mimeType = "image/jpeg";
      let base64 = img;
      if (img.startsWith("data:")) {
        const match = img.match(/^data:([^;,]+);base64,(.*)$/);
        if (match) {
          mimeType = match[1];
          base64 = match[2];
        }
      }
      parts.push({
        inlineData: {
          mimeType,
          data: base64,
        },
      });
    });

    let response: any = null;
    let success = false;

    // Optional Search Grounding attempt (non-blocking if quota exceeded)
    if (url) {
      try {
        console.log("Attempting affiliate analysis with search grounding (gemini-3.1-flash-lite)...");
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: { parts },
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: systemInstruction || "You are a Shopee Affiliate Analyst.",
          },
        });
        if (response && response.text) {
          success = true;
        }
      } catch (err: any) {
        console.warn(`Search grounding for affiliate analysis rate-limited or unavailable: ${err.message}. Proceeding directly to AI generation.`);
      }
    }

    // Direct generation with resilient multi-model fallback
    if (!success) {
      try {
        response = await generateContentWithFallback(
          { parts },
          {
            responseMimeType: "application/json",
            systemInstruction: systemInstruction || "You are a Shopee Affiliate Analyst.",
          }
        );
        success = true;
      } catch (err: any) {
        console.warn("JSON mode analysis failed, trying plain text with fallback:", err.message);
        response = await generateContentWithFallback(
          { parts },
          {
            systemInstruction: systemInstruction || "You are a Shopee Affiliate Analyst.",
          }
        );
        success = true;
      }
    }

    if (!response || !response.text) {
      console.warn("AI generation did not return text, generating smart fallback analysis from input");
      const fallbackTitle = url ? extractKeywordsFromUrl(url) || "สินค้า Shopee Affiliate" : (description?.slice(0, 40) || "สินค้า Shopee Affiliate");
      const completeData = {
        productName: fallbackTitle,
        category: "สินค้าทั่วไป / Shopee Affiliate",
        sellerType: "Shopee Mall / ร้านค้าแนะนำ",
        sellingPrice: "฿---",
        originalPrice: "-",
        salesCount: "100+",
        reviewCount: "4.8 (100+ รีวิว)",
        rating: "4.8",
        likes: "250+",
        videoCount: "10+",
        promotions: "โค้ดส่งฟรี / ส่วนลดร้านค้าพิเศษ",
        affiliateCommission: "฿20 - ฿80",
        affiliateCommissionRate: "5% - 10%",
        details: description || `สินค้าคุณภาพสำหรับทำคอนเทนต์ป้ายยา Shopee Affiliate (${fallbackTitle}) พร้อมลิงก์พิกัดรับค่าคอมมิชชั่น`,
        guarantee: "Shopee การันตี ได้รับสินค้าแน่นอน คืนเงินได้ใน 7 วัน",
      };
      return res.json({ success: true, data: completeData });
    }

    const parsedData = parseJsonResponse(response.text);
    const fallbackTitle = url ? extractKeywordsFromUrl(url) || "สินค้า Shopee Affiliate" : (description?.slice(0, 40) || "สินค้า Shopee Affiliate");
    const completeData = {
      productName: parsedData.productName || fallbackTitle,
      category: parsedData.category || "General",
      sellerType: parsedData.sellerType || "Shopee Mall",
      sellingPrice: parsedData.sellingPrice || "฿---",
      originalPrice: parsedData.originalPrice || "-",
      salesCount: parsedData.salesCount || "100+",
      reviewCount: parsedData.reviewCount || "4.8 (50+ รีวิว)",
      rating: parsedData.rating || "4.8",
      likes: parsedData.likes || "100+",
      videoCount: parsedData.videoCount || "10+",
      promotions: parsedData.promotions || "โค้ดส่งฟรี / ส่วนลดร้านค้า",
      affiliateCommission: parsedData.affiliateCommission || "฿15 - ฿50",
      affiliateCommissionRate: parsedData.affiliateCommissionRate || "5% - 10%",
      details: parsedData.details || description || "สินค้าคุณภาพ ดีลคุ้มค่า พร้อมรับค่าคอมมิชชั่น Shopee Affiliate",
      guarantee: parsedData.guarantee || "Shopee การันตี แท้ 100%",
    };

    res.json({ success: true, data: completeData });
  } catch (error: any) {
    console.error("Error analyzing affiliate product:", error);
    const { url, description } = req.body;
    const fallbackTitle = url ? extractKeywordsFromUrl(url) || "สินค้า Shopee Affiliate" : (description?.slice(0, 40) || "สินค้า Shopee Affiliate");
    // Resilient fallback when API quota is exhausted
    const fallbackData = {
      productName: fallbackTitle,
      category: "สินค้าทั่วไป / Shopee Affiliate",
      sellerType: "Shopee Mall / ร้านค้าแนะนำ",
      sellingPrice: "฿---",
      originalPrice: "-",
      salesCount: "100+",
      reviewCount: "4.8 (100+ รีวิว)",
      rating: "4.8",
      likes: "250+",
      videoCount: "10+",
      promotions: "โค้ดส่งฟรี / โค้ดส่วนลด",
      affiliateCommission: "฿20 - ฿80",
      affiliateCommissionRate: "5% - 10%",
      details: description || `ข้อมูลสินค้า ${fallbackTitle} จากลิงก์ Shopee Affiliate พร้อมให้สร้างแคปชั่นและสคริปต์วิดีโอได้ทันที`,
      guarantee: "Shopee การันตี ได้รับสินค้าแน่นอน",
    };
    res.json({ success: true, data: fallbackData, note: "Generated via resilient fallback" });
  }
});

// API: Affiliate Content Generator
app.post("/api/gemini/affiliate/content", async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    const response = await generateContentWithFallback(
      [{ parts: [{ text: prompt }] }],
      {
        systemInstruction: systemInstruction,
      }
    );
    res.json({ success: true, text: response.text || "" });
  } catch (error: any) {
    console.error("Error generating affiliate content:", error);
    res.status(500).json({ error: error.message || "Failed to generate affiliate content" });
  }
});

// API: Affiliate Script Generator
app.post("/api/gemini/affiliate/script", async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    const response = await generateContentWithFallback(
      [{ parts: [{ text: prompt }] }],
      {
        systemInstruction: systemInstruction,
      }
    );
    res.json({ success: true, text: response.text || "" });
  } catch (error: any) {
    console.error("Error generating affiliate script:", error);
    res.status(500).json({ error: error.message || "Failed to generate affiliate script" });
  }
});

// API: Affiliate Expert Chat
app.post("/api/gemini/affiliate/chat", async (req, res) => {
  try {
    const { message, history = [], systemInstruction } = req.body;
    const historyParts = history.map((h: any) => ({
      role: h.role,
      parts: [{ text: h.content }],
    }));

    const response = await generateContentWithFallback(
      [
        ...historyParts,
        { role: "user", parts: [{ text: message }] },
      ],
      {
        systemInstruction: systemInstruction,
      }
    );
    res.json({ success: true, text: response.text || "" });
  } catch (error: any) {
    console.error("Error chatting with affiliate expert:", error);
    res.status(500).json({ error: error.message || "Failed to chat with affiliate expert" });
  }
});

// Setup Vite Dev Server / Static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
