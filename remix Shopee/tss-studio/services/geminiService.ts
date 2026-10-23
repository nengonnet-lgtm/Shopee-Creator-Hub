import { GoogleGenAI, Modality } from "@google/genai";
import { AppMode, ShopInfo, COPYWRITING_FRAMEWORKS, TONE_OPTIONS, STYLE_OPTIONS, PLATFORM_OPTIONS, CONTENT_TYPE_OPTIONS, SCRIPT_LENGTH_OPTIONS, AffiliateAnalysisData, SCRIPT_TEMPLATES, CHAR_LIMIT_OPTIONS, AFFILIATE_CONTENT_TYPE_OPTIONS } from "../types";
import { SHOPEE_AFFILIATE_GUIDE } from "../data/knowledgeBase";

// Enhanced system instruction tailored for Gemini 3 Pro's advanced reasoning and vision capabilities
const BASE_SYSTEM_INSTRUCTION = `
คุณคือ "AI Shop Assistant" ผู้ช่วยมืออาชีพที่ขับเคลื่อนด้วย Gemini 3 Pro สำหรับร้านค้าออนไลน์
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
- หากมีรูปภาพ ให้ใช้ Gemini Vision วิเคราะห์รายละเอียดภาพก่อนเริ่มเขียน
- ห้ามหลุดคาแรคเตอร์ผู้ช่วยมืออาชีพ
`;

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing");
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

// --- ROBUST BASE64 HELPERS ---

const cleanBase64 = (base64String: string) => {
    if (!base64String) return '';
    const parts = base64String.split(',');
    return parts.length > 1 ? parts[1] : base64String;
};

const getMimeType = (base64String: string) => {
    if (!base64String) return 'audio/webm';
    const match = base64String.match(/^data:([^;,]+)/);
    return match ? match[1] : 'audio/webm';
}

