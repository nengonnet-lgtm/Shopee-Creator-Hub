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
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }
  return JSON.parse(cleaned);
}

// Middleware
app.use(express.json({ limit: "10mb" }));

// API: Refine/Rewrite Script Tone
app.post("/api/gemini/refine", async (req, res) => {
  try {
    const { script, tone, language, targetLength } = req.body;

    if (!script) {
      return res.status(400).json({ error: "Script content is required" });
    }

    const ai = getAiClient();

    const systemPrompt = `You are an expert social commerce and live-selling script writer. 
Your goal is to rewrite the user's provided product script or text to optimize it for video selling (like TikTok, IG Reels, Facebook Live).
Match the following criteria:
- Language: ${language || "Thai"} (Must match this language unless requested otherwise)
- Tone: ${tone || "energetic"}
- Target Script Length: STRICTLY around ${targetLength || 300} characters of Thai text. Ensure it fits well within this length limit!
- Keep it catchy, hook-oriented in the first 3 seconds, natural to speak out loud, and persuasive!
- Do not add any scene descriptions, director notes, or bracketed text like "[Show product here]". Return ONLY the spoken text itself.`;

    let response;
    let success = false;
    let lastError: any = null;
    const modelsToTry = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting script refinement with model: ${modelName}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: script,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.85,
          },
        });
        success = true;
        break;
      } catch (err: any) {
        console.warn(`Model ${modelName} failed. Error:`, err.message || err);
        lastError = err;
      }
    }

    if (!success || !response) {
      throw lastError || new Error("All fallback models failed to refine the script.");
    }

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
      sourceContext = `Review and search the product details from the URL: ${url}. Use Search Grounding to obtain specs, benefits, typical price, or commission details.`;
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

    let response;
    let success = false;
    let lastError: any = null;
    
    // Model lists for different attempts
    const groundingModels = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash", "gemini-2.0-flash"];
    const fallbackModels = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash", "gemini-3.5-flash"];

    // Attempt with Google Search grounding if URL is provided
    if (url) {
      for (const modelName of groundingModels) {
        try {
          console.log(`Attempting URL analysis with Search Grounding using model: ${modelName}`);
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              tools: [{ googleSearch: {} }],
              temperature: 0.7,
            },
          });
          if (response && response.text) {
            success = true;
            break;
          }
        } catch (err: any) {
          console.warn(`URL search grounding with ${modelName} failed. Trying next or falling back. Error:`, err.message || err);
          lastError = err;
        }
      }
    }

    // Fallback without search grounding if all grounding attempts failed or if URL was not provided
    if (!success) {
      for (const modelName of fallbackModels) {
        try {
          console.log(`Attempting Script generation WITHOUT Search Grounding using model: ${modelName}`);
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.7,
            },
          });
          if (response && response.text) {
            success = true;
            break;
          }
        } catch (err: any) {
          console.warn(`Script generation without grounding and JSON mime type failed with ${modelName}. Trying without JSON mime type. Error:`, err.message || err);
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                temperature: 0.7,
              },
            });
            if (response && response.text) {
              success = true;
              break;
            }
          } catch (err2: any) {
            console.warn(`Script generation fallback without JSON mime type also failed with ${modelName}. Error:`, err2.message || err2);
            lastError = err2;
          }
        }
      }
    }

    if (!success || !response) {
      throw lastError || new Error("All fallback models failed to generate the affiliate script.");
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

// API: Text-to-Speech Generation
app.post("/api/gemini/tts", async (req, res) => {
  try {
    const { text, voice, emotion } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required for speech generation" });
    }

    const ai = getAiClient();

    let base64Audio = null;
    let lastError: any = null;
    const ttsModels = [
      "gemini-3.1-flash-tts-preview",
      "gemini-2.5-flash-tts-preview",
      "gemini-2.5-flash-preview-tts",
      "gemini-2.5-pro-preview-tts",
    ];

    // Try each model
    for (const modelName of ttsModels) {
      // Try with emotion prefix first, then try with plain text
      const promptsToTry = [];
      if (emotion && emotion.trim() !== "neutral") {
        promptsToTry.push(`Say ${emotion}: ${text}`);
      }
      promptsToTry.push(text);

      for (const promptText of promptsToTry) {
        try {
          console.log(`Attempting TTS generation with model: ${modelName}, prompt length: ${promptText.length}`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ parts: [{ text: promptText }] }],
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

          const audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (audio) {
            base64Audio = audio;
            break;
          }
        } catch (err: any) {
          console.warn(`TTS generation with model ${modelName} failed. Error:`, err.message || err);
          lastError = err;
        }
      }
      if (base64Audio) {
        break;
      }
    }

    if (!base64Audio) {
      return res.status(500).json({
        error: lastError?.message || "The speech generation model did not return any audio. Please verify your prompt or try a different voice.",
      });
    }

    res.json({
      success: true,
      audioData: base64Audio,
      voice: voice || "Kore",
      emotion: emotion || "neutral",
    });
  } catch (error: any) {
    console.error("Error generating speech:", error);
    res.status(500).json({ error: error.message || "Failed to generate speech" });
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
