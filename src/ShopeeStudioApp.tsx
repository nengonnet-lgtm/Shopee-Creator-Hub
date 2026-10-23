import React, { useState, useEffect, useRef } from "react";
import { SCRIPT_PRESETS, VOICE_PROFILES } from "./data/presets";
import { ScriptPreset, VoiceoverItem, QueueItem } from "./types";
import { convertBase64ToPcm, pcmToFloat32, encodeWAV } from "./utils/audio";
import ScriptEditor from "./components/ScriptEditor";
import VoiceSelector from "./components/VoiceSelector";
import RefinePanel from "./components/RefinePanel";
import RecentHistory from "./components/RecentHistory";
import WaveformVisualizer from "./components/WaveformVisualizer";
import UrlAnalyzer from "./components/UrlAnalyzer";
import CommunityShield from "./components/CommunityShield";
import ScriptQueue from "./components/ScriptQueue";
import { scanScriptForProhibitedWords } from "./utils/shield";

import {
  Sparkles,
  Volume2,
  Play,
  Pause,
  Square,
  Download,
  AlertCircle,
  HelpCircle,
  Clock,
  Mic,
  Info,
  ChevronRight,
  Smile,
  VolumeX,
  Sliders,
  Shield,
  FileText,
  ListOrdered,
} from "lucide-react";

