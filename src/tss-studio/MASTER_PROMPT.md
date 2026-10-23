# MASTER PROMPT: AI Shop Assistant (พิมพ์เขียวระบบ)

เอกสารนี้รวบรวม Logic, System Instructions, Prompt Engineering และ Constants ทั้งหมดที่ใช้ในแอปพลิเคชัน "AI Shop Assistant" เพื่อให้สามารถนำไปสร้างแอปพลิเคชันใหม่ที่ทำงานได้เหมือนต้นฉบับ 100%

---

## 1. Tech Stack & Configuration
*   **Model:** Gemini 3 Pro Preview (for text/reasoning), Gemini 2.5 Flash Image (for image gen), Gemini 2.5 Flash TTS (for voice).
*   **Library:** `@google/genai` SDK.
*   **Framework:** React + TypeScript + Tailwind CSS.

---

## 2. System Instructions (คำสั่งระบบหลัก)

นี่คือ "หัวใจ" ของ AI ที่กำหนดบุคลิกและหน้าที่ (Persona) ถูกกำหนดไว้ในตัวแปร `BASE_SYSTEM_INSTRUCTION` ในไฟล์ `services/geminiService.ts`

```javascript
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
- **Pacing Cues**: ใส่คำกำกับจังหวะในวงเล็บ เช่น (เน้นเสียง), (กระซิบ), (เสียงตื่นเต้น) เพื่อให้คนพากย์เห็นภาพ
- **Short Sentences**: แบ่งประโยคให้สั้น เพื่อให้จังหวะการหายใจง่าย
- **Structure**: Hook -> Pain Point -> Product/Solution -> Call to Action

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
```

---

## 3. Dynamic Prompt Logic (ตรรกะการสร้างคำสั่งแบบพลวัต)

แอปพลิเคชันไม่ได้ส่งแค่ข้อความของผู้ใช้ไปตรงๆ แต่มีการ "ฉีด" (Inject) บริบทเพิ่มเติมเข้าไปใน Prompt โดยอัตโนมัติ ตาม Logic ดังนี้:

### 3.1 โครงสร้าง Prompt รวม (`finalPrompt`)

สูตร: `[Task Instruction] + [Platform Rules] + [Framework] + [Tone/Style] + [Context/User Input]`

#### A. การจัดการ Framework (Copywriting Frameworks)
หากผู้ใช้เลือก Framework ระบบจะเติมคำสั่งนี้ลงไป:
> `\n\n[PROMPT CONFIG: Use Copywriting Framework "${framework.name}"]\nStructure: ${framework.structure}\nDescription: ${framework.description}\nRequirement: Follow this structure strictly for maximum impact.`

#### B. การจัดการ Tone & Style
> `\n[PROMPT CONFIG: Tone]\nAdopt a "${tone.label}" tone (${tone.description}).`
> `\n[PROMPT CONFIG: Style]\nFormat the output as "${style.label}" (${style.description}).`

#### C. การจัดการ Platform (สำหรับโหมด Caption)
*   **Instagram:** `Use engaging spacing, emojis, and include 10-15 relevant hashtags at the bottom.`
*   **Twitter (X):** `Keep it extremely concise (under 280 chars), impactful, and use 1-2 trending hashtags.`
*   **Facebook:** `Use easy-to-read paragraph spacing.`

#### D. การจัดการ Script Video (สำหรับโหมด Script)
*   **Target Audience:** `Target Group: "${targetAudience}"... Use their slang, address their specific pain points...`
*   **Tone:** `Insert acting cues in parentheses like (เสียงตื่นเต้น)...`
*   **Length:** `Target Duration: ${lengthOption.label}... Control the word count...`
*   **Template Injection:** หากเลือก Template (เช่น Unboxing) ระบบจะใส่ Structure เฉพาะของ Template นั้นลงไป (เช่น "1. Intro, 2. ASMR sounds, 3. Reveal...")

---

## 4. Constants & Data Dictionaries (ฐานข้อมูลตัวเลือก)

รายละเอียด Text ทั้งหมดที่ใช้ใน Dropdown และการส่งค่าให้ AI (จากไฟล์ `types.ts`)

### 4.1 AppMode (โหมดการทำงาน)
| ID | Label | Description (ความหมาย) |
| :--- | :--- | :--- |
| `AUTO` | อัตโนมัติ | ให้ AI ตัดสินใจเองตามบริบท |
| `CAPTION` | เขียนโพสต์ | เขียนแคปชั่นขายของ Social Media |
| `REPLY` | ตอบแชท | ร่างคำตอบลูกค้า ปิดการขาย แก้ปัญหา |
| `SCRIPT` | สคริปต์ | เขียนบทวิดีโอสั้น (Shorts/Reels/TikTok) |
| `IMAGE_GEN` | สร้างรูป | สร้างภาพโฆษณา AI |
| `VOICE_STUDIO` | เสียงพากย์ | แปลงข้อความเป็นเสียง (TTS) |
| `AFFILIATE` | นายหน้า | ผู้ช่วยทำ Affiliate Shopee/TikTok |

