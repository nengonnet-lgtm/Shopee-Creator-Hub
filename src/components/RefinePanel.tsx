import React, { useState } from "react";
import { Sparkles, MessageSquare, RefreshCw, AlertCircle } from "lucide-react";

interface RefinePanelProps {
  script: string;
  onRefineSuccess: (refinedText: string) => void;
  category: string;
  targetLength?: number;
}

const TONES = [
  { id: "energetic", label: "TikTok / รีวิววัยรุ่น", emoji: "🔥", desc: "สไตล์ไฮป์ ตื่นเต้น เร่งเร้า มีจังหวะจับใจ" },
  { id: "friendly", label: "รีวิวเป็นกันเอง", emoji: "🌸", desc: "สไตล์รีวิวแนะนำเพื่อนอบอุ่น น่าเชื่อถือ จริงใจ" },
  { id: "urgent", label: "ปิดการขายเร่งรัด", emoji: "🚨", desc: "สไตล์เร่งด่วน FOMO ตะกร้าเหลืองจะหมดแล้ว" },
  { id: "punchy", label: "สั้นกระชับได้ใจความ", emoji: "⚡", desc: "กระชับ ตรงประเด็น เหมาะสำหรับสตอรี่สั้น" },
];

export default function RefinePanel({ script, onRefineSuccess, category, targetLength }: RefinePanelProps) {
  const [selectedTone, setSelectedTone] = useState("energetic");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefine = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: script,
          tone: selectedTone,
          language: "Thai",
          targetLength,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to refine script.");
      }

      if (data.refinedText) {
        onRefineSuccess(data.refinedText);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while refining your script.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4 shadow-xs">
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-amber-500/10 p-1.5 text-amber-600">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-sans text-sm font-bold text-slate-800">AI Script Enhancer (ขัดเกลาสคริปต์ด้วย AI)</h4>
          <p className="text-[10px] text-slate-500 font-sans">
            ปรับเปลี่ยนระดับอารมณ์และสไตล์การพูดให้เหมาะกับวิดีโอ
          </p>
        </div>
      </div>

      {/* Tone Grid Selection */}
      <div className="grid grid-cols-2 gap-2">
        {TONES.map((tone) => {
          const isSelected = selectedTone === tone.id;
          return (
            <button
              key={tone.id}
              type="button"
              onClick={() => setSelectedTone(tone.id)}
              className={`flex flex-col justify-between rounded-lg border p-2.5 text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-amber-50 border-amber-500/60 shadow shadow-amber-500/5"
                  : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{tone.emoji}</span>
                <span className={`font-sans text-xs font-semibold ${isSelected ? "text-amber-700 font-bold" : "text-slate-700"}`}>
                  {tone.label}
                </span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 font-sans line-clamp-2">{tone.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Error block */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="font-sans">{error}</p>
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        disabled={isLoading || !script.trim()}
        onClick={handleRefine}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/10 transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
      >
        {isLoading ? (
          <>
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>กำลังปรับแต่งบทสคริปต์...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5" />
            <span>ปรับสคริปต์เป็นสไตล์ที่เลือก</span>
          </>
        )}
      </button>
    </div>
  );
}
