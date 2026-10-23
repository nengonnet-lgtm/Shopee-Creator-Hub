import React, { useState } from "react";
import { 
  Link, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  Globe, 
  CheckCircle,
  Sliders,
  Compass,
  Zap,
  Tag,
  Smile,
  LayoutTemplate,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface UrlAnalyzerProps {
  onAnalysisSuccess: (data: {
    productName: string;
    category: string;
    highlights: Array<{ label: string; value: string; detail: string }>;
    scriptText: string;
    structuredScript: string;
  }) => void;
  targetLength: number;
  setTargetLength: (len: number) => void;
}

export default function UrlAnalyzer({ onAnalysisSuccess, targetLength, setTargetLength }: UrlAnalyzerProps) {
  const [url, setUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [contentType, setContentType] = useState("review");
  const [purpose, setPurpose] = useState("sales");
  const [framework, setFramework] = useState("aida");
  const [tone, setTone] = useState("friendly");
  const [style, setStyle] = useState("storytelling");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(true);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Require either URL or Product details
    if (!url.trim() && !productName.trim()) {
      setError("กรุณากรอกลิงก์สินค้าจาก Shopee หรือใส่ข้อมูล/ชื่อสินค้าเพื่อให้ AI ทำงาน");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/gemini/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: url.trim() || undefined,
          productName: productName.trim() || undefined,
          contentType,
          purpose,
          framework,
          tone,
          style,
          targetLength
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to analyze product URL.");
      }

      if (resData.success && resData.data) {
        onAnalysisSuccess(resData.data);
        setSuccessMessage(`เขียนสคริปต์ "${resData.data.productName}" สำเร็จตามรูปแบบที่คุณตั้งค่าไว้เรียบร้อยแล้ว!`);
        // If they had url or name, we don't clear them so they can refine, but keep it friendly
      } else {
        throw new Error("Invalid response format received from the server.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "เกิดข้อผิดพลาดในการวิเคราะห์และสร้างสคริปต์ กรุณาตรวจสอบลิงก์หรือรายละเอียดอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const contentTypes = [
    { id: "review", label: "รีวิวสินค้า (Product Review)", desc: "เน้นการใช้งานจริง บอกข้อดี-ข้อพิจารณาตรงไปตรงมา" },
    { id: "unboxing", label: "แกะกล่อง (Unboxing)", desc: "เน้นความรู้สึกแรกตอนเปิดกล่อง ความสวยงาม และของแถม" },
    { id: "comparison", label: "เปรียบเทียบสินค้า (Comparison)", desc: "เน้นเปรียบเทียบข้อดี ข้อพิจารณา ความแตกต่างกับคู่แข่ง" },
    { id: "promo", label: "ป้ายยา/โปรโมชั่น (Promo & Deals)", desc: "เน้นชี้เป้า พิกัดร้าน โค้ดส่วนลด ดีลจำกัดเวลา" }
  ];

  const purposes = [
    { id: "sales", label: "เพื่อการโปรโมต/ขาย", desc: "กระตุ้นความต้องการซื้อปิดยอดขายทันที" },
    { id: "familiarity", label: "สร้างความคุ้นเคย", desc: "บอกต่อเคล็ดลับการใช้เสมือนแชร์ให้คนรู้จัก" },
    { id: "lifestyle", label: "เน้นไลฟ์สไตล์", desc: "สอดแทรกการใช้สินค้ากับชีวิตประจำวัน" }
  ];

  const frameworks = [
    { id: "aida", label: "AIDA", desc: "Attention ดึงดูด -> Interest สนใจ -> Desire อยากได้ -> Action สั่งซื้อ" },
    { id: "pas", label: "PAS", desc: "Problem ขยี้ปัญหา -> Agitate ขยายผลลัพธ์ย่ำแย่ -> Solution ทางออก" },
    { id: "bab", label: "BAB", desc: "Before ชีวิตก่อนใช้ -> After สบายหลังใช้ -> Bridge เชื่อมโยงด้วยสินค้า" },
    { id: "fab", label: "FAB", desc: "Features สเปกสินค้า -> Advantages จุดขายที่เหนือกว่า -> Benefits ประโยชน์ที่จะได้รับ" },
    { id: "hook", label: "The HOOK (3 วิแรก)", desc: "คำทอล์กเปิดคลิปทรงพลังหยุดคนดู และอธิบายอย่างกระชับ" }
  ];

  const tones = [
    { id: "friendly", label: "เป็นกันเอง (Friendly)", desc: "คุยสนุกเหมือนพื่อนคุยกับเพื่อน แกๆ ตัวนี้ปังมาก" },
    { id: "excited", label: "ตื่นเต้น เร้าใจ (Excited)", desc: "เอ็นเนอร์จีสูง ตื่นเต้นกระตุ้นอารมณ์ ปังมากคุณน้า!" },
    { id: "trustworthy", label: "น่าเชื่อถือ (Trustworthy)", desc: "สุภาพ สุขุม เป็นหลักการ ข้อมูลอ้างอิงชัดเจนดูมีความเชี่ยวชาญ" },
    { id: "playful", label: "ขี้เล่น (Playful)", desc: "สนุกสนาน คุยตลก ทะเล้น น่าเอ็นดู เข้าถึงง่ายไม่เกร็ง" }
  ];

  const styles = [
    { id: "concise", label: "สั้นกระชับ (Concise)", desc: "เน้นยิงจุดสำคัญ สั้น เข้าประเด็นไว ไม่มีน้ำ" },
    { id: "storytelling", label: "เล่าเรื่อง (Storytelling)", desc: "ผูกเรื่องราวน่าติดตาม มีต้นสายปลายเหตุชวนฟังสรุปท้าย" },
    { id: "cr", label: "ผู้ใช้จริง CR (Consumer Review)", desc: "เน้นความเห็นจริงใจ คุยเรียลๆ ปลอดภัยต่อการฟัง" }
  ];

  return (
    <div id="shopee-affiliate-creator" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-sans text-sm font-bold text-slate-900 flex items-center gap-1.5">
              Shopee Affiliate Script Builder
              <span className="inline-flex items-center rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 uppercase tracking-wider">
                PRO v2.0
              </span>
            </h4>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
              ตั้งค่าคุณสมบัติสคริปต์เพื่อเขียนเนื้อหารีวิวระดับโลกด้วยขุมพลังอัจฉริยะ Gemini
            </p>
          </div>
        </div>
      </div>

      {/* Main Builder Form */}
      <form onSubmit={handleAnalyze} className="space-y-4">
        
        {/* Source Inputs */}
        <div className="space-y-3.5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 font-sans mb-1.5 flex items-center gap-1.5">
              <Link className="h-3.5 w-3.5 text-amber-500" />
              URL สินค้าจาก Shopee (วิเคราะห์หาจุดเด่นและค่าคอมฯ อัตโนมัติ)
            </label>
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 focus-within:border-amber-500/50 transition-colors">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="วางลิงก์สินค้า เช่น https://shopee.co.th/product-details..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none py-1 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 font-sans mb-1.5 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-amber-500" />
              รายละเอียดสินค้าเพิ่มเติม / คีย์เวิร์ด (จำเป็นเมื่อไม่มี URL)
            </label>
            <textarea
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="เช่น ครีมกันแดดคุมมัน สูตรน้ำบางเบา ทาทับเมคอัพได้ ซึมไว ไม่เป็นคราบ คุ้มค่ามากสำหรับหน้าร้อน"
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500/50 focus:outline-none transition-colors leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Toggle Advanced Configuration */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="font-sans font-bold flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-amber-500" />
            ตั้งค่ารูปแบบเนื้อหาอัจฉริยะ (Advanced Content Settings)
          </span>
          {showAdvanced ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/30 p-4">
            
            {/* 1. Content Type (ประเภทคอนเทนต์) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 font-sans">
                ประเภทคอนเทนต์เฉพาะทาง (Advanced Content Type)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {contentTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setContentType(type.id)}
                    className={`rounded-xl border p-2.5 text-left transition-all ${
                      contentType === type.id
                        ? "bg-amber-50 border-amber-500/50 text-amber-800 shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-xs font-bold font-sans flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${contentType === type.id ? "bg-amber-500" : "bg-slate-300"}`} />
                      {type.label}
                    </div>
                    <p className="text-[9px] text-slate-500 mt-1 font-sans leading-relaxed">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Copywriting Framework (โครงสร้างการเขียน) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1">
                <LayoutTemplate className="h-3 w-3 text-amber-500" />
                โครงสร้างการเขียน (Copywriting Framework)
              </label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-amber-500/50 focus:outline-none transition-colors font-sans"
              >
                {frameworks.map((fw) => (
                  <option key={fw.id} value={fw.id}>
                    {fw.label} - {fw.desc.substring(0, 35)}...
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-slate-500 font-sans pl-1">
                {frameworks.find(fw => fw.id === framework)?.desc}
              </p>
            </div>

            {/* 3. Purpose (จุดประสงค์) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-500" />
                จุดประสงค์เนื้อหา (Purpose)
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-amber-500/50 focus:outline-none transition-colors font-sans"
              >
                {purposes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-slate-500 font-sans pl-1">
                {purposes.find(p => p.id === purpose)?.desc}
              </p>
            </div>

            {/* 4. Tone (น้ำเสียง) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1">
                <Smile className="h-3 w-3 text-amber-500" />
                บุคลิกน้ำเสียง (Tone)
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-amber-500/50 focus:outline-none transition-colors font-sans"
              >
                {tones.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-slate-500 font-sans pl-1">
                {tones.find(t => t.id === tone)?.desc}
              </p>
            </div>

            {/* 5. Style (สไตล์การนำเสนอ) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1">
                <Compass className="h-3 w-3 text-amber-500" />
                สไตล์การเล่าเรื่อง (Style)
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-amber-500/50 focus:outline-none transition-colors font-sans"
              >
                {styles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-slate-500 font-sans pl-1">
                {styles.find(s => s.id === style)?.desc}
              </p>
            </div>

          </div>
        )}

        {/* Generate / Action Button */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Gemini กำลังร่างโครงสร้างและเขียนบทขายของปังๆ...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>สร้างบทสคริปต์อัจฉริยะ (Generate Affiliate Script)</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Progress Feedback */}
      {isLoading && (
        <div className="flex items-center gap-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 p-3.5 text-xs text-amber-600 animate-pulse">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent shrink-0" />
          <p className="font-sans leading-relaxed">
            ระบบกำลังประมวลสเปกสินค้า ผูกโครงสร้างคัดลอกบทพูดสากล ({framework.toUpperCase()}) พร้อมคุมกฎข้อห้าม อย./สคบ. และเกณฑ์ Shopee ไม่ให้สคริปต์ปลิว...
          </p>
        </div>
      )}

      {/* Error Feedback */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold font-sans">เกิดข้อผิดพลาด</p>
            <p className="font-sans leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Success Feedback */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <p className="font-sans font-medium">{successMessage}</p>
        </div>
      )}
    </div>
  );
}
