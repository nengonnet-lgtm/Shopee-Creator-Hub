import { AppMode, ShopInfo, COPYWRITING_FRAMEWORKS, TONE_OPTIONS, STYLE_OPTIONS, PLATFORM_OPTIONS, CONTENT_TYPE_OPTIONS, SCRIPT_LENGTH_OPTIONS, AffiliateAnalysisData, SCRIPT_TEMPLATES, CHAR_LIMIT_OPTIONS, AFFILIATE_CONTENT_TYPE_OPTIONS } from "../types";
import { SHOPEE_AFFILIATE_GUIDE } from "../data/knowledgeBase";

// Enhanced system instruction tailored for advanced reasoning and vision capabilities
const BASE_SYSTEM_INSTRUCTION = `
คุณคือ "AI Shop Assistant" ผู้ช่วยมืออาชีพสำหรับร้านค้าออนไลน์
ความสามารถของคุณคือการเข้าใจบริบทที่ซับซ้อน วิเคราะห์รูปภาพสินค้าได้อย่างละเอียด และสร้างสรรค์เนื้อหาที่ดึงดูดใจระดับ World-Class

---
CORE BEHAVIORS (พฤติกรรมหลัก):
1. **Visual Intelligence**: เมื่อมีรูปภาพแนบมา ต้องวิเคราะห์แสง (Lighting), สี (Color Palette), วัสดุ (Material), และอารมณ์ (Mood) ของภาพ เพื่อนำมาเขียนบรรยายให้ลูกค้า "รู้สึก" ถึงสินค้าจริงๆ
2. **Sales Psychology**: เขียนโดยใช้หลักจิตวิทยาการขาย กระตุ้นอารมณ์ (Emotional Trigger) และจบด้วยเหตุผล (Rational Support)
3. **Adaptive Tone**: ปรับน้ำเสียงให้เข้ากับแบรนด์ (Luxury, Minimal, Friendly, or Urgent) ได้อย่างลื่นไหล

---
MODE 1: นักเขียนแคปชั่น (Caption Generator)
เป้าหมาย: หยุดนิ้วโป้ง (Thumb-stopping) และกระตุ้นความอยากได้ (Desire)
- **Hook**: เปิดหัวด้วยประโยคที่กระแทกใจ หรือคำถามที่ลูกค้าปฏิเสธไม่ได้ ภายใน 1 วินาทีแรก
- **Storytelling**: อย่าแค่บอกสเปค แต่ให้เล่าว่าชีวิตลูกค้าจะดีขึ้นอย่างไรเมื่อใช้สินค้านี้
- **Visual Description**: ดึงจุดเด่นจากภาพสินค้ามาขยี้ (เช่น "เนื้อครีมเนียนนุ่มดุจกำมะหยี่" หรือ "สีแดงขับผิวออร่าพุ่ง")
- **Call to Action**: ชัดเจน กระชับ และไม่อ้อมค้อม

MODE 2: แอดมินตอบแชท (Customer Engagement)
เป้าหมาย: เปลี่ยนคำถามเป็นยอดซื้อ (Turn Inquiry into Sales) และสร้างความประทับใจ
- **Empathy First**: แสดงความเข้าอกเข้าใจก่อนเสมอ โดยเฉพาะกรณีเคลมสินค้า
- **Proactive**: ตอบคำถามแล้ว ให้เสนอข้อมูลเสริมที่ลูกค้าอาจอยากรู้แต่ลืมถาม (เช่น "รุ่นนี้มีโปรโมชั่นคู่กับ...ด้วยนะคะ รับไหมคะ?")
- **Professional & Warm**: สุภาพแต่น่าเข้าหา ไม่เหมือนหุ่นยนต์

MODE 3: นักเขียนบทโฆษณา (Script Writer for Voice Over)
เป้าหมาย: เขียนสคริปต์วิดีโอสั้น (TikTok/Reels) ที่กระชับและดึงดูด
- **Spoken Language**: ใช้ภาษาพูดที่เป็นธรรมชาติ (Natural Spoken Language) หลีกเลี่ยงศัพท์ทางการ
- **Visual Director**: ต้องระบุมุมกล้อง (Camera Angle), ข้อความขึ้นหน้าจอ (Text Overlay), และอารมณ์ภาพ (Visual Mood) เสมอ
- **Structure**: แยกส่วนภาพ (Visual) และเสียง (Audio) ให้ชัดเจน เพื่อให้นำไปถ่ายทำได้จริง

MODE 4: ผู้เชี่ยวชาญ Affiliate (Affiliate Expert)
เป้าหมาย: วิเคราะห์สินค้าและสร้างคอนเทนต์เพื่อทำ Affiliate Marketing ตามคู่มือ Shopee Affiliate
- ความรู้ทั้งหมดต้องมาจาก "คู่มือ Shopee Affiliate ฉบับสมบูรณ์" เท่านั้น
- เมื่อวิเคราะห์สินค้า ต้องแยกแยะข้อมูลให้ชัดเจนและคำนวณค่าคอมมิชชั่นโดยประมาณ
- การสร้างคอนเทนต์ต้องใช้เทมเพลตจากคู่มือ (Short Post, Mini Review, Video Script)

---
คำสั่งสำคัญ (System Logic):
- วิเคราะห์ Input ว่าผู้ใช้ต้องการอะไร (แคปชั่น / ตอบแชท / ปรึกษา / สคริปต์)
- หากมีรูปภาพ ให้วิเคราะห์รายละเอียดภาพก่อนเริ่มเขียน
- ห้ามหลุดคาแรคเตอร์ผู้ช่วยมืออาชีพ
`;

