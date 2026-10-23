import React, { useMemo } from "react";
import { generateWaveformPoints } from "../utils/audio";

interface WaveformVisualizerProps {
  rawPcm: Int16Array | null;
  isPlaying: boolean;
  progress: number; // 0 to 1
  onSeek?: (ratio: number) => void;
  duration?: number;
  currentTime?: number;
}

export default function WaveformVisualizer({
  rawPcm,
  isPlaying,
  progress,
  onSeek,
  duration = 0,
  currentTime = 0
}: WaveformVisualizerProps) {
  // Compute waveform bars
  const bars = useMemo(() => {
    return generateWaveformPoints(rawPcm || new Int16Array(0), 60);
  }, [rawPcm]);

  // Handle click on progress track to seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || !rawPcm) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio);
  };

  // Helper to format time (e.g. "0:04")
  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
      {/* Time indicators */}
      <div className="mb-2 flex items-center justify-between font-mono text-xs text-slate-400">
        <span className="text-amber-400 font-bold">{formatTime(currentTime)}</span>
        <span className="text-slate-500">/{formatTime(duration)}</span>
      </div>

      {/* Waveform clickable stage */}
      <div
        onClick={handleSeek}
        className={`relative flex h-16 w-full items-end justify-between gap-[2px] px-1 cursor-pointer select-none rounded-lg bg-slate-950/30 transition-all duration-300 ${
          rawPcm ? "hover:bg-slate-900/30" : "opacity-40 cursor-not-allowed"
        }`}
      >
        {bars.map((height, index) => {
          const barRatio = index / bars.length;
          const isActive = barRatio <= progress;
          
          // Generate a wave motion if playing
          let waveEffect = 0;
          if (isPlaying && isActive) {
            // Give closer active bars a subtle dancing animation
            waveEffect = Math.sin(Date.now() / 150 + index) * 4;
          }

          const finalHeight = Math.max(3, height + waveEffect);

          return (
            <div
              key={index}
              className="relative flex-1 rounded-t-full transition-all duration-150"
              style={{
                height: `${finalHeight}%`,
                maxHeight: "100%",
                minHeight: "4px",
                backgroundColor: isActive
                  ? `rgb(245, 158, 11)` // Amber-500
                  : `rgb(30, 41, 59)`,  // Slate-800
                boxShadow: isPlaying && isActive && index === Math.floor(progress * bars.length)
                  ? "0 0 12px rgba(245, 158, 11, 0.7)"
                  : "none"
              }}
            />
          );
        })}

        {/* Vertical Seek Line */}
        {rawPcm && progress > 0 && progress < 1 && (
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-amber-400 pointer-events-none transition-all duration-75"
            style={{ left: `${progress * 100}%` }}
          />
        )}
      </div>

      {/* Floating guidelines */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase tracking-wider">
        <span>24,000 Hz Studio</span>
        <span>{rawPcm ? `${rawPcm.length.toLocaleString()} Samples` : "No Audio Generated"}</span>
      </div>
    </div>
  );
}
