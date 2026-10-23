import { ScriptPreset, VoiceProfile } from "../types";

export const SCRIPT_PRESETS: ScriptPreset[] = [
  {
    id: "steam-iron",
    title: "มาดูไอเทมช่วยชีวิต! (เตารีดไอน้ำแบบพกพา)",
    description: "The user's original enthusiastic review for the compact steam iron.",
    category: "Home & Living",
    language: "Thai",
    text: "มาดูไอเทมช่วยชีวิต! ตัวนี้คือเตารีดไอน้ำแบบพกพา ไซส์เค้ากะทัดรัดมาก จับถนัดมือสุดๆ จะรีดมุมไหนก็สะดวก แล้วดูไอน้ำ! แรงสะใจ รีดเรียบได้เร็วทันใจจริงๆ ใครที่ต้องเดินทางบ่อย หรือมีพื้นที่จำกัด นี่คือตอบโจทย์เลยนะ ไม่ต้องกลัวเสื้อยับอีกต่อไป พกไปได้ทุกที่เลย!"
  },
  {
    id: "cosmetics-glowing",
    title: "สกินแคร์กู้หน้าโทรม (แอมพูลผิวฉ่ำวาว)",
    description: "An exciting beauty influencer style review for skincare ampoules.",
    category: "Beauty & Fashion",
    language: "Thai",
    text: "สกินแคร์ตัวใหม่ล่าสุดที่ใช้แล้วผิวฉ่ำโกลว์มากคุณน้า! แอมพูลกู้หน้าโทรมสูตรเร่งด่วน แค่ทาก่อนนอน ตื่นมาผิวฟูอิ่มน้ำเหมือนนอนครบแปดชั่วโมง เนื้อบางเบา ซึมไวสุดๆ ไม่เหนอะหนะผิวเลย ใครแกะกล่องลองใช้ต้องรักแน่นอน กดในตะกร้าเหลืองด่วนๆ เลยนะค้าา!"
  },
  {
    id: "gadget-unboxing",
    title: "หูฟังตัดเสียงระดับโปร (Noise Cancelling)",
    description: "A professional and informative product unboxing style review.",
    category: "Electronics",
    language: "Thai",
    text: "รีวิวหูฟังไร้สายรุ่นใหม่ล่าสุด จุดเด่นคือระบบตัดเสียงรบกวนที่เงียบกริบเหมือนอยู่ในโลกส่วนตัว เสียงเบสแน่นตึ้บ ใสเคลียร์ทุกย่านเสียง ดีไซน์เท่พรีเมียม สวมใส่สบายหูตลอดทั้งวัน แบตอึดใช้งานได้ยาวนานยี่สิบสี่ชั่วโมงเต็ม พกตัวเดียวจบทุกการเดินทางครับ"
  }
];

export const VOICE_PROFILES: VoiceProfile[] = [
  {
    voiceName: "Kore",
    displayLabel: "Kore (เสียงกลาง ทรงพลัง & มั่นคง)",
    gender: "Male",
    toneDescription: "Deep, clear, trustworthy, and authoritative. Excellent for professional gadget reviews and household item presentations.",
    language: "Multi-lingual",
    tags: ["Professional", "Household", "Trustworthy"]
  },
  {
    voiceName: "Zephyr",
    displayLabel: "Zephyr (เสียงอบอุ่น ชิลๆ & อธิบายเก่ง)",
    gender: "Male",
    toneDescription: "Calm, smooth, highly articulate, and warm. Perfect for detailed explanations, tutorials, and lifestyle storytelling.",
    language: "Multi-lingual",
    tags: ["Warm", "Educational", "Chill"]
  },
  {
    voiceName: "Puck",
    displayLabel: "Puck (เสียงตื่นเต้น ขี้เล่น & ไฮป์สุดๆ)",
    gender: "Female",
    toneDescription: "High energy, enthusiastic, playful, and bright. Designed for high-converting TikTok reels, flash sale alerts, and upbeat hooks.",
    language: "Multi-lingual",
    tags: ["High Energy", "TikTok", "Exciting"]
  },
  {
    voiceName: "Charon",
    displayLabel: "Charon (เสียงนุ่มนวล เป็นมิตร & อ่อนโยน)",
    gender: "Female",
    toneDescription: "Soft, friendly, caring, and conversational. Great for beauty skincare reviews, cosmetics, or comforting lifestyle tips.",
    language: "Multi-lingual",
    tags: ["Friendly", "Cosmetics", "Gentle"]
  },
  {
    voiceName: "Fenrir",
    displayLabel: "Fenrir (เสียงเข้ม ทรงพลัง & มีพลังดึงดูด)",
    gender: "Male",
    toneDescription: "Strong, commanding, theatrical, and deep. Ideal for urgent limited-time deals (FOMO), luxurious branding, or dramatic openings.",
    language: "Multi-lingual",
    tags: ["Dramatic", "Urgent", "Premium"]
  }
];