const normalizeMimeType = (mime: string) => {
    const map: Record<string, string> = {
        'audio/x-m4a': 'audio/mp4',
        'audio/m4a': 'audio/mp4',
        'audio/mp3': 'audio/mpeg',
        'audio/x-mp3': 'audio/mpeg',
        'audio/wav': 'audio/wav',
        'audio/x-wav': 'audio/wav',
        'audio/webm': 'audio/webm'
    };
    return map[mime] || mime;
};

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
  scriptTemplateId: string, // New Parameter
  charLimitId: string, // New Parameter for character limit setting
  platformId: string,
  contentTypeId: string,
  productFeatures: string,
  productBenefits: string,
  base64Image: string | null,
  onChunk: (text: string) => void
) => {
  const client = getClient();
  
  // Construct dynamic system instruction with shop info
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

  // Augment prompt based on explicit mode selection and framework
  let finalPrompt = prompt;
  
  // Framework Injection
  const framework = COPYWRITING_FRAMEWORKS.find(f => f.id === frameworkId);
  const frameworkInstruction = framework 
    ? `\n\n[PROMPT CONFIG: Use Copywriting Framework "${framework.name}"]\nStructure: ${framework.structure}\nDescription: ${framework.description}\nRequirement: Follow this structure strictly for maximum impact.` 
    : '';

  // Tone & Style Injection
  let toneStyleInstruction = '';
  const tone = TONE_OPTIONS.find(t => t.id === toneId);
  if (tone) {
    toneStyleInstruction += `\n[PROMPT CONFIG: Tone]\nAdopt a "${tone.label}" tone (${tone.description}).`;
  }
  const style = STYLE_OPTIONS.find(s => s.id === styleId);
  if (style) {
    toneStyleInstruction += `\n[PROMPT CONFIG: Style]\nFormat the output as "${style.label}" (${style.description}).`;
  }

  // Character Limit Injection
  const charLimitOpt = CHAR_LIMIT_OPTIONS.find(c => c.id === charLimitId);
  if (charLimitOpt) {
    toneStyleInstruction += `\n[PROMPT CONFIG: Character Limit Constraint]\nSTRICT REQUIREMENT: The generated response MUST be around or under ${charLimitOpt.limit} characters (Thai characters + spaces) in total. Please be concise and respect this character budget strictly while keeping the content engaging.`;
  }

  if (mode === AppMode.CAPTION) {
    let contextInstruction = `[TASK: Write High-Conversion Social Media Content]`;
    
    // Platform Specifics
    const platform = PLATFORM_OPTIONS.find(p => p.id === platformId);
    if (platform) {
        contextInstruction += `\nTarget Platform: ${platform.label}`;
        if (platform.id === 'instagram') {
            contextInstruction += `\nRequirement: Use engaging spacing, emojis, and include 10-15 relevant hashtags at the bottom.`;
        } else if (platform.id === 'twitter') {
            contextInstruction += `\nRequirement: Keep it extremely concise (under 280 chars), impactful, and use 1-2 trending hashtags.`;
        } else if (platform.id === 'facebook') {
            contextInstruction += `\nRequirement: Use easy-to-read paragraph spacing.`;
        }
    }

    // Content Type Specifics (Enhanced Strategy)
    const contentType = CONTENT_TYPE_OPTIONS.find(c => c.id === contentTypeId);
    if (contentType) {
        contextInstruction += `\n\n[CONTENT STRATEGY: ${contentType.label}]`;
        if (contentType.id === 'promotional') {
             contextInstruction += `\nObjective: Drive immediate sales and clicks.`;
             contextInstruction += `\nKey Elements: Scarcity (Limited time/stock), High Perceived Value, Clear Offer.`;
             contextInstruction += `\nTone: Enthusiastic, Urgent, Persuasive.`;
             contextInstruction += `\nCTA: Strong command verb (e.g., "Shop Now", "Grab Yours").`;
        } else if (contentType.id === 'engagement') {
             contextInstruction += `\nObjective: Maximize likes, comments, and shares.`;
             contextInstruction += `\nKey Elements: Relatable situations, Humor, Polls, or Open-ended questions.`;
             contextInstruction += `\nTone: Friendly, Fun, Conversational.`;
             contextInstruction += `\nCTA: Ask a question (e.g., "Which color do you like?").`;
        } else if (contentType.id === 'educational') {
             contextInstruction += `\nObjective: Build trust and authority.`;
             contextInstruction += `\nKey Elements: "Did you know?", Steps, Tips, or Hacks related to the product.`;
             contextInstruction += `\nTone: Informative, Helpful, Expert.`;
             contextInstruction += `\nCTA: "Save this post" or "Share with a friend".`;
        } else if (contentType.id === 'lifestyle') {
             contextInstruction += `\nObjective: Inspire and sell the "Vibe".`;
             contextInstruction += `\nKey Elements: Aesthetic descriptions, Mood setting, Daily routine integration.`;
             contextInstruction += `\nTone: Inspiring, Relaxed, Aspirational.`;
             contextInstruction += `\nFocus: Sell the result/feeling, not the specs.`;
        } else if (contentType.id === 'announcement') {
             contextInstruction += `\nObjective: Communicate important news clearly.`;
             contextInstruction += `\nKey Elements: Who, What, Where, When, Why. Use emojis like ⚠️ or 📢.`;
             contextInstruction += `\nTone: Professional, Direct, Clear.`;
        }
    }

    finalPrompt = `${contextInstruction} ${frameworkInstruction}${toneStyleInstruction}\n\nContext/Topic:\n${prompt}`;
  } else if (mode === AppMode.REPLY) {
    finalPrompt = `[TASK: Draft a Professional Customer Reply] ${frameworkInstruction}${toneStyleInstruction}\n\nContext:\n${prompt}`;
  } else if (mode === AppMode.SCRIPT) {
    // --------------------------------------------------------
    // ADVANCED SCRIPT GENERATION LOGIC
    // --------------------------------------------------------
    
    // Audience Instruction
    const audienceInstruction = targetAudience 
      ? `\nTarget Audience: "${targetAudience}" (Use language, slang, and pain points specific to this group).` 
      : '';

    // Tone Instruction
    const scriptToneInstruction = tone 
        ? `\nMood/Tone: "${tone.label}" (Ensure the voiceover actor conveys this emotion).` 
        : '';
        
    // Length Instruction
    const lengthOption = SCRIPT_LENGTH_OPTIONS.find(l => l.id === scriptLengthId);
    const lengthInstruction = lengthOption
        ? `\nDuration Constraint: ${lengthOption.label} (${lengthOption.description}). KEEP IT TIGHT.`
        : '';

    // Product Data
    const featuresInstruction = productFeatures
        ? `\nKey Features to Highlight: "${productFeatures}"`
        : '';
    const benefitsInstruction = productBenefits
        ? `\nUser Benefits to Emphasize: "${productBenefits}"`
        : '';
    
    // Template Specific Directives
    let templateDirective = "Structure: Hook -> Value -> Offer -> CTA";
    const selectedTemplate = SCRIPT_TEMPLATES.find(t => t.id === scriptTemplateId);
    
    if (selectedTemplate) {
        templateDirective = `TEMPLATE STYLE: ${selectedTemplate.label}\n`;
        if (selectedTemplate.id === 'unboxing') {
            templateDirective += `Focus on the sensory experience. Sounds of opening, texture close-ups, first reaction.`;
        } else if (selectedTemplate.id === 'tutorial') {
             templateDirective += `Step-by-step clarity. Show the result FIRST (0-2s), then show how to get there.`;
        } else if (selectedTemplate.id === 'testimonial') {
             templateDirective += `User-Generated Content (UGC) style. Raw, authentic, handheld camera feel. Start with the 'Before' struggle.`;
        } else if (selectedTemplate.id === 'comparison') {
             templateDirective += `Split screen or side-by-side visual. Distinctly show why the Competitor fails and this Product wins.`;
        } else if (selectedTemplate.id === 'vlog') {
             templateDirective += `Day in the life style. Transitions should be smooth. Product integration must feel organic, not forced.`;
        } else if (selectedTemplate.id === 'asmr') {
             templateDirective += `MINIMAL SPEAKING. Focus on 'Sound Design' instructions in the visual column. Tapping, scratching, pouring sounds.`;
        } else if (selectedTemplate.id === 'problem-solution') {
             templateDirective += `Agitate the problem visually in black & white or chaotic cuts. Switch to bright/stable visuals when the product appears.`;
        }
    }

    finalPrompt = `
    [ACT AS A WORLD-CLASS SHORT VIDEO DIRECTOR]
    Platform: TikTok / Reels / Shorts
    Language: Thai (Natural Spoken / ภาษาพูดที่เป็นธรรมชาติ)
    
    INPUT DATA:
    Context: ${prompt}
    ${audienceInstruction}
    ${scriptToneInstruction}
    ${lengthInstruction}
    ${featuresInstruction}
    ${benefitsInstruction}
    ${templateDirective}

    --------------------------------------------------------
    YOUR TASK:
    Create a complete video production script. You must output the response in the following structured format:

    # 1. Viral Hooks (3 Options)
    Create 3 different opening lines (0-3 seconds) to grab attention.
    - Option A (The Question): Ask something relatable.
    - Option B (The Statement): State a controversial or surprising fact.
    - Option C (The Visual): Describe a thumb-stopping visual action.

    # 2. The Script (Storyboard)
    Create a Markdown Table with 3 columns:
    | Time | Visual / Action (Camera Angles, Text Overlay, B-Roll) | Audio / Voiceover (Spoken words & Sound Effects) |
    | :--- | :--- | :--- |
    | 0-3s | [Describe visual clearly e.g. "Zoom in on...", "Text overlay: ..."] | [Spoken text or (SFX: ...)] |
    ... (continue for full length)

    # 3. Production Notes
    - Recommended Background Music mood.
    - Caption & Hashtags suggestions.

    CRITICAL RULES:
    1. **Visual First**: Do not just write dialogue. You MUST describe the visual action for every scene.
    2. **Pacing**: Short videos need fast cuts. Change the visual scene every 2-5 seconds.
    3. **Tone**: Use "You" (คุณ/แก/เพื่อน) and "I" (เรา/เค้า). Avoid "Ladies and Gentlemen" (ท่านผู้มีเกียรติ) absolutely.
    4. **Text Overlays**: Specify text to pop up on screen (e.g. "Text: ลด 50%") to emphasize key points.
    --------------------------------------------------------
    `;
  } else {
    // Auto Mode
    if (framework || toneId || styleId) {
        finalPrompt = `[TASK: Generate Content] ${frameworkInstruction}${toneStyleInstruction}\n\nContext:\n${prompt}`;
    }
  }

  try {
    const contents = [];
    
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

    const responseStream = await client.models.generateContentStream({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        onChunk(text);
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateMarketingImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<string> => {
    const client = getClient();
    try {
        const enhancedPrompt = `Professional product photography, commercial advertisement style. ${prompt}. High quality, 8k resolution, perfect lighting, photorealistic, trending on artstation, sharp focus, cinematic composition, award-winning photography.`;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        text: enhancedPrompt,
                    },
                ],
            },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio,
                    // imageSize is not supported in gemini-2.5-flash-image
                },
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const base64EncodeString = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                return `data:${mimeType};base64,${base64EncodeString}`;
            }
        }
        throw new Error("No image generated");
    } catch (error) {
        console.error("Gemini Image Gen Error:", error);
        throw error;
    }
};