// --- ROBUST BASE64 HELPERS ---

const cleanBase64 = (base64String: string) => {
    if (!base64String) return '';
    const parts = base64String.split(',');
    return parts.length > 1 ? parts[1] : base64String;
};

const getMimeType = (base64String: string) => {
    if (!base64String) return 'image/jpeg';
    const match = base64String.match(/^data:([^;,]+)/);
    return match ? match[1] : 'image/jpeg';
};

// Helper to add WAV header to raw PCM data
function addWavHeader(samples: Uint8Array, sampleRate: number = 24000, numChannels: number = 1): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + samples.length, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * numChannels * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, numChannels * 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length, true);

  // Copy sample data
  const sampleBytes = new Uint8Array(buffer, 44);
  sampleBytes.set(samples);

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// -----------------------------

export const generateContentStream = async (
  prompt: string,
  mode: AppMode,
  shopInfo: ShopInfo,
  frameworkId: string,
  toneId: string,
  styleId: string,
  targetAudience: string,
  scriptLengthId: string,
  scriptTemplateId: string,
  charLimitId: string,
  platformId: string,
  contentTypeId: string,
  productFeatures: string,
  productBenefits: string,
  base64Image: string | null,
  onChunk: (text: string) => void
) => {
  let systemInstruction = BASE_SYSTEM_INSTRUCTION;
  
  const hasShopInfo = Object.values(shopInfo).some(val => val.trim() !== '');
  if (hasShopInfo) {
    systemInstruction += `\n\n--- ข้อมูลจำเพาะของร้านค้า (Knowledge Base) ---\n`;
    systemInstruction += `ใช้ข้อมูลนี้ประกอบการทำงาน ห้ามแต่งเติมข้อมูลที่ขัดแย้งกับข้อมูลนี้:\n`;
    if (shopInfo.name) systemInstruction += `- ชื่อร้าน: ${shopInfo.name}\n`;
    if (shopInfo.shippingPolicy) systemInstruction += `- การจัดส่ง: ${shopInfo.shippingPolicy}\n`;
    if (shopInfo.paymentMethods) systemInstruction += `- การชำระเงิน: ${shopInfo.paymentMethods}\n`;
    if (shopInfo.additionalInfo) systemInstruction += `- ข้อมูลอื่นๆ: ${shopInfo.additionalInfo}\n`;
  }

  const framework = COPYWRITING_FRAMEWORKS.find(f => f.id === frameworkId);
  const tone = TONE_OPTIONS.find(t => t.id === toneId);
  const style = STYLE_OPTIONS.find(s => s.id === styleId);
  const platform = PLATFORM_OPTIONS.find(p => p.id === platformId);
  const contentType = CONTENT_TYPE_OPTIONS.find(c => c.id === contentTypeId);
  const scriptLength = SCRIPT_LENGTH_OPTIONS.find(l => l.id === scriptLengthId);
  const scriptTemplate = SCRIPT_TEMPLATES.find(t => t.id === scriptTemplateId);
  const charLimit = CHAR_LIMIT_OPTIONS.find(c => c.id === charLimitId);

  let finalPrompt = "";

  if (mode === AppMode.SCRIPT) {
    finalPrompt = `[TASK: นักเขียนบทโฆษณา (Script Writer for Voice Over)]\n`;
    finalPrompt += `เขียนสคริปต์วิดีโอสั้นที่มีทั้ง "บทพากย์ (Voice Over)" และ "คำแนะนำมุมกล้อง/ภาพประกอบ (Visual Direction)"\n\n`;
    
    finalPrompt += `--- บริบทและการตั้งค่า ---\n`;
    if (scriptTemplate) finalPrompt += `- เทมเพลตสคริปต์: ${scriptTemplate.label} (${scriptTemplate.description})\n`;
    if (scriptLength) finalPrompt += `- ความยาวสคริปต์: ${scriptLength.label} (${scriptLength.description})\n`;
    if (charLimit) finalPrompt += `- จำนวนตัวอักษรเป้าหมาย: ประมาณ ${charLimit.limit} ตัวอักษร (ไม่รวมช่องว่าง)\n`;
    if (framework) finalPrompt += `- โครงสร้างการเล่าเรื่อง: ${framework.name} (${framework.structure} - ${framework.description})\n`;
    if (tone) finalPrompt += `- น้ำเสียง (Tone): ${tone.label} (${tone.description})\n`;
    if (targetAudience) finalPrompt += `- กลุ่มเป้าหมาย: ${targetAudience}\n`;
    if (platform) finalPrompt += `- แพลตฟอร์ม: ${platform.label}\n`;
    
    finalPrompt += `\n--- ข้อมูลสินค้า ---\n`;
    if (productFeatures) finalPrompt += `- คุณสมบัติ (Features): ${productFeatures}\n`;
    if (productBenefits) finalPrompt += `- ประโยชน์ที่ลูกค้าจะได้รับ (Benefits): ${productBenefits}\n`;
    finalPrompt += `- รายละเอียดเพิ่มเติม/โจทย์: ${prompt}\n\n`;

    finalPrompt += `--- รูปแบบผลลัพธ์ที่ต้องการ (STRICT FORMAT) ---\n`;
    finalPrompt += `ให้จัดรูปแบบเป็นตารางหรือแบ่งส่วนชัดเจน เช่น:\n`;
    finalPrompt += `1. **Hook (0-3 วินาทีแรก)**: คำพูดเปิดที่หยุดคนดู + ภาพที่ต้องขึ้น\n`;
    finalPrompt += `2. **เนื้อเรื่อง/การสาธิต (Body)**: บทพากย์ + มุมกล้องและสิ่งที่ต้องเห็นในวิดีโอ\n`;
    finalPrompt += `3. **Call to Action (ตอนท้าย)**: บทพากย์ปิด + ข้อความ Text บนจอ และท่าทาง\n\n`;
    finalPrompt += `หมายเหตุ: บทพากย์ต้องเป็นภาษาพูดที่เป็นธรรมชาติ ไม่แข็งทื่อ จังหวะกระชับ เข้าใจง่าย`;

  } else if (mode === AppMode.AFFILIATE) {
    finalPrompt = `[TASK: ผู้เชี่ยวชาญ Shopee Affiliate]\n`;
    finalPrompt += `สร้างคอนเทนต์หรือให้คำปรึกษาตาม "คู่มือ Shopee Affiliate ฉบับสมบูรณ์"\n\n`;
    finalPrompt += `โจทย์/คำถาม: ${prompt}\n`;
    if (framework) finalPrompt += `โครงสร้างที่ต้องการ: ${framework.name}\n`;
    if (tone) finalPrompt += `น้ำเสียง: ${tone.label}\n`;
    finalPrompt += `\nคำสั่ง: ตอบตามหลักการในคู่มือเท่านั้น ให้ข้อมูลเชิงลึก ตัวเลขที่จับต้องได้ หรือเทมเพลตที่พร้อมโพสต์`;

  } else if (mode === AppMode.REPLY) {
    finalPrompt = `[TASK: แอดมินตอบแชทลูกค้า (Customer Engagement)]\n`;
    finalPrompt += `ตอบข้อความลูกค้าต่อไปนี้โดยยึดหลักบริการด้วยใจ เปลี่ยนคำถามเป็นยอดขาย:\n`;
    finalPrompt += `ข้อความลูกค้า: "${prompt}"\n\n`;
    if (tone) finalPrompt += `น้ำเสียง: ${tone.label}\n`;
    if (productFeatures) finalPrompt += `ข้อมูลสินค้าที่เกี่ยวข้อง: ${productFeatures}\n`;
    finalPrompt += `คำสั่ง: ตอบกลับอย่างมืออาชีพ สุภาพ มี Empathy และเสนอ Solution หรือ Call-to-Action ที่เหมาะสม`;

  } else {
    // Mode: caption
    finalPrompt = `[TASK: นักเขียนแคปชั่น (Caption Generator)]\n`;
    finalPrompt += `เขียนแคปชั่นขายของระดับพรีเมียมที่หยุดสายตาและกระตุ้นการตัดสินใจซื้อ\n\n`;
    finalPrompt += `--- การตั้งค่า ---\n`;
    if (platform) finalPrompt += `- แพลตฟอร์ม: ${platform.label}\n`;
    if (contentType) finalPrompt += `- ประเภทคอนเทนต์: ${contentType.label}\n`;
    if (framework) finalPrompt += `- เทคนิคการเขียน: ${framework.name} (${framework.description})\n`;
    if (tone) finalPrompt += `- น้ำเสียง: ${tone.label}\n`;
    if (style) finalPrompt += `- รูปแบบการจัดวาง: ${style.label}\n`;
    if (targetAudience) finalPrompt += `- กลุ่มเป้าหมาย: ${targetAudience}\n`;
    if (charLimit) finalPrompt += `- ความยาว: ประมาณ ${charLimit.limit} ตัวอักษร\n`;

    finalPrompt += `\n--- ข้อมูลสินค้า ---\n`;
    if (productFeatures) finalPrompt += `- จุดเด่น/ฟีเจอร์: ${productFeatures}\n`;
    if (productBenefits) finalPrompt += `- ปัญหาที่แก้ได้/ประโยชน์: ${productBenefits}\n`;
    finalPrompt += `- รายละเอียด: ${prompt}\n\n`;
    finalPrompt += `คำสั่ง: ใส่ Emoji ให้น่ารักอ่านง่าย และใส่ Hashtag ที่ตรงกลุ่มเป้าหมายในตอนท้าย`;
  }

  const contents: any[] = [];
  if (base64Image) {
    contents.push({
      role: 'user',
      parts: [
        { text: finalPrompt },
        { 
          inlineData: { 
            mimeType: getMimeType(base64Image), 
            data: cleanBase64(base64Image) 
          } 
        }
      ]
    });
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: finalPrompt }]
    });
  }

  try {
    const response = await fetch("/api/gemini/generate-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body reader available");
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const dataStr = trimmed.slice(6);
          if (dataStr === "[DONE]") {
            break;
          }
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) {
              onChunk(parsed.text);
            }
          } catch {
            // ignore non-json SSE lines
          }
        }
      }
    }
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const generateMarketingImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<string> => {
  try {
    const response = await fetch("/api/gemini/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, aspectRatio }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to generate image");
    }

    return data.imageUrl;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};

