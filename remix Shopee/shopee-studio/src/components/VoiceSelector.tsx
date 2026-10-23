import React from "react";
import { VOICE_PROFILES } from "../data/presets";
import { VoiceProfile } from "../types";
import { User, Volume2, Sparkles, Check } from "lucide-react";

interface VoiceSelectorProps {
  selectedVoice: string;
  onSelectVoice: (voiceName: string) => void;
}

export default function VoiceSelector({ selectedVoice, onSelectVoice }: VoiceSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-sans text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-amber-500" />
          1. เลือกโทนเสียงของนักพากย์ (Voice Actor)
        </h3>
        <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
          Gemini 3.1 Neural TTS
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {VOICE_PROFILES.map((profile) => {
          const isSelected = profile.voiceName === selectedVoice;

          return (
            <button
              key={profile.voiceName}
              type="button"
              onClick={() => onSelectVoice(profile.voiceName)}
              className={`relative flex flex-col justify-between overflow-hidden rounded-xl border text-left p-3.5 transition-all duration-300 outline-none ${
                isSelected
                  ? "bg-amber-500/10 border-amber-500/80 shadow-lg shadow-amber-500/5"
                  : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700"
              }`}
            >
              {/* Selected Glow Ring */}
              {isSelected && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-amber-500 p-1 text-slate-950">
                  <Check className="h-3 w-3 stroke-[3px]" />
                </div>
              )}

              {/* Card Header Info */}
              <div className="w-full">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full p-1 ${
                      isSelected ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-white leading-none">
                      {profile.displayLabel.split(" ")[0]}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {profile.gender} • Multi-language
                    </span>
                  </div>
                </div>

                <p className="mt-2.5 text-xs text-slate-400 leading-relaxed font-sans">
                  {profile.toneDescription}
                </p>
              </div>

              {/* Tags Footer */}
              <div className="mt-3 flex flex-wrap gap-1">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded px-1.5 py-0.5 text-[9px] font-mono tracking-wider uppercase font-semibold ${
                      isSelected
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-slate-950 text-slate-500 border border-slate-800/60"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