### 4.2 Copywriting Frameworks (สูตรการเขียน)
AI จะยึดโครงสร้างเหล่านี้ในการเขียนเนื้อหา:
1.  **PAS:** Problem (ปัญหา) - Agitate (ขยี้) - Solve (ทางออก)
2.  **AIDA:** Attention (ดึงดูด) - Interest (สนใจ) - Desire (อยากได้) - Action (กระทำ)
3.  **BAB:** Before (ก่อนใช้) - After (หลังใช้) - Bridge (ตัวเชื่อม/สินค้า)
4.  **4 P's:** Picture (วาดภาพ) - Promise (สัญญา) - Proof (พิสูจน์) - Push (ผลักดัน)
5.  **FAB:** Features (คุณสมบัติ) - Advantages (ข้อดี) - Benefits (ประโยชน์)
6.  **HOOK:** Hook (ตะขอเกี่ยว) - Offer (ข้อเสนอ) - Outcome (ผลลัพธ์) - Knowledge (ความรู้)
7.  **SCARCITY:** เน้นความขาดแคลน กระตุ้นให้รีบซื้อ

### 4.3 Script Templates (สูตรสคริปต์วิดีโอ)
1.  **Unboxing:** แกะกล่อง เน้นความตื่นเต้น
2.  **Tutorial:** How-to สอนใช้งาน
3.  **Testimonial:** รีวิวจากผู้ใช้จริง
4.  **Comparison:** เปรียบเทียบกับคู่แข่ง
5.  **ASMR:** เน้นเสียงสัมผัส ไม่เน้นพูดเยอะ

### 4.4 Voice Options (เสียงพากย์)
*   **Puck:** ชาย นุ่มนวล สุภาพ
*   **Kore:** หญิง สงบ ผ่อนคลาย (Default)
*   **Charon:** ชาย ทุ้มลึก น่าเชื่อถือ
*   **Fenrir:** ชาย เร็ว กระฉับกระเฉง
*   **Zephyr:** หญิง สดใส เป็นมิตร

---

## 5. Affiliate Mode Logic (ตรรกะโหมดนายหน้า)

โหมดนี้มีความซับซ้อนพิเศษ แบ่งเป็น 2 ขั้นตอน:

### Step 1: Analyze Product (วิเคราะห์สินค้า)
**Prompt:**
> `Analyze this product from the following inputs. [URL] [Description] [Images]. Task: Extract detailed product information and return ONLY a valid JSON object...`

**Schema (JSON) ที่ AI ต้องตอบกลับ:**
```json
{
  "productName": "string",
  "category": "string",
  "sellerType": "string",
  "sellingPrice": "string",
  "affiliateCommission": "string (คำนวณ 5-10%)",
  "salesCount": "string",
  "rating": "string",
  "promotions": "string",
  "details": "string"
}
```

### Step 2: Generate Content (สร้างคอนเทนต์)
**Prompt:**
> `[TASK: Generate Affiliate Content] Template Type: ${templateType}. Product Data: ${JSON.stringify(analysisData)}. Instruction: STRICTLY follow the "Shopee Affiliate Complete Guide" content style.`

**Knowledge Base:**
ระบบจะแนบ `SHOPEE_AFFILIATE_GUIDE` (ข้อความขนาดยาวเกี่ยวกับเทคนิค Affiliate) ไปใน System Instruction เพื่อให้ AI เขียนได้ถูกต้องตามหลักการ

---

## 6. Image Generation Logic (ตรรกะสร้างภาพ)

เมื่อผู้ใช้สั่งสร้างภาพ ระบบจะไม่ได้ส่ง Prompt ไปตรงๆ แต่จะทำการ **Enhance** (ขยายความ) ก่อนส่งให้โมเดล `gemini-2.5-flash-image`

**Logic:**
```javascript
const enhancedPrompt = `Professional product photography, commercial advertisement style. ${user_input}. High quality, 8k resolution, perfect lighting, photorealistic, trending on artstation, sharp focus, cinematic composition, award-winning photography.`;
```
*เหตุผล:* เพื่อให้ภาพที่ออกมามีความสวยงามระดับมืออาชีพโดยที่ผู้ใช้ไม่ต้องพิมพ์คำสั่งยาวๆ เอง

---

## 7. Voice Studio Logic (ตรรกะสร้างเสียง)

ใช้โมเดล `gemini-2.5-flash-preview-tts`

**Single Speaker:**
ส่ง `text` และ `voiceConfig` ไปตรงๆ

**Conversation (บทสนทนา):**
ใช้ฟีเจอร์ `multiSpeakerVoiceConfig` ของ Gemini API
**Prompt Construction:**
> `TTS the following conversation between A and B: ${user_input}`
> (ระบบกำหนด Speaker A และ Speaker B ใน Config)

---

## 8. UI/UX Logic Constraints

*   **Character Limits:**
    *   Caption: 2,200 chars (IG limit)
    *   Reply: 2,000 chars
    *   Script: 10,000 chars
*   **Visual Feedback:**
    *   เมื่อถึง 90% ของ Limit -> กรอบสีเหลือง (Warning)
    *   เมื่อเกิน Limit -> กรอบสีแดง (Error) + ปิดปุ่ม Generate

---

นำข้อมูลทั้งหมดนี้ไปป้อนให้ AI Developer เพื่อสร้างโปรเจกต์ใหม่ หรือใช้ตรวจสอบความถูกต้องของ Logic ในปัจจุบันได้ทันที