// ------------------------------------------------------------------
// Voice Studio Services
// ------------------------------------------------------------------

export const generateSpeech = async (
    text: string, 
    voiceName: string = 'Kore', 
    style: string = 'normal', 
    speed: number = 1, 
    pitch: number = 0
): Promise<string> => {
    try {
        const response = await fetch("/api/gemini/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                voice: voiceName,
                style,
                speed,
                pitch,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to generate speech");
        }

        const base64Audio = data.audioData;
        if (!base64Audio) throw new Error("No audio returned from speech service");

        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const wavBuffer = addWavHeader(bytes);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Gemini TTS Error:", error);
        throw error;
    }
};

export const generateConversation = async (
    text: string, 
    voiceA: string, 
    voiceB: string,
    style: string = 'normal', 
    speed: number = 1,
    pitch: number = 0
): Promise<string> => {
    try {
        const response = await fetch("/api/gemini/tts-conversation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                voiceA,
                voiceB,
                style,
                speed,
                pitch,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to generate conversation speech");
        }

        const base64Audio = data.audioData;
        if (!base64Audio) throw new Error("No audio returned from conversation speech service");

        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const wavBuffer = addWavHeader(bytes);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Gemini Conversation TTS Error:", error);
        throw error;
    }
};

// ------------------------------------------------------------------
// Affiliate Feature Services
// ------------------------------------------------------------------