// ------------------------------------------------------------------
// NEW: Voice Studio Services
// ------------------------------------------------------------------

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
  // sample format (raw)
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

export const generateSpeech = async (
    text: string, 
    voiceName: string = 'Kore', 
    style: string = 'normal', 
    speed: number = 1, 
    pitch: number = 0
): Promise<string> => {
    const client = getClient();
    try {
        // Construct a directive for style/speed/pitch since API doesn't support them directly
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
        
        if (style !== 'normal' || speedStr || pitchStr) {
            let parts = [];
            if (style !== 'normal') parts.push(`${style} tone`);
            if (speedStr) parts.push(`speaking ${speedStr}`);
            if (pitchStr) parts.push(`with a ${pitchStr} voice`);
            
            directive = `(Speaking style: ${parts.join(', ')}): `;
        }

        const finalText = directive ? `${directive}${text}` : text;

        const response = await client.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [{ parts: [{ text: finalText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio generated");

        // Convert Base64 to Raw PCM Bytes
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Add WAV Header
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
    const client = getClient();
    try {
        const speedAdjective = speed < 0.8 ? "very slowly" : speed < 1.0 ? "slowly" : speed > 1.2 ? "quickly" : "";
        const pitchAdjective = pitch < -1 ? "deep" : pitch > 1 ? "high-pitched" : "";

        let promptDirective = "TTS the following conversation between A and B";
        
        let conditions = [];
        if (style !== 'normal') conditions.push(style);
        if (speedAdjective) conditions.push(`speaking ${speedAdjective}`);
        if (pitchAdjective) conditions.push(`with ${pitchAdjective} voices`);
        
        if (conditions.length > 0) {
            promptDirective += ` ${conditions.join(', ')}`;
        }
        
        promptDirective += ":\n" + text;

        const response = await client.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [{ parts: [{ text: promptDirective }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: [
                            {
                                speaker: 'A',
                                voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceA } }
                            },
                            {
                                speaker: 'B',
                                voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceB } }
                            }
                        ]
                    }
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio generated");

        // Convert Base64 to Raw PCM Bytes
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Add WAV Header
        const wavBuffer = addWavHeader(bytes);
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Gemini Conversation TTS Error:", error);
        throw error;
    }
};


// ------------------------------------------------------------------
// NEW: Affiliate Feature Services
// ------------------------------------------------------------------

export const analyzeAffiliateProduct = async (
    url: string,
    description: string,
    imageDatas: string[]
): Promise<AffiliateAnalysisData> => {
    const client = getClient();

    let userPrompt = `Analyze this product from the following inputs. `;
    if (url) userPrompt += `Product URL: ${url}. `;
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
    If exact numbers aren't visible, infer reasonable estimates or state 'N/A'.
    If URL is provided, use Google Search to find this info.`;

    const parts: any[] = [{ text: userPrompt }];

    // Add images if available
    imageDatas.forEach(img => {
        parts.push({
            inlineData: {
                mimeType: getMimeType(img),
                data: cleanBase64(img)
            }
        });
    });

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                // Only add Google Search tool if a URL is actually provided
                tools: url ? [{ googleSearch: {} }] : [],
                systemInstruction: `You are a Shopee Affiliate Analyst. Your job is to extract product metadata strictly. ${SHOPEE_AFFILIATE_GUIDE}`
            }
        });
        
        const jsonText = response.text || "{}";
        return JSON.parse(jsonText) as AffiliateAnalysisData;
    } catch (error) {
        console.error("Analysis Error:", error);
        throw error;
    }
};

export const generateAffiliateContent = async (
    analysisData: AffiliateAnalysisData,
    templateType: 'SHORT_POST' | 'MINI_REVIEW' | 'VIDEO_SCRIPT' | 'TIKTOK' | 'FACEBOOK' | 'INSTAGRAM' | 'YOUTUBE' | 'GENERAL'
): Promise<string> => {
    const client = getClient();

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
    2. Use the specific template requested above.
    3. Output in Thai language (Natural, Selling style).
    4. Include placeholders for [Link] where appropriate.
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: `You are an expert Content Creator for Shopee Affiliates. Reference Guide: ${SHOPEE_AFFILIATE_GUIDE}`
            }
        });

        return response.text || "Failed to generate content.";
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
    const client = getClient();

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
        const response = await client.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: `You are an expert Short Video Script Writer and Content Creator for Shopee/TikTok Affiliates. Reference Guide: ${SHOPEE_AFFILIATE_GUIDE}`
            }
        });

        return response.text || "Failed to generate content.";
    } catch (error) {
        console.error("Script Generation Error:", error);
        throw error;
    }
};

export const chatWithAffiliateExpert = async (message: string, history: {role: string, content: string}[]): Promise<string> => {
    const client = getClient();

    const historyParts = history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
    }));

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
        // We use a stateless approach for simplicity here, effectively a single turn with history context if we wanted to implement chat session, 
        // but for this implementation we'll just send the current message + instructions.
        // For a true chat widget, we might want to maintain history in the component.
        
        const response = await client.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: [
                ...historyParts,
                { role: 'user', parts: [{ text: message }] }
            ],
            config: {
                systemInstruction: systemInstruction
            }
        });
        
        return response.text || "Error getting answer.";
    } catch (error) {
        console.error("Chat Expert Error:", error);
        throw error;
    }
};