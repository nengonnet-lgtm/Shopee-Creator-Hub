import React from "react";
import { SCRIPT_PRESETS } from "../data/presets";
import { ScriptPreset } from "../types";
import { FileText, Award, RefreshCw, Layers, Sparkles } from "lucide-react";

interface ScriptEditorProps {
  script: string;
  setScript: (text: string) => void;
  selectedPresetId: string;
  setSelectedPresetId: (id: string) => void;
  onPresetSelect: (preset: ScriptPreset) => void;
}

export default function ScriptEditor({
  script,
  setScript,
  selectedPresetId,
  setSelectedPresetId,
  onPresetSelect,
}: ScriptEditorProps) {
  const charactersCount = script.length;
  // Estimate speaking duration: Thai speaking rate is approx. 3.5 characters per second
  const estimatedSeconds = Math.max(1, Math.round(charactersCount / 4.2));

  const handleSelectPreset = (preset: ScriptPreset) => {
    setSelectedPresetId(preset.id);
    onPresetSelect(preset);
  };

  return (
    <div className="space-y-3">
      {/* Block Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-sans text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <FileText className="h-4 w-4 text-amber-500" />
          เขียนบทสคริปต์รีวิวสินค้า (Script Editor)
        </h3>
        <span className="font-mono text-xs text-slate-500">
          {charactersCount} ตัวอักษร
        </span>
      </div>

      {/* Preset Category Switchers */}
      <div className="flex flex-wrap gap-1.5">
        {SCRIPT_PRESETS.map((preset) => {
          const isSelected = preset.id === selectedPresetId;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {preset.id === "steam-iron" && <Award className="h-3 w-3 shrink-0" />}
              <span>{preset.title.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Script Textarea Card */}
      <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-1 focus-within:border-amber-500/50 transition-colors">
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="พิมพ์หรือคัดลอกบทสคริปต์สําหรับพากย์เสียงที่นี่..."
          rows={6}
          className="w-full resize-none border-0 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-0 leading-relaxed font-sans"
        />

        {/* Floating duration and action footer inside textarea */}
        <div className="flex items-center justify-between border-t border-slate-900 bg-slate-950/80 px-3 py-2 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-sans">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>ประมาณเวลาพากย์:</span>
            <span className="font-mono text-amber-400 font-bold">~{estimatedSeconds} วินาที</span>
          </div>

          <button
            type="button"
            onClick={() => setScript("")}
            className="text-[10px] text-slate-500 hover:text-slate-300 font-mono"
          >
            ล้างทั้งหมด (Clear)
          </button>
        </div>
      </div>
    </div>
  );
}