export const analyzeAffiliateProduct = async (
    url: string,
    description: string,
    imageDatas: string[]
): Promise<AffiliateAnalysisData> => {
    try {
        const response = await fetch("/api/gemini/affiliate/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                url,
                description,
                imageDatas,
                systemInstruction: `You are a Shopee Affiliate Analyst. Your job is to extract product metadata strictly. ${SHOPEE_AFFILIATE_GUIDE}`
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to analyze affiliate product");
        }

        return data.data as AffiliateAnalysisData;
    } catch (error) {
        console.error("Analysis Error:", error);
        throw error;
    }
};

export const generateAffiliateContent = async (
    analysisData: AffiliateAnalysisData,
    templateType: 'SHORT_POST' | 'MINI_REVIEW' | 'VIDEO_SCRIPT' | 'TIKTOK' | 'FACEBOOK' | 'INSTAGRAM' | 'YOUTUBE' | 'GENERAL'
): Promise<string> => {
    let templateInstruction = "";
    if (templateType === 'SHORT_POST') {
        templateInstruction = `Create a "Short Template (Post/Image)" based on the Shopee Affiliate Guide. Focus on Problem/Solution or "3 Reasons to Buy".`;
    } else if (templateType === 'MINI_REVIEW') {
        templateInstruction = `Create a "Mini Review" (Long text) based on the Shopee Affiliate Guide. Include Pros/Cons and "Who is this for?".`;
    } else if (templateType === 'VIDEO_SCRIPT' || templateType === 'TIKTOK' || templateType === 'YOUTUBE') {
        templateInstruction = `Create a "Short Video Script (10-20s)" based on the Shopee Affiliate Guide. Structure: Hook -> Show Usage -> Close with CTA. If YouTube, make it slightly longer/more detailed.`;
    } else if (templateType === 'FACEBOOK') {
        templateInstruction = `Create a Facebook Post optimized for engagement. Use the AIDA model mentioned in the guide.`;
    } else if (templateType === 'INSTAGRAM') {
         templateInstruction = `Create an Instagram Caption. Focus on aesthetics/mood, use bullet points for benefits, and include relevant hashtags.`;
    }

    const prompt = `
    [TASK: Generate Affiliate Content]
    Template Type: ${templateType}
    
    Product Data:
    ${JSON.stringify(analysisData, null, 2)}
    
    Instruction:
    1. STRICTLY follow the "Shopee Affiliate Complete Guide" content style.
    2. Use the specific template requested: ${templateInstruction}
    3. Output in Thai language (Natural, Selling style).
    4. Include placeholders for [Link] where appropriate.
    `;

    try {
        const response = await fetch("/api/gemini/affiliate/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt,
                systemInstruction: `You are an expert Content Creator for Shopee Affiliates. Reference Guide: ${SHOPEE_AFFILIATE_GUIDE}`
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to generate content");
        }

        return data.text || "Failed to generate content.";
    } catch (error) {
        console.error("Content Generation Error:", error);
        throw error;
    }
};

