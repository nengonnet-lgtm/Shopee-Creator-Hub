import React from "react";
import { VoiceoverItem } from "../types";
import { Play, Download, Trash2, Calendar, User, Smile, Clock, Volume2 } from "lucide-react";
import { encodeWAV } from "../utils/audio";

interface RecentHistoryProps {
  items: VoiceoverItem[];
  activeItemId: string | null;
  onSelectItem: (item: VoiceoverItem) => void;
  onDeleteItem: (id: string) => void;
}

export default function RecentHistory({
  items,
  activeItemId,
  onSelectItem,
  onDeleteItem,
}: RecentHistoryProps) {
  const handleDownload = (item: VoiceoverItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the item
    try {
      const blob = encodeWAV(item.rawPcm);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `voiceover-${item.voice}-${item.emotion || "neutral"}-${Date.now()}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading voiceover:", err);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-amber-500" />
        <h3 className="font-sans text-sm font-semibold text-slate-800 uppercase tracking-wider">
          ประวัติการสร้างเสียงพากย์ (History)
        </h3>
        <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[10px] text-slate-600">
          {items.length} รายการ
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
          <Volume2 className="mx-auto h-8 w-8 text-slate-400 mb-2.5" />
          <p className="font-sans text-xs text-slate-500">
            ยังไม่มีประวัติการพากย์เสียง กด "เริ่มสร้างเสียงพากย์" ด้านบนเพื่อสัมผัสเสียงธรรมชาติจาก AI!
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {items.map((item) => {
            const isActive = item.id === activeItemId;

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`group flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "bg-amber-50 border-amber-500/50 shadow-xs"
                    : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {/* Info block */}
                <div className="space-y-1.5 min-w-0 flex-1 mr-3">
                  <p className="font-sans text-xs text-slate-800 line-clamp-1">
                    {item.scriptText}
                  </p>
                  
                  {/* Meta badges */}
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatTime(item.timestamp)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-amber-600">
                      <User className="h-3 w-3" />
                      {item.voice}
                    </span>
                    <span className="flex items-center gap-1 capitalize">
                      <Smile className="h-3 w-3" />
                      {item.emotion || "neutral"}
                    </span>
                    <span className="font-mono text-[9px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                      {Math.round(item.duration * 10) / 10} วินาที
                    </span>
                  </div>
                </div>

                {/* Actions Block */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleDownload(item, e)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Download WAV file"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                    title="Delete voiceover"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
