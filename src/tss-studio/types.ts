

export enum AppMode {
  AUTO = 'AUTO',
  CAPTION = 'CAPTION',
  REPLY = 'REPLY',
  SCRIPT = 'SCRIPT',
  IMAGE_GEN = 'IMAGE_GEN',
  AFFILIATE = 'AFFILIATE',
  VOICE_STUDIO = 'VOICE_STUDIO'
}

export interface ShopInfo {
  name: string;
  shippingPolicy: string;
  paymentMethods: string;
  additionalInfo: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  modeUsed?: AppMode;
}

export interface GenerationConfig {
  mode: AppMode;
  input: string;
}

export interface HistoryItem {
  id: string;
  mode: AppMode;
  input: string;
  output: string;
  timestamp: number;
  isImage?: boolean;
  isAudio?: boolean;
}

export interface CopywritingFramework {
  id: string;
  name: string;
  structure: string;
  description: string;
}

export const COPYWRITING_FRAMEWORKS: CopywritingFramework[] = [
  { id: 'PAS', name: 'PAS', structure: 'Problem - Agitate - Solve', description: 'ปัญหา -> ขยี้ความกังวล -> ทางออก (สินค้า)' },
  { id: 'AIDA', name: 'AIDA', structure: 'Attention - Interest - Desire - Action', description: 'ดึงดูด -> สร้างความสนใจ -> สร้างความต้องการ -> กระตุ้นให้ซื้อ' },
  { id: 'BAB', name: 'BAB', structure: 'Before - After - Bridge', description: 'สถานการณ์ก่อนมีสินค้า -> สถานการณ์หลังมีสินค้า -> สะพานเชื่อม (สินค้า)' },
  { id: '4Ps', name: '4 P\'s', structure: 'Picture - Promise - Proof - Push', description: 'วาดภาพความสำเร็จ -> สัญญาถึงผลลัพธ์ -> พิสูจน์/รีวิว -> ผลักดันให้ลงมือ' },
  { id: 'ACCA', name: 'ACCA', structure: 'Awareness - Comprehension - Conviction - Action', description: 'รับรู้ -> เข้าใจ -> เชื่อมั่น -> กระทำ' },
  { id: 'AIDCA', name: 'AIDCA', structure: 'Attention - Interest - Desire - Conviction - Action', description: 'AIDA + การสร้างความเชื่อมั่นผ่านหลักฐาน/รีวิว' },
  { id: 'FAB', name: 'FAB', structure: 'Features - Advantages - Benefits', description: 'คุณสมบัติ -> ข้อดีของฟีเจอร์ -> ผลประโยชน์ต่อผู้ใช้' },
  { id: 'HOOK', name: 'The HOOK (เทคนิคฮุค)', structure: 'Hook - Offer - Outcome - Knowledge', description: 'ตะขอเกี่ยว (3 วิแรก) -> ข้อเสนอ -> ผลลัพธ์ -> ความรู้เพิ่มเติม' },
  { id: 'UP', name: 'UP', structure: 'Urgency - Proof', description: 'สร้างความเร่งด่วน -> พิสูจน์/สนับสนุนข้อเสนอ' },
  { id: '4Us', name: '4 U\'s', structure: 'Useful - Urgent - Unique - Ultra-Specific', description: 'มีประโยชน์ -> เร่งด่วน -> ไม่เหมือนใคร -> เจาะจงมาก' },
  { id: 'SCARCITY', name: 'SCARCITY (ความขาดแคลน)', structure: 'Shortage - Consequence - Alternative - Reason - CTA - Immediate - Trust - Yes', description: 'เน้นการขาดแคลนและกระตุ้นให้ตัดสินใจทันที' },
  { id: 'OATH', name: 'OATH', structure: 'Obvious - Awkward - Terrible - Happy', description: 'ชีวิตที่ชัดเจน -> ยุ่งยาก -> แย่ -> มีความสุข (หลังใช้)' },
  { id: 'TCP', name: 'T-C-P', structure: 'Target - Challenge - Product', description: 'ระบุกลุ่มเป้าหมาย -> ระบุความท้าทาย/ปัญหา -> นำเสนอสินค้า' },
  { id: 'PPP', name: 'PPP', structure: 'Presentation - Passion - Purchase', description: 'วิธีนำเสนอที่น่าสนใจ -> สร้างความหลงใหล/ต้องการ -> ชักจูงให้ซื้อ' },
  { id: 'CL', name: 'CL', structure: 'Conclusion - Lessons', description: 'สรุปผลลัพธ์/คำตัดสิน -> บทเรียนที่ได้/ข้อแนะนำ' },
  { id: 'TBB', name: 'T-B-B', structure: 'To buy - Better value - Benefit', description: 'เหตุผลที่ควรซื้อ -> ความคุ้มค่าที่ดีกว่า -> ประโยชน์ที่ได้รับ' },
  { id: 'COMPARE', name: '3-Step Compare (เปรียบเทียบ 3 สิ่ง)', structure: 'Similiarities - Differences - Recommendation', description: 'ความเหมือน -> ความต่าง -> ข้อแนะนำ/สรุป' },
  { id: 'QNA', name: 'Q&A (ถาม-ตอบ)', structure: 'Question - Answer', description: 'ตั้งคำถามที่กลุ่มเป้าหมายสงสัย -> ตอบด้วยสินค้า' },
  { id: 'PROMISE', name: 'P-P-P', structure: 'Promise - Picture - Push', description: 'สัญญาถึงผลลัพธ์ -> วาดภาพความสำเร็จ -> กระตุ้น' },
  { id: 'CC', name: 'CC', structure: 'Community - Call to Share', description: 'ระบุกลุ่มชุมชน -> กระตุ้นให้เข้าร่วม/แชร์ประสบการณ์' },
];