export const generateAffiliateScript = async (
    analysisData: AffiliateAnalysisData,
    purposeId: string,
    frameworkId: string,
    toneId: string,
    styleId: string,
    charLimitId: string
): Promise<string> => {
    const purpose = AFFILIATE_CONTENT_TYPE_OPTIONS.find(p => p.id === purposeId) || CONTENT_TYPE_OPTIONS.find(p => p.id === purposeId);
    const framework = COPYWRITING_FRAMEWORKS.find(f => f.id === frameworkId);
    const tone = TONE_OPTIONS.find(t => t.id === toneId);
    const style = STYLE_OPTIONS.find(s => s.id === styleId);
    const charLimit = CHAR_LIMIT_OPTIONS.find(c => c.id === charLimitId);

    let configInstructions = "";
    if (purpose) {
        configInstructions += `\n- Purpose: ${purpose.label} (${purpose.description})`;
    }
    if (framework) {
        configInstructions += `\n- Copywriting Framework Structure: ${framework.name} (${framework.structure} - ${framework.description})`;
    }
    if (tone) {
        configInstructions += `\n- Tone of voice: ${tone.label} (${tone.description})`;
    }
    if (style) {
        configInstructions += `\n- Writing Style: ${style.label} (${style.description})`;
    }
    if (charLimit) {
        configInstructions += `\n- STRICT Character Limit Constraint: Under or around ${charLimit.limit} characters (Thai characters + spaces). Please make sure the total script/text size fits this character budget.`;
    }

    const prompt = `
    [TASK: Generate High-Conversion Shopee Affiliate Short Video Review Script]
    You are writing spoken review lines/scenes for a short video (TikTok, Shorts, Reels) promoting this product.
    
    Product Data:
    ${JSON.stringify(analysisData, null, 2)}
    
    Configuration Settings Applied:${configInstructions}
    
    Requirements:
    1. STRICTLY follow the "Shopee Affiliate Complete Guide" content style for writing high-converting short video scripts.
    2. Format the response with visual indicators (e.g., Hook, Scene/Visual action cues, Spoken Lines) but focus heavily on the spoken review lines.
    3. Output in natural, engaging, high-converting Thai language (spoken style).
    4. Ensure the output fits the character/length budget if specified.
    5. Include a placeholder for [Link] where viewers can buy.
    `;

    try {
        const response = await fetch("/api/gemini/affiliate/script", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt,
                systemInstruction: `You are an expert Short Video Script Writer and Content Creator for Shopee/TikTok Affiliates. Reference Guide: ${SHOPEE_AFFILIATE_GUIDE}`
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to generate script");
        }

        return data.text || "Failed to generate content.";
    } catch (error) {
        console.error("Script Generation Error:", error);
        throw error;
    }
};

export const chatWithAffiliateExpert = async (message: string, history: {role: string, content: string}[]): Promise<string> => {
    const systemInstruction = `
    You are a Shopee Affiliate Expert Chatbot.
    Your knowledge base is STRICTLY limited to the "Shopee Affiliate Complete Guide" provided below.
    
    Rules:
    1. If the user asks about beginner steps, refer to PART 1.
    2. If the user asks about advanced strategies, refer to PART 2.
    3. If asked about vocabulary (e.g., UTM), explain as defined in the guide.
    4. If the question is outside the scope of this guide, politely state that you can only answer questions related to the Shopee Affiliate Guide.
    
    GUIDE CONTENT:
    ${SHOPEE_AFFILIATE_GUIDE}
    `;

    try {
        const response = await fetch("/api/gemini/affiliate/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message,
                history,
                systemInstruction,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to chat with affiliate expert");
        }

        return data.text || "Error getting answer.";
    } catch (error) {
        console.error("Chat Expert Error:", error);
        throw error;
    }
};