export default function ShopeeStudioApp() {
  // Preset scripts state
  const [selectedPresetId, setSelectedPresetId] = useState<string>("steam-iron");
  const [scriptText, setScriptText] = useState<string>(SCRIPT_PRESETS[0].text);
  const [category, setCategory] = useState<string>(SCRIPT_PRESETS[0].category);
  const [customHighlights, setCustomHighlights] = useState<Array<{ label: string; value: string; detail: string }> | undefined>(undefined);
  const [structuredScript, setStructuredScript] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"structure" | "voiceover" | "shield" | "queue">("voiceover");
  const [targetLength, setTargetLength] = useState<number>(300);

  // --- BATCH TTS QUEUE ENGINE ---
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isQueueGenerating, setIsQueueGenerating] = useState<boolean>(false);
  const cancelQueueRef = useRef<boolean>(false);
  const queueRef = useRef<QueueItem[]>([]);

  // Synchronize queueRef with queue state to avoid stale closure issues in async batch loops
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  // Selected Voice and Emotion directives
  const [selectedVoice, setSelectedVoice] = useState<string>("Kore");
  const [selectedEmotion, setSelectedEmotion] = useState<string>("excited");

  // History list
  const [history, setHistory] = useState<VoiceoverItem[]>([]);
  const [activeItem, setActiveItem] = useState<VoiceoverItem | null>(null);

  // Loading states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- WEB AUDIO PLAYBACK STATE ENGINE ---
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [rate, setRate] = useState<number>(1.0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  // Native audio refs to avoid stale closures in play timers
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const audioBufferCache = useRef<Map<string, AudioBuffer>>(new Map());

  // Initialize AudioContext lazily on first click/user gesture
  const getAudioContext = (): AudioContext => {
    let ctx = audioCtx;
    if (!ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      ctx = new AudioCtxClass({ sampleRate: 24000 });
      setAudioCtx(ctx);
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  };

  // Build and cache an AudioBuffer from raw PCM samples
  const createAudioBuffer = (ctx: AudioContext, rawPcm: Int16Array): AudioBuffer => {
    const float32 = pcmToFloat32(rawPcm);
    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    return buffer;
  };

  // Playback control logic
  const handlePlayPause = () => {
    if (!activeItem) return;
    const ctx = getAudioContext();

    if (isPlaying) {
      // Pause
      if (activeSourceRef.current) {
        try {
          activeSourceRef.current.stop();
        } catch (e) {
          console.error("Stop error:", e);
        }
      }
      const elapsed = (ctx.currentTime - startTimeRef.current) * rate;
      pausedAtRef.current = pausedAtRef.current + elapsed;
      setIsPlaying(false);
    } else {
      // Play
      let startOffset = pausedAtRef.current;
      if (startOffset >= duration) {
        startOffset = 0;
      }

      // Check cache for cached AudioBuffer
      let audioBuffer = audioBufferCache.current.get(activeItem.id);
      if (!audioBuffer) {
        audioBuffer = createAudioBuffer(ctx, activeItem.rawPcm);
        audioBufferCache.current.set(activeItem.id, audioBuffer);
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = rate;

      const gain = ctx.createGain();
      gain.gain.value = volume;

      source.connect(gain);
      gain.connect(ctx.destination);

      activeSourceRef.current = source;
      gainNodeRef.current = gain;

      source.start(0, startOffset);
      startTimeRef.current = ctx.currentTime;
      pausedAtRef.current = startOffset;
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
      } catch (e) {}
      activeSourceRef.current = null;
    }
    pausedAtRef.current = 0;
    setCurrentTime(0);
    setProgress(0);
    setIsPlaying(false);
  };

  // Seek callback from waveform click
  const handleSeek = (ratio: number) => {
    if (!activeItem) return;
    const seekTime = ratio * duration;
    
    // Stop active audio
    const wasPlaying = isPlaying;
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
      } catch (e) {}
      activeSourceRef.current = null;
    }

    pausedAtRef.current = seekTime;
    setCurrentTime(seekTime);
    setProgress(ratio);

    if (wasPlaying) {
      setIsPlaying(false);
      // Resume playback at new offset immediately
      setTimeout(() => {
        const ctx = getAudioContext();
        let audioBuffer = audioBufferCache.current.get(activeItem.id);
        if (!audioBuffer) {
          audioBuffer = createAudioBuffer(ctx, activeItem.rawPcm);
          audioBufferCache.current.set(activeItem.id, audioBuffer);
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = rate;

        const gain = ctx.createGain();
        gain.gain.value = volume;

        source.connect(gain);
        gain.connect(ctx.destination);

        activeSourceRef.current = source;
        gainNodeRef.current = gain;

        source.start(0, seekTime);
        startTimeRef.current = ctx.currentTime;
        setIsPlaying(true);
      }, 50);
    }
  };

  // Adjust volume dynamically
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  // Adjust playback speed dynamically
  useEffect(() => {
    if (isPlaying && activeSourceRef.current && activeItem) {
      // To change rate cleanly on the fly: record current time offset, pause, then restart with new speed
      const ctx = getAudioContext();
      const elapsed = (ctx.currentTime - startTimeRef.current) * activeSourceRef.current.playbackRate.value;
      const currentOffset = pausedAtRef.current + elapsed;

      activeSourceRef.current.stop();
      pausedAtRef.current = currentOffset;

      const audioBuffer = audioBufferCache.current.get(activeItem.id);
      if (audioBuffer) {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = rate;

        const gain = ctx.createGain();
        gain.gain.value = volume;

        source.connect(gain);
        gain.connect(ctx.destination);

        activeSourceRef.current = source;
        gainNodeRef.current = gain;

        source.start(0, currentOffset);
        startTimeRef.current = ctx.currentTime;
      }
    }
  }, [rate]);

  // Handle active audio timer countdown / playhead progression
  useEffect(() => {
    let timer: any;
    if (isPlaying && audioCtx && duration > 0) {
      timer = setInterval(() => {
        const elapsed = (audioCtx.currentTime - startTimeRef.current) * rate;
        const current = pausedAtRef.current + elapsed;

        if (current >= duration) {
          setIsPlaying(false);
          setCurrentTime(duration);
          setProgress(1);
          pausedAtRef.current = 0;
          clearInterval(timer);
        } else {
          setCurrentTime(current);
          setProgress(current / duration);
        }
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isPlaying, rate, duration, audioCtx]);

  // Clear source reference when isPlaying drops natively
  useEffect(() => {
    if (!isPlaying) {
      activeSourceRef.current = null;
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeSourceRef.current) {
        try {
          activeSourceRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // --- API OPERATIONS ---

  // Refine script callback
  const handlePresetSelect = (preset: ScriptPreset) => {
    setScriptText(preset.text);
    setCategory(preset.category);
    setCustomHighlights(undefined);
  };

  const handleUrlAnalysisSuccess = (data: {
    productName: string;
    category: string;
    highlights: Array<{ label: string; value: string; detail: string }>;
    scriptText: string;
    structuredScript: string;
  }) => {
    setScriptText(data.scriptText);
    setCategory(data.category);
    setCustomHighlights(data.highlights);
    setStructuredScript(data.structuredScript || "");
    setSelectedPresetId("custom");
    setActiveTab("structure"); // Switch to structured tab upon successful generation
  };

  // Generate Voiceover API Call
  const handleGenerateTTS = async () => {
    if (!scriptText.trim()) return;

    setIsGenerating(true);
    setError(null);
    handleStop(); // Stop current playing sound

    try {
      const response = await fetch("/api/gemini/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scriptText,
          voice: selectedVoice,
          emotion: selectedEmotion,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate voiceover.");
      }

      if (data.success && data.audioData) {
        // Convert base64 sound to Raw PCM bytes
        const pcm = convertBase64ToPcm(data.audioData);
        // Duration = samplesCount / 24000
        const itemDuration = pcm.length / 24000;

        const newItem: VoiceoverItem = {
          id: `vo-${Date.now()}`,
          timestamp: new Date(),
          scriptText: scriptText,
          voice: data.voice,
          emotion: data.emotion,
          audioUrl: "", // We generate audioBuffer on demand
          rawPcm: pcm,
          duration: itemDuration,
        };

        // Update history and set active item
        setHistory((prev) => [newItem, ...prev]);
        setActiveItem(newItem);
        setDuration(itemDuration);
        setCurrentTime(0);
        setProgress(0);
        pausedAtRef.current = 0;
      }
    } catch (err: any) {
      console.error("TTS generation error:", err);
      setError(err.message || "An unexpected error occurred during TTS audio generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectItem = (item: VoiceoverItem) => {
    handleStop();
    setActiveItem(item);
    setDuration(item.duration);
    setCurrentTime(0);
    setProgress(0);
    pausedAtRef.current = 0;
  };

  const handleDeleteItem = (id: string) => {
    if (activeItem?.id === id) {
      handleStop();
      setActiveItem(null);
      setDuration(0);
      setCurrentTime(0);
      setProgress(0);
    }
    setHistory((prev) => prev.filter((item) => item.id !== id));
    audioBufferCache.current.delete(id);
  };

  const handleDownloadActive = () => {
    if (!activeItem) return;
    try {
      const blob = encodeWAV(activeItem.rawPcm);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `voiceover-${activeItem.voice}-${activeItem.emotion}-${Date.now()}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download active error:", err);
    }
  };

  // Add item to queue
  const handleAddToQueue = (text: string, voice: string, emotion: string) => {
    const newItem: QueueItem = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      scriptText: text,
      voice,
      emotion,
      status: "pending",
    };
    setQueue((prev) => [...prev, newItem]);
  };

  // Stop queue generation
  const handleStopQueue = () => {
    cancelQueueRef.current = true;
    setIsQueueGenerating(false);
  };

  // Generate Queue sequentially
  const handleGenerateQueue = async () => {
    if (isQueueGenerating) return;
    setIsQueueGenerating(true);
    cancelQueueRef.current = false;

    while (true) {
      if (cancelQueueRef.current) {
        setIsQueueGenerating(false);
        break;
      }

      const currentQueue = queueRef.current;
      const pendingIndex = currentQueue.findIndex((item) => item.status === "pending");

      if (pendingIndex === -1) {
        setIsQueueGenerating(false);
        break;
      }

      const itemToProcess = currentQueue[pendingIndex];

      // Mark status as generating
      setQueue((prev) =>
        prev.map((q) => (q.id === itemToProcess.id ? { ...q, status: "generating" } : q))
      );

      try {
        const response = await fetch("/api/gemini/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: itemToProcess.scriptText,
            voice: itemToProcess.voice,
            emotion: itemToProcess.emotion,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to generate voiceover.");
        }

        if (data.success && data.audioData) {
          const pcm = convertBase64ToPcm(data.audioData);
          const itemDuration = pcm.length / 24000;

          const voiceoverId = `vo-${Date.now()}`;
          const newItem: VoiceoverItem = {
            id: voiceoverId,
            timestamp: new Date(),
            scriptText: itemToProcess.scriptText,
            voice: data.voice,
            emotion: data.emotion,
            audioUrl: "",
            rawPcm: pcm,
            duration: itemDuration,
          };

          // Save to history and activate
          setHistory((prev) => [newItem, ...prev]);
          setActiveItem(newItem);
          setDuration(itemDuration);
          setCurrentTime(0);
          setProgress(0);
          pausedAtRef.current = 0;

          // Mark completed
          setQueue((prev) =>
            prev.map((q) =>
              q.id === itemToProcess.id
                ? { ...q, status: "completed", resultId: voiceoverId }
                : q
            )
          );
        } else {
          throw new Error("No audio data returned from the server.");
        }
      } catch (err: any) {
        console.error("Queue generation item failed:", err);
        const errMsg = err.message || "Failed to generate";
        setQueue((prev) =>
          prev.map((q) => (q.id === itemToProcess.id ? { ...q, status: "failed", error: errMsg } : q))
        );
      }

      // Small delay between sequential calls to prevent server flooding and let state updates commit
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  };

  // Play result immediately from queue reference
  const handlePlayResult = (resultId: string) => {
    const item = history.find((h) => h.id === resultId);
    if (item) {
      handleSelectItem(item);
      setTimeout(() => {
        const ctx = getAudioContext();
        handleStop();

        let audioBuffer = audioBufferCache.current.get(item.id);
        if (!audioBuffer) {
          audioBuffer = createAudioBuffer(ctx, item.rawPcm);
          audioBufferCache.current.set(item.id, audioBuffer);
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = rate;

        const gain = ctx.createGain();
        gain.gain.value = volume;

        source.connect(gain);
        gain.connect(ctx.destination);

        activeSourceRef.current = source;
        gainNodeRef.current = gain;

        source.start(0, 0);
        startTimeRef.current = ctx.currentTime;
        pausedAtRef.current = 0;
        setIsPlaying(true);
      }, 150);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-amber-500 selection:text-slate-950">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-md shadow-amber-500/15">
              <Mic className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-sans text-base font-bold text-slate-900 tracking-tight leading-none">
                Shopee Studio: AI Video Script & TTS
              </h1>
              <p className="mt-1 text-[10px] text-slate-500 font-sans tracking-wide">
                เครื่องมือแปลงบทพูดนักพากย์ด้วย AI สำหรับแม่ค้าออนไลน์และสื่อสตรีมมิ่ง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] font-mono text-slate-600 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* LEFT SIDEBAR: Script Editing & Refine Workspace (Lg: 7 cols) */}
          <section className="space-y-5 lg:col-span-7">
            {/* Step Banner */}
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <Info className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs font-sans text-amber-800">
                ยินดีต้อนรับสู่ Shopee Affiliate Script Builder คุณสามารถปรับตั้งค่าวัตถุประสงค์ โครงสร้างบทพากย์ และทำการเขียนบทขายของปังๆ พร้อมป้องกันช่องปลิวได้ฟรี!
              </p>
            </div>

            {/* Character Budget & Sliders - Grouped Cleanly */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                    <Sliders className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-sans text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      งบประมาณตัวอักษรของสคริปต์ (Character Budget Limit)
                    </h4>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                      กำหนดขีดจำกัดความยาวผลลัพธ์ของสคริปต์ เพื่อให้เนื้อหากระชับสอดคล้องตามเวลาจริงของคลิป
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {targetLength} ตัวอักษร
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-slate-400">100</span>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={targetLength}
                    onChange={(e) => setTargetLength(Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-amber-500 outline-none transition-all focus:accent-amber-400"
                  />
                  <span className="text-[10px] font-mono text-slate-400">1000</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 150, label: "สั้นด่วน (~150 ตัว)", desc: "คลิปรีบ 15 วิ" },
                    { value: 300, label: "มาตรฐาน (~300 ตัว)", desc: "สเกลทองคำ 30-45 วิ" },
                    { value: 600, label: "เต็มรูปแบบ (~600 ตัว)", desc: "เจาะลึก 1-2 นาที" },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setTargetLength(preset.value)}
                      className={`rounded-xl border p-2 text-center transition-all cursor-pointer ${
                        targetLength === preset.value
                          ? "bg-amber-50 border-amber-200 text-amber-700 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <div className="text-[11px] font-bold font-sans">{preset.label}</div>
                      <div className="text-[8px] text-slate-500 mt-0.5 font-sans">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* UPGRADED: Shopee Affiliate Script Builder Panel */}
            <UrlAnalyzer 
              onAnalysisSuccess={handleUrlAnalysisSuccess} 
              targetLength={targetLength} 
              setTargetLength={setTargetLength} 
            />

            {/* TABBED RESULTS WORKSPACE (Interactive Shield Tabs) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
              
              {/* Tab Selector Buttons */}
              <div className="flex border-b border-slate-100 pb-2.5 gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("structure")}
                  className={`px-3.5 py-2 text-xs font-bold font-sans rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    activeTab === "structure"
                      ? "bg-amber-500 text-slate-950 shadow shadow-amber-500/20"
                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>📝 โครงสร้างสคริปต์วิดีโอ</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveTab("voiceover")}
                  className={`px-3.5 py-2 text-xs font-bold font-sans rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    activeTab === "voiceover"
                      ? "bg-amber-500 text-slate-950 shadow shadow-amber-500/20"
                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>🗣️ บทพูดเสียงพากย์</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("shield")}
                  className={`px-3.5 py-2 text-xs font-bold font-sans rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer relative ${
                    activeTab === "shield"
                      ? "bg-amber-500 text-slate-950 shadow shadow-amber-500/20"
                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>🛡️ ตรวจคำต้องห้าม Shopee Affiliate</span>
                  {/* Badge displaying warning count dynamically */}
                  {scanScriptForProhibitedWords(scriptText).length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-mono font-bold text-white animate-pulse">
                      {scanScriptForProhibitedWords(scriptText).length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("queue")}
                  className={`px-3.5 py-2 text-xs font-bold font-sans rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer relative ${
                    activeTab === "queue"
                      ? "bg-amber-500 text-slate-950 shadow shadow-amber-500/20"
                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                  <span>🗂️ คิวจำลองบทพูด & พากย์ต่อเนื่อง</span>
                  {queue.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-mono font-bold text-slate-950 animate-pulse">
                      {queue.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab Panel Content Rendering */}
              <div className="space-y-4">
                {activeTab === "structure" && (
                  <div className="space-y-3.5 animate-fadeIn">
                    {structuredScript ? (
                      <div className="space-y-4">
                        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 max-h-[480px] overflow-y-auto font-sans text-xs text-slate-700 leading-relaxed space-y-4 whitespace-pre-wrap">
                          {structuredScript.split("\n").map((line, i) => {
                            // Style segments dynamically based on labels
                            if (line.includes("**Hook") || line.includes("Hook (ดึงดูด")) {
                              return (
                                <div key={i} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-1">
                                  <h5 className="text-[11px] font-bold text-amber-700 uppercase tracking-wider font-sans">🎬 Hook (คำดึงดูดใจ 3 วิแรก)</h5>
                                  <p className="text-xs text-slate-800 mt-1 leading-relaxed">{line.replace(/^(- \*\*Hook.*?\*\*:\s*|\*\*Hook.*?\*\*:\s*)/i, "")}</p>
                                </div>
                              );
                            }
                            if (line.includes("**Visual Cues") || line.includes("Visual Cues (ไอเดีย")) {
                              return (
                                <div key={i} className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 space-y-1">
                                  <h5 className="text-[11px] font-bold text-sky-700 uppercase tracking-wider font-sans">📹 Visual Cues (คำแนะนำภาพประกอบฉาก)</h5>
                                  <p className="text-xs text-slate-800 mt-1 leading-relaxed">{line.replace(/^(- \*\*Visual Cues.*?\*\*:\s*|\*\*Visual Cues.*?\*\*:\s*)/i, "")}</p>
                                </div>
                              );
                            }
                            if (line.includes("**Spoken Lines") || line.includes("Spoken Lines (บทพูด")) {
                              return (
                                <div key={i} className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1">
                                  <h5 className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider font-sans">🗣️ Spoken Lines (บทสำหรับใช้อ่านพากย์)</h5>
                                  <p className="text-xs text-slate-800 mt-1 leading-relaxed">{line.replace(/^(- \*\*Spoken Lines.*?\*\*:\s*|\*\*Spoken Lines.*?\*\*:\s*)/i, "")}</p>
                                </div>
                              );
                            }
                            if (line.includes("**Product Link") || line.includes("Product Link (จุดใส่")) {
                              return (
                                <div key={i} className="rounded-xl border border-pink-200 bg-pink-50/50 p-4 space-y-1">
                                  <h5 className="text-[11px] font-bold text-pink-700 uppercase tracking-wider font-sans">🔗 Call to Action & Product Link (จุดใส่พิกัดตะกร้า)</h5>
                                  <p className="text-xs text-slate-800 mt-1 leading-relaxed">{line.replace(/^(- \*\*Product Link.*?\*\*:\s*|\*\*Product Link.*?\*\*:\s*)/i, "")}</p>
                                </div>
                              );
                            }
                            return line.trim() ? <p key={i} className="text-slate-500 text-xs pl-1 leading-relaxed">{line}</p> : null;
                          })}
                        </div>
                        <div className="flex justify-between items-center text-[10.5px] text-slate-500">
                          <span>*ใช้ข้อมูลเพื่อประกอบการดีไซน์สตอรี่บอร์ดและคิวถ่ายทำ</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(structuredScript);
                              alert("คัดลอกรายละเอียดโครงสร้างสำเร็จ!");
                            }}
                            className="text-amber-600 hover:text-amber-700 hover:underline font-bold transition-colors cursor-pointer"
                          >
                            คัดลอกโครงสร้างทั้งหมด
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center space-y-3.5">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 border border-slate-200">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="max-w-sm mx-auto space-y-1">
                          <h5 className="text-xs font-bold text-slate-700 font-sans">ยังไม่มีข้อมูลโครงสร้างสคริปต์</h5>
                          <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                            กรอกรายละเอียดสินค้าด้านบนแล้วคลิกปุ่ม "สร้างบทสคริปต์อัจฉริยะ" เพื่อให้ AI แตกพาร์ทบทพูด ไอเดียฉากพรรณนา และจุดใส่ลิงก์พิกัดอย่างสมบูรณ์แบบ
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "voiceover" && (
                  <div className="space-y-4 animate-fadeIn">
                    <ScriptEditor
                      script={scriptText}
                      setScript={setScriptText}
                      selectedPresetId={selectedPresetId}
                      setSelectedPresetId={setSelectedPresetId}
                      onPresetSelect={handlePresetSelect}
                    />

                    {/* Tone refinement assistant panel */}
                    <RefinePanel
                      script={scriptText}
                      category={category}
                      targetLength={targetLength}
                      onRefineSuccess={(refinedText) => {
                        setScriptText(refinedText);
                        setSelectedPresetId("custom");
                      }}
                    />
                  </div>
                )}

                {activeTab === "shield" && (
                  <div className="animate-fadeIn">
                    <CommunityShield script={scriptText} />
                  </div>
                )}

                {activeTab === "queue" && (
                  <div className="animate-fadeIn">
                    <ScriptQueue
                      queue={queue}
                      setQueue={setQueue}
                      onAddToQueue={handleAddToQueue}
                      onGenerateQueue={handleGenerateQueue}
                      isQueueGenerating={isQueueGenerating}
                      onStopQueue={handleStopQueue}
                      onPlayResult={handlePlayResult}
                      currentMainScript={scriptText}
                      currentMainVoice={selectedVoice}
                      currentMainEmotion={selectedEmotion}
                    />
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* RIGHT SIDEBAR: Speech Generation, Voice Selector, Audio Playback (Lg: 5 cols) */}
          <section className="space-y-5 lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
              
              {/* Voice Actor list selector */}
              <VoiceSelector selectedVoice={selectedVoice} onSelectVoice={setSelectedVoice} />

              {/* Emotion Prompt select slider */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Smile className="h-4 w-4 text-amber-500" />
                  <h4 className="font-sans text-sm font-semibold text-slate-800 uppercase tracking-wider">
                    2. อารมณ์ในการพากย์ (Speaking Style)
                  </h4>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "neutral", label: "ทั่วไป", emoji: "😐" },
                    { id: "excited", label: "ตื่นเต้นสะใจ", emoji: "🤩" },
                    { id: "cheerful", label: "สดใสเป็นกันเอง", emoji: "😊" },
                    { id: "professional", label: "น่าเชื่อถือ", emoji: "💼" },
                    { id: "softly", label: "นุ่มนวลอ่อนน้อม", emoji: "🧸" },
                    { id: "whispering", label: "กระซิบกระซาบ", emoji: "🤫" },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedEmotion(style.id)}
                      className={`flex flex-col items-center justify-center rounded-lg border py-2 text-center transition-all cursor-pointer ${
                        selectedEmotion === style.id
                          ? "bg-amber-50 border-amber-300 text-amber-800 font-bold"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span className="text-sm">{style.emoji}</span>
                      <span className="text-[10px] font-medium font-sans mt-0.5 text-slate-700">
                        {style.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* API and missing Secret alerts */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold font-sans">เกิดข้อผิดพลาด (Generation Error)</p>
                    <p className="font-sans leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Big Button: Build TTS voiceover */}
              <button
                type="button"
                disabled={isGenerating || !scriptText.trim()}
                onClick={handleGenerateTTS}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/15 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    <span>กำลังสร้างเสียงพากย์ด้วย AI (3-5 วินาที)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4.5 w-4.5 stroke-[2.5]" />
                    <span>เริ่มสร้างเสียงพากย์ (Generate Speech)</span>
                  </>
                )}
              </button>
            </div>

            {/* CONTROL BAR: Active playhead controller */}
            {activeItem && (
              <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-sans text-xs font-bold text-amber-700 uppercase tracking-wider leading-none">
                      สตรีมเสียงเสียงพากย์ (Active Voice Player)
                    </h3>
                    <p className="text-[10px] text-slate-500 font-sans mt-1.5">
                      เสียงนักพากย์: {activeItem.voice} • อารมณ์: {activeItem.emotion}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadActive}
                    className="flex items-center gap-1 rounded bg-slate-100 border border-slate-200 px-2.5 py-1 text-[10px] text-slate-700 hover:bg-slate-200 hover:text-slate-950 transition-colors font-sans cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    Download WAV
                  </button>
                </div>

                {/* Animated Waveform bar */}
                <WaveformVisualizer
                  rawPcm={activeItem.rawPcm}
                  isPlaying={isPlaying}
                  progress={progress}
                  onSeek={handleSeek}
                  duration={duration}
                  currentTime={currentTime}
                />

                {/* Play, Stop, Speed, and Volume controls */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
                  {/* Player Button Hub */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePlayPause}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="h-4.5 w-4.5 fill-current" /> : <Play className="h-4.5 w-4.5 fill-current translate-x-[1px]" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleStop}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all cursor-pointer"
                      title="Stop"
                    >
                      <Square className="h-4 w-4 fill-current" />
                    </button>
                  </div>

                  {/* Volume Slider & Playback speed selection */}
                  <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end">
                    
                    {/* Volume row */}
                    <div className="flex items-center gap-2 min-w-[120px]">
                      {volume === 0 ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-slate-500" />}
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="h-1 w-full bg-slate-200 accent-amber-500 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Speed selection */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-mono">SPEED:</span>
                      <div className="flex rounded-md bg-slate-100 p-0.5 border border-slate-200">
                        {[0.8, 1.0, 1.25, 1.5].map((speed) => (
                          <button
                            key={speed}
                            type="button"
                            onClick={() => setRate(speed)}
                            className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-tight cursor-pointer ${
                              rate === speed
                                ? "bg-amber-500 text-slate-950"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Generated Speech items Library */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <RecentHistory
                items={history}
                activeItemId={activeItem?.id || null}
                onSelectItem={handleSelectItem}
                onDeleteItem={handleDeleteItem}
              />
            </div>
          </section>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="mt-12 border-t border-slate-100 bg-white py-8 text-center text-slate-500">
        <p className="font-sans text-xs">
          © 2026 Shopee Studio: AI Video Script & TTS. Powered by Google Gemini Neural Voice Models.
        </p>
      </footer>
    </div>
  );
}