export interface ToneOption {
  id: string;
  label: string;
  description: string;
}

export interface StyleOption {
  id: string;
  label: string;
  description: string;
}

export interface ScriptLengthOption {
  id: string;
  label: string;
  description: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  { id: 'professional', label: 'Professional (มืออาชีพ)', description: 'มืออาชีพ น่าเชื่อถือ' },
  { id: 'trustworthy', label: 'Trustworthy (น่าเชื่อถือ)', description: 'น่าเชื่อถือ จริงใจ' },
  { id: 'friendly', label: 'Friendly (เป็นกันเอง)', description: 'เป็นกันเอง เหมือนเพื่อนคุย' },
  { id: 'luxury', label: 'Luxury (หรูหรา)', description: 'หรูหรา เลอค่า พรีเมียม' },
  { id: 'exciting', label: 'Exciting (ตื่นเต้น)', description: 'ตื่นเต้น เร้าใจ' },
  { id: 'empathetic', label: 'Empathetic (เห็นอกเห็นใจ)', description: 'เข้าอกเข้าใจ อ่อนโยน' },
  { id: 'urgent', label: 'Urgent (เร่งด่วน)', description: 'เร่งรีบ กระตุ้นให้ตัดสินใจ' },
  { id: 'minimal', label: 'Minimal (เรียบง่าย)', description: 'เรียบง่าย สบายตา' },
  { id: 'humorous', label: 'Humorous (ตลก/ขี้เล่น)', description: 'ตลก ขี้เล่น สนุกสนาน' },
];

export const STYLE_OPTIONS: StyleOption[] = [
  { id: 'concise', label: 'Short & Punchy (สั้นกระชับ)', description: 'สั้น กระชับ ได้ใจความ' },
  { id: 'detailed', label: 'Detailed (ละเอียด)', description: 'ละเอียด ครบถ้วน เจาะลึก' },
  { id: 'storytelling', label: 'Storytelling (เล่าเรื่อง)', description: 'เล่าเรื่องราว มีที่มาที่ไป' },
  { id: 'bullet', label: 'Bullet Points (เป็นข้อๆ)', description: 'เป็นข้อๆ อ่านง่าย' },
  { id: 'qna', label: 'Q&A Format (ถาม-ตอบ)', description: 'แบบถาม-ตอบ' },
  { id: 'review', label: 'User Review (รีวิว)', description: 'เน้นความรู้สึกจริง เหมือนลูกค้ามารีวิวเอง (CR)' },
];

