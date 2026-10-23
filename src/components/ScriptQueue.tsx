import React, { useState } from "react";
import { QueueItem } from "../types";
import { VOICE_PROFILES } from "../data/presets";
import { 
  ListOrdered, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Check, 
  X, 
  Sparkles, 
  Volume2, 
  AlertCircle,
  HelpCircle,
  Info
} from "lucide-react";

interface ScriptQueueProps {
  queue: QueueItem[];
  setQueue: React.Dispatch<React.SetStateAction<QueueItem[]>>;
  onAddToQueue: (text: string, voice: string, emotion: string) => void;
  onGenerateQueue: () => void;
  isQueueGenerating: boolean;
  onStopQueue: () => void;
  onPlayResult: (resultId: string) => void;
  currentMainScript: string;
  currentMainVoice: string;
  currentMainEmotion: string;
}

const EMOTION_OPTIONS = [
  { id: "neutral", label: "ทั่วไป", emoji: "😐" },
  { id: "excited", label: "ตื่นเต้นสะใจ", emoji: "🤩" },
  { id: "cheerful", label: "สดใสเป็นกันเอง", emoji: "😊" },
  { id: "professional", label: "น่าเชื่อถือ", emoji: "💼" },
  { id: "softly", label: "นุ่มนวลอ่อนน้อม", emoji: "🧸" },
  { id: "whispering", label: "กระซิบกระซาบ", emoji: "🤫" },
];

