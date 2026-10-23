import React from "react";
import { scanScriptForProhibitedWords } from "../utils/shield";
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

interface CommunityShieldProps {
  script: string;
}

export default function CommunityShield({ script }: CommunityShieldProps) {
  const issues = scanScriptForProhibitedWords(script);
  const isSafe = issues.length === 0;

  return (
    <div className="space-y-4">
      {/* Real-time Status Card */}
      {isSafe ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-sans text-sm font-bold text-emerald-800">🛡️ ปลอดภัย 100%</h4>
            <p className="text-[11px] text-emerald-700/90 font-sans mt-0.5 leading-relaxed">
              สคริปต์นี้สอดคล้องตามมาตรฐานชุมชน Shopee Affiliate & TikTok Shop ไม่พบคำต้องห้ามเสี่ยงโดนแบนหรือลดการมองเห็น
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-sans text-sm font-bold text-red-700">
              พบจุดเสี่ยงสะสมทั้งหมด {issues.reduce((acc, issue) => acc + issue.count, 0)} แห่ง ({issues.length} คำต้องห้าม)
            </h4>
            <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
              กรุณาหลีกเลี่ยงหรือเปลี่ยนไปใช้คำแนะนำด้านล่าง เพื่อหลีกเลี่ยงการโดนแบนช่อง ปรับลดการมองเห็น หรือละเมิดเกณฑ์ อย./สคบ.
            </p>
          </div>
        </div>
      )}

      {/* Issues list breakdown */}
      {!isSafe && (
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {issues.map((issue, index) => (
            <div 
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-xs transition-all hover:border-slate-300"
            >
              {/* Issue header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-700 font-sans">
                    {issue.category}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    พบ {issue.count} ครั้ง
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-500/10 px-2 py-0.5 rounded-full font-mono">
                  "{issue.word}"
                </div>
              </div>

              {/* Danger description */}
              <div className="flex gap-2 text-xs text-slate-700 leading-relaxed font-sans">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p>{issue.reason}</p>
              </div>

              {/* Suggestion / Alternative words */}
              <div className="flex gap-2 rounded-lg bg-emerald-50 border border-emerald-100 p-2.5 text-xs text-slate-700 leading-relaxed font-sans">
                <Lightbulb className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-700">💡 คำแนะนำปรับเปลี่ยน:</span>
                  <p className="mt-0.5 text-slate-600">
                    ลองใช้คำว่า <span className="font-bold text-amber-700">"{issue.suggestion}"</span> แทน
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Guide Card */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2.5">
        <h5 className="font-sans text-xs font-bold text-slate-800">💡 คำเตือนทั่วไปสำหรับครีมเครื่องสำอางและอาหารเสริม:</h5>
        <ul className="list-disc pl-4 text-[10.5px] text-slate-600 space-y-1.5 font-sans leading-relaxed">
          <li><strong>กลุ่มสกินแคร์ / คอสเมติก:</strong> หลีกเลี่ยงการเคลมระยะเวลาที่สั้นเกินจริง (เช่น ขาวใน 3 วัน, สิวยุบข้ามคืน) และห้ามโฆษณาว่า "รักษาฝ้ากระหายขาด"</li>
          <li><strong>กลุ่มอาหารเสริมควบคุมน้ำหนัก:</strong> ห้ามอ้างความรวดเร็วเร่งด่วนในการลดน้ำหนัก และห้ามระบุตัวเลขกิโลกรัมเด็ดขาด</li>
          <li><strong>กลุ่มยาสมุนไพร / อาหารทั่วไป:</strong> ห้ามอวดสรรพคุณว่าสามารถป้องกันหรือ "รักษาโรค" (เช่น มะเร็ง, เบาหวาน, ความดัน)</li>
        </ul>
      </div>
    </div>
  );
}