export const PLATFORM_OPTIONS = [
  { id: 'facebook', label: 'Facebook', description: 'เน้น Text + Emoji จัดรูปแบบให้น่าอ่าน' },
  { id: 'instagram', label: 'Instagram', description: 'เน้น Visual, Caption สั้นๆ และ Hashtag' },
  { id: 'twitter', label: 'Twitter (X)', description: 'สั้น กระชับ ไม่เกิน 280 ตัวอักษร' },
  { id: 'tiktok', label: 'TikTok (Caption)', description: 'สั้นมากๆ เน้น Hashtag และ Keyword' },
  { id: 'line', label: 'LINE OA', description: 'เป็นกันเอง กระชับ เหมาะกับการ Broadcast' },
  { id: 'youtube', label: 'YouTube', description: 'สคริปต์หรือคำบรรยายวิดีโอ' },
];

export const CONTENT_TYPE_OPTIONS = [
  { id: 'promotional', label: 'Promotional (เน้นขาย)', description: 'เน้นโปรโมชั่น ลดแลกแจกแถม เร่งยอด' },
  { id: 'engagement', label: 'Engagement (ชวนคุย)', description: 'สร้างปฏิสัมพันธ์ ถามคำถาม เล่นเกม' },
  { id: 'educational', label: 'Educational (ให้ความรู้)', description: 'เคล็ดลับ How-to หรือสาระน่ารู้' },
  { id: 'lifestyle', label: 'Lifestyle (ไลฟ์สไตล์)', description: 'เน้นภาพลักษณ์ ความรู้สึก การใช้งานจริง' },
  { id: 'announcement', label: 'Announcement (ประกาศ)', description: 'แจ้งข่าวสำคัญ วันหยุด ของเข้า' },
];

export const AFFILIATE_CONTENT_TYPE_OPTIONS = [
  { id: 'affiliate-review', label: 'รีวิวสินค้า (Product Review)', description: 'เน้นอธิบายการใช้งานจริง ข้อดี-ข้อเสีย ผลลัพธ์หลังใช้จริง' },
  { id: 'affiliate-unboxing', label: 'แกะกล่อง (Unboxing)', description: 'เน้นความรู้สึกแรกเมื่อเปิดกล่อง โชว์แพ็กเกจและของแถม' },
  { id: 'affiliate-comparison', label: 'เปรียบเทียบสินค้า (Comparison)', description: 'เน้นเทียบคุณสมบัติ ข้อดี-ข้อเสีย ความต่างกับแบรนด์อื่นหรือรุ่นเดิม' },
  { id: 'affiliate-promotional', label: 'ป้ายยา/โปรโมชั่น (Promo & Deals)', description: 'เน้นบอกพิกัด ชี้เป้าโค้ดลับ ของแถม และส่วนลดจำกัดเวลา' },
];


export const SCRIPT_LENGTH_OPTIONS: ScriptLengthOption[] = [
  { id: '15s', label: '15 Seconds (สั้นมาก)', description: '~30-40 คำ (TikTok/Shorts)' },
  { id: '30s', label: '30 Seconds (มาตรฐาน)', description: '~60-80 คำ (Reels/Ads)' },
  { id: '60s', label: '60 Seconds (ละเอียด)', description: '~120-140 คำ' },
  { id: 'long', label: 'Long Form (>1 min)', description: 'เล่าเรื่องละเอียด รีวิวเต็ม' },
];

// Script Templates
export interface ScriptTemplate {
  id: string;
  label: string;
  description: string;
}

export const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  { id: 'unboxing', label: 'Unboxing (แกะกล่อง)', description: 'เน้นความตื่นเต้น อวดแพ็กเกจ โชว์ของข้างใน' },
  { id: 'tutorial', label: 'How-to / Tutorial (วิธีใช้)', description: 'สอนใช้งานเป็นขั้นตอน Step-by-step' },
  { id: 'testimonial', label: 'Testimonial (รีวิวผู้ใช้จริง)', description: 'เล่าปัญหาที่เจอ -> ผลลัพธ์หลังใช้' },
  { id: 'comparison', label: 'Comparison (เปรียบเทียบ)', description: 'เทียบกับคู่แข่ง/รุ่นเก่า เน้นจุดเด่นที่เหนือกว่า' },
  { id: 'vlog', label: 'Mini Vlog / Lifestyle', description: 'เล่าเรื่องผ่านชีวิตประจำวัน เน้นความเนียน' },
  { id: 'asmr', label: 'ASMR / Silent Review', description: 'เน้นเสียงสัมผัส เสียงแกะ ไม่เน้นพูดเยอะ' },
  { id: 'problem-solution', label: 'Problem & Solution', description: 'ขยี้ปัญหา -> เสนอทางแก้ด้วยสินค้า' },
];