export default function ScriptQueue({
  queue,
  setQueue,
  onAddToQueue,
  onGenerateQueue,
  isQueueGenerating,
  onStopQueue,
  onPlayResult,
  currentMainScript,
  currentMainVoice,
  currentMainEmotion,
}: ScriptQueueProps) {
  // Local state for manually adding custom item
  const [customText, setCustomText] = useState("");
  const [customVoice, setCustomVoice] = useState("Kore");
  const [customEmotion, setCustomEmotion] = useState("excited");
  const [isAddingManually, setIsAddingManually] = useState(false);

  // Local state for editing an item inline
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editVoice, setEditVoice] = useState("");
  const [editEmotion, setEditEmotion] = useState("");

  // Add current active script from editor to queue
  const handleAddCurrent = () => {
    if (!currentMainScript.trim()) return;
    onAddToQueue(currentMainScript, currentMainVoice, currentMainEmotion);
  };

  // Add custom script manually
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onAddToQueue(customText, customVoice, customEmotion);
    setCustomText("");
    setIsAddingManually(false);
  };

  // Move item Up in sequence
  const moveUp = (index: number) => {
    if (index === 0) return;
    setQueue((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  // Move item Down in sequence
  const moveDown = (index: number) => {
    if (index === queue.length - 1) return;
    setQueue((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  // Delete item from queue
  const deleteItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear entire queue
  const clearQueue = () => {
    setQueue([]);
  };

  // Start inline editing
  const startEdit = (item: QueueItem) => {
    setEditingItemId(item.id);
    setEditText(item.scriptText);
    setEditVoice(item.voice);
    setEditEmotion(item.emotion);
  };

  // Save inline editing
  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              scriptText: editText,
              voice: editVoice,
              emotion: editEmotion,
              status: item.status === "failed" ? "pending" : item.status, // Reset failed state if edited
            }
          : item
      )
    );
    setEditingItemId(null);
  };

  // Reset failed items back to pending
  const resetFailed = () => {
    setQueue((prev) =>
      prev.map((item) => (item.status === "failed" ? { ...item, status: "pending", error: undefined } : item))
    );
  };

  // Calculations for batch progress bar
  const completedCount = queue.filter((item) => item.status === "completed").length;
  const failedCount = queue.filter((item) => item.status === "failed").length;
  const generatingItem = queue.find((item) => item.status === "generating");
  const pendingCount = queue.filter((item) => item.status === "pending").length;
  const progressPercent = queue.length > 0 ? ((completedCount + failedCount) / queue.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Upper Control Bar / Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-4.5 w-4.5 text-amber-500" />
          <div>
            <h4 className="font-sans text-xs font-bold text-slate-800 uppercase tracking-wider">
              จัดคิวบทพูดและผลิตเสียงพากย์ชุดใหญ่ (Script Queue & Batch TTS)
            </h4>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
              เขียนบทหลายรูปแบบ สลับผู้พากย์/อารมณ์ แล้วสั่งผลิตเสียงทั้งหมดต่อกันได้ทีเดียวเพื่อประหยัดเวลา
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleAddCurrent}
            disabled={!currentMainScript.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-[10.5px] font-bold text-amber-700 hover:bg-amber-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>เพิ่มบทจากหน้าต่างแก้ไขหลัก</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddingManually(!isAddingManually)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-[10.5px] font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-950 active:scale-95 transition-all cursor-pointer"
          >
            <Edit3 className="h-3 w-3" />
            <span>{isAddingManually ? "ปิดแบบฟอร์ม" : "เขียนบทใหม่ลงคิว"}</span>
          </button>
        </div>
      </div>

      {/* Manual Input Form */}
      {isAddingManually && (
        <form onSubmit={handleAddCustom} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5 shadow-xs animate-fadeIn">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase font-sans">
              บทพูดสำหรับการพากย์ลงคิว
            </label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="พิมพ์บทรีวิวหรือข้อความสินค้าที่ต้องการพากย์..."
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-amber-500/40 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Voice select */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase font-sans">
                เลือกนักพากย์
              </label>
              <select
                value={customVoice}
                onChange={(e) => setCustomVoice(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700 focus:border-amber-500/40 focus:outline-none"
              >
                {VOICE_PROFILES.map((vp) => (
                  <option key={vp.voiceName} value={vp.voiceName}>
                    {vp.displayLabel}
                  </option>
                ))}
              </select>
            </div>

            {/* Emotion select */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase font-sans">
                อารมณ์และสไตล์เสียง
              </label>
              <select
                value={customEmotion}
                onChange={(e) => setCustomEmotion(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700 focus:border-amber-500/40 focus:outline-none"
              >
                {EMOTION_OPTIONS.map((emo) => (
                  <option key={emo.id} value={emo.id}>
                    {emo.emoji} {emo.label} ({emo.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddingManually(false)}
              className="rounded-lg px-3 py-1.5 text-[10.5px] font-sans font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-500 px-3.5 py-1.5 text-[10.5px] font-bold text-slate-950 hover:bg-amber-400 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3 stroke-[2.5]" />
              เพิ่มเข้าในคิวพากย์
            </button>
          </div>
        </form>
      )}

      {/* Progress & Batch Action Section */}
      {queue.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3.5 shadow-xs">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            {/* Counts info */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 font-sans">
                  คิวงานสะสม: {queue.length} รายการ
                </span>
                <span className="text-[10px] text-slate-500">
                  (ผลิตเสร็จ {completedCount} / ล้มเหลว {failedCount} / รอ {pendingCount})
                </span>
              </div>
              
              {generatingItem && (
                <p className="text-[10.5px] text-amber-600 font-sans flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  กำลังผลิต: "{generatingItem.scriptText.substring(0, 30)}..." ด้วยเสียง {generatingItem.voice} ({generatingItem.emotion})
                </p>
              )}
            </div>

            {/* Batch buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isQueueGenerating ? (
                <button
                  type="button"
                  onClick={onStopQueue}
                  className="rounded-lg bg-red-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-600 flex items-center gap-1.5 shadow-md shadow-red-500/10 active:scale-95 transition-all cursor-pointer"
                >
                  <Pause className="h-3.5 w-3.5" />
                  <span>หยุดผลิตชั่วคราว</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onGenerateQueue}
                  disabled={pendingCount === 0}
                  className="rounded-lg bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 px-4 py-2 text-xs font-bold text-slate-950 hover:brightness-110 flex items-center gap-1.5 shadow-md shadow-amber-500/10 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>เริ่มพากย์อัตโนมัติรวดเดียว ({pendingCount} บท)</span>
                </button>
              )}

              {failedCount > 0 && !isQueueGenerating && (
                <button
                  type="button"
                  onClick={resetFailed}
                  className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:text-slate-950 hover:bg-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reset failed scripts back to pending state"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>รีเซ็ตข้อผิดพลาด</span>
                </button>
              )}

              {!isQueueGenerating && (
                <button
                  type="button"
                  onClick={clearQueue}
                  className="rounded-lg p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="ล้างคิวทั้งหมด"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar with glowing indicator */}
          <div className="space-y-1">
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300/30">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
              <span>PROGRESS: {Math.round(progressPercent)}%</span>
              <span>BATCH ENGINE SEQUENTIAL READY</span>
            </div>
          </div>
        </div>
      )}

      {/* Queue list container */}
      {queue.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center space-y-3.5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400">
            <ListOrdered className="h-5 w-5" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h5 className="text-xs font-bold text-slate-700 font-sans">คิวรีวิวว่างเปล่า</h5>
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
              สคริปต์วิดีโอยิ่งปรับแต่งคำพูดและน้ำเสียงได้หลายแบบ ยิ่งมีสิทธิ์กระตุ้นยอดขายได้ปังกว่าเดิม! ลองใช้ปุ่ม "เพิ่มบทจากหน้าต่างแก้ไขหลัก" ด้านบนเพื่อเริ่มระบบจัดคิวของคุณ
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {queue.map((item, index) => {
            const isEditing = editingItemId === item.id;
            
            // Status CSS class resolver
            let statusBorder = "border-slate-200 bg-white shadow-xs";
            let statusText = "รอดำเนินการ";
            let statusColor = "text-amber-700 bg-amber-50 border border-amber-200";
            
            if (item.status === "generating") {
              statusBorder = "border-amber-300 bg-amber-50/20 animate-pulse";
              statusText = "กำลังพากย์เสียง...";
              statusColor = "text-amber-800 bg-amber-100";
            } else if (item.status === "completed") {
              statusBorder = "border-emerald-200 bg-emerald-50/20";
              statusText = "เสร็จเรียบร้อย";
              statusColor = "text-emerald-700 bg-emerald-50 border border-emerald-200";
            } else if (item.status === "failed") {
              statusBorder = "border-red-200 bg-red-50/20";
              statusText = "พากย์ไม่สำเร็จ";
              statusColor = "text-red-700 bg-red-50 border border-red-200";
            }

            return (
              <div 
                key={item.id} 
                className={`rounded-xl border p-3.5 space-y-2.5 transition-all relative ${statusBorder}`}
              >
                {/* Index badge counter */}
                <span className="absolute top-3.5 left-3.5 flex h-5 w-5 items-center justify-center rounded bg-slate-50 text-[10px] font-mono font-bold text-slate-500 border border-slate-200">
                  #{index + 1}
                </span>

                {/* Main details row */}
                <div className="pl-7 space-y-1.5">
                  
                  {/* Script display or editor input */}
                  {isEditing ? (
                    <div className="space-y-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full rounded bg-white border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500/40 font-sans"
                        rows={3}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase font-sans mb-1">
                            นักพากย์
                          </label>
                          <select
                            value={editVoice}
                            onChange={(e) => setEditVoice(e.target.value)}
                            className="w-full rounded bg-white border border-slate-200 p-1.5 text-xs text-slate-700 focus:outline-none"
                          >
                            {VOICE_PROFILES.map((vp) => (
                              <option key={vp.voiceName} value={vp.voiceName}>
                                {vp.voiceName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase font-sans mb-1">
                            อารมณ์
                          </label>
                          <select
                            value={editEmotion}
                            onChange={(e) => setEditEmotion(e.target.value)}
                            className="w-full rounded bg-white border border-slate-200 p-1.5 text-xs text-slate-700 focus:outline-none"
                          >
                            {EMOTION_OPTIONS.map((emo) => (
                              <option key={emo.id} value={emo.id}>
                                {emo.emoji} {emo.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-1.5 pt-1 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setEditingItemId(null)}
                          className="rounded p-1 text-slate-400 hover:text-slate-800 text-[10.5px] cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(item.id)}
                          className="rounded bg-amber-500 px-2 py-1 text-slate-950 text-[10.5px] font-bold hover:bg-amber-400 cursor-pointer flex items-center gap-0.5"
                        >
                          <Check className="h-3 w-3" />
                          บันทึก
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="font-sans text-xs text-slate-800 leading-relaxed font-medium">
                      {item.scriptText}
                    </p>
                  )}

                  {/* Status badge + parameter row */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold font-sans ${statusColor}`}>
                      {statusText}
                    </span>

                    {/* Params badge */}
                    <span className="font-mono text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      🎤 {item.voice} • {EMOTION_OPTIONS.find(e => e.id === item.emotion)?.emoji || "😐"} {item.emotion}
                    </span>

                    {/* Result link play button if completed */}
                    {item.status === "completed" && item.resultId && (
                      <button
                        type="button"
                        onClick={() => onPlayResult(item.resultId!)}
                        className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                      >
                        <Volume2 className="h-3 w-3" />
                        <span>ลองฟังเสียงพากย์</span>
                      </button>
                    )}
                  </div>

                  {/* Detailed error if failed */}
                  {item.status === "failed" && item.error && (
                    <div className="flex items-start gap-1.5 rounded-lg bg-red-50 border border-red-100 p-2 text-[10.5px] text-red-700 leading-relaxed font-sans mt-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <p>เกิดข้อผิดพลาดในการเจเนอเรต: {item.error}</p>
                    </div>
                  )}

                </div>

                {/* Global row operations block */}
                {!isEditing && (
                  <div className="flex items-center justify-end border-t border-slate-100 pt-2 pl-7 gap-1">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0 || isQueueGenerating}
                      onClick={() => moveUp(index)}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="เลื่อนคิวขึ้น"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === queue.length - 1 || isQueueGenerating}
                      onClick={() => moveDown(index)}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
                      title="เลื่อนคิวลง"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      disabled={isQueueGenerating}
                      onClick={() => startEdit(item)}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-50 hover:text-amber-600 transition-all cursor-pointer"
                      title="แก้ไขบทสคริปต์ในแถวนี้"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete item */}
                    <button
                      type="button"
                      disabled={isQueueGenerating}
                      onClick={() => deleteItem(item.id)}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                      title="ลบสคริปต์นี้ออกจากคิว"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