// Image Generation Options
export interface AspectRatioOption {
  id: string;
  label: string;
  description: string;
}

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { id: '1:1', label: '1:1 Square', description: 'IG / Facebook' },
  { id: '16:9', label: '16:9 Landscape', description: 'Youtube / Web' },
  { id: '9:16', label: '9:16 Portrait', description: 'TikTok / Stories' },
  { id: '4:3', label: '4:3 Standard', description: 'TV / Monitor' },
  { id: '3:4', label: '3:4 Vertical', description: 'iPad / Print' },
];

// Voice Options
export interface VoiceOption {
  id: string;
  label: string;
  description: string;
  gender: 'Male' | 'Female';
}

export const VOICE_PRESETS: VoiceOption[] = [
  { id: 'Puck', label: 'Puck (Soft)', description: 'เสียงผู้ชาย นุ่มนวล สุภาพ', gender: 'Male' },
  { id: 'Kore', label: 'Kore (Calm)', description: 'เสียงผู้หญิง สงบ ผ่อนคลาย', gender: 'Female' },
  { id: 'Charon', label: 'Charon (Deep)', description: 'เสียงผู้ชาย ทุ้มลึก น่าเชื่อถือ', gender: 'Male' },
  { id: 'Fenrir', label: 'Fenrir (Speed)', description: 'เสียงผู้ชาย รวดเร็ว กระฉับกระเฉง', gender: 'Male' },
  { id: 'Zephyr', label: 'Zephyr (Bright)', description: 'เสียงผู้หญิง สดใส เป็นมิตร', gender: 'Female' },
];

export const VOICE_STYLES = [
  { id: 'normal', label: 'Normal (ปกติ)' },
  { id: 'cheerfully', label: 'Cheerful (ร่าเริง)' },
  { id: 'sadly', label: 'Sad (เศร้า)' },
  { id: 'excitedly', label: 'Excited (ตื่นเต้น)' },
  { id: 'seriously', label: 'Serious (จริงจัง)' },
  { id: 'whispering', label: 'Whisper (กระซิบ)' },
  { id: 'terrified', label: 'Scared (กลัว)' },
];

// New Interfaces for Affiliate Mode
export interface AffiliateAnalysisData {
  productName: string;
  category: string;
  sellerType: string;
  sellingPrice: string;
  originalPrice: string;
  salesCount: string;
  reviewCount: string;
  rating: string;
  likes: string;
  videoCount: string;
  promotions: string;
  affiliateCommission: string;
  affiliateCommissionRate: string;
  details: string;
  guarantee: string;
}

export interface CharLimitOption {
  id: string;
  label: string;
  description: string;
  limit: number;
}

export const CHAR_LIMIT_OPTIONS: CharLimitOption[] = [
  { id: 'short', label: 'สั้นกระชับ (~100 ตัวอักษร)', description: 'เหมาะกับโพสต์ด่วน คำคม หรือตอบคำถามสั้นๆ', limit: 100 },
  { id: 'medium', label: 'ปานกลาง (~300 ตัวอักษร)', description: 'ความยาวมาตรฐานสำหรับแคปชั่นทั่วไป', limit: 300 },
  { id: 'long', label: 'ยาว (~600 ตัวอักษร)', description: 'เน้นรายละเอียดสินค้า รีวิว หรือคำตอบที่ครอบคลุม', limit: 600 },
  { id: 'very-long', label: 'ยาวมาก (~1,200 ตัวอักษร)', description: 'สคริปต์ยาว รีวิวเต็มรูปแบบ หรือบทความเจาะลึก', limit: 1200 },
];