import React, { useState, useRef } from 'react';
import { Sparkles, AlertCircle, LayoutTemplate, Paperclip, X, Image as ImageIcon, MessageSquareQuote, Palette, Mic, Users, Share2, Target, Clock, Star, Heart, Square, RectangleHorizontal, RectangleVertical, Volume2, MessageCircle, Eraser, Gauge, Smile, ArrowRightLeft, Send, Trash2, ChevronDown, RotateCcw, Activity, FileVideo } from 'lucide-react';
import { AppMode, ShopInfo, HistoryItem, COPYWRITING_FRAMEWORKS, TONE_OPTIONS, STYLE_OPTIONS, PLATFORM_OPTIONS, CONTENT_TYPE_OPTIONS, SCRIPT_LENGTH_OPTIONS, ASPECT_RATIO_OPTIONS, VOICE_PRESETS, VOICE_STYLES, SCRIPT_TEMPLATES, CHAR_LIMIT_OPTIONS } from './types';
import { generateContentStream, generateMarketingImage, generateSpeech, generateConversation } from './services/geminiService';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import ResultCard from './components/ResultCard';
import ShopSettings from './components/ShopSettings';
import HistorySidebar from './components/HistorySidebar';
import AffiliateCreator from './components/AffiliateCreator';
import ChatWidget from './components/ChatWidget';

// Custom hook for persistent state
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") {
        return initialValue;
      }
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AppMode>(AppMode.AUTO);
  const [framework, setFramework] = useState('');
  const [tone, setTone] = useState('');
  const [style, setStyle] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [scriptLength, setScriptLength] = useState('');
  const [scriptTemplate, setScriptTemplate] = useState(''); // New state for Script Template
  const [charLimitSetting, setCharLimitSetting] = useState(''); // New state for character limit setting
  const [productFeatures, setProductFeatures] = useState('');
  const [productBenefits, setProductBenefits] = useState('');
  const [platform, setPlatform] = useState('');
  const [contentType, setContentType] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [isResultImage, setIsResultImage] = useState(false);
  const [isResultAudio, setIsResultAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0); // For forcing re-render of components
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Voice Studio: Modes
  const [voiceModeType, setVoiceModeType] = useState<'single' | 'conversation'>('single');
  const [speakerA, setSpeakerA] = useState('Kore');
  const [speakerB, setSpeakerB] = useState('Puck');
  const [voiceStyle, setVoiceStyle] = useState('normal');
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [voicePitch, setVoicePitch] = useState(0);

  // Image Upload State
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Persistent Shop Info State
  const [shopInfo, setShopInfo] = useLocalStorage<ShopInfo>('shopInfo', {
    name: '',
    shippingPolicy: '',
    paymentMethods: '',
    additionalInfo: ''
  });

  // Persistent History State
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('history', []);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Ref for auto-scrolling to result on mobile
  const resultRef = useRef<HTMLDivElement>(null);

  const addToHistory = (textInput: string, usedMode: AppMode, textOutput: string, isImage: boolean = false, isAudio: boolean = false) => {
    if (!textOutput.trim()) return;
    
    // Don't save image/audio data to history to prevent storage quota issues
    let outputToSave = textOutput;
    if (isImage) outputToSave = "(Generated Image)";
    if (isAudio) outputToSave = "(Generated Audio)";
    
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      mode: usedMode,
      input: textInput,
      output: outputToSave,
      timestamp: Date.now(),
      isImage,
      isAudio
    };
    
    setHistory(prev => [newItem, ...prev]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSwapSpeakers = () => {
    const temp = speakerA;
    setSpeakerA(speakerB);
    setSpeakerB(temp);
  };

  const handleGenerate = async () => {
    if (!input.trim() || isGenerating) return;

    setError(null);
    setIsGenerating(true);
    setResult(''); 
    setIsResultImage(false);
    setIsResultAudio(false);

    // Smooth scroll
    if (window.innerWidth < 1024) {
        setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    try {
      if (mode === AppMode.IMAGE_GEN) {
        // Image Generation Mode
        setIsResultImage(true);
        const imageUrl = await generateMarketingImage(input, aspectRatio);
        setResult(imageUrl);
        addToHistory(input, mode, imageUrl, true);
      } else if (mode === AppMode.VOICE_STUDIO) {
        // Voice TTS Mode
        setIsResultAudio(true);
        let audioUrl = '';
        if (voiceModeType === 'conversation') {
            audioUrl = await generateConversation(input, speakerA, speakerB, voiceStyle, voiceSpeed, voicePitch);
        } else {
            // Single Voice
            audioUrl = await generateSpeech(input, selectedVoice, voiceStyle, voiceSpeed, voicePitch);
        }
        setResult(audioUrl);
        addToHistory(input, mode, audioUrl, false, true);
      } else {
        // Text/Vision Modes
        let fullResponse = '';
        await generateContentStream(
            input, 
            mode, 
            shopInfo, 
            framework, 
            tone, 
            style, 
            targetAudience, 
            scriptLength, 
            scriptTemplate, // Pass template
            charLimitSetting, // Pass character limit setting
            platform, 
            contentType, 
            productFeatures,
            productBenefits,
            attachedImage, 
            (chunk) => {
                fullResponse += chunk;
                setResult((prev) => prev + chunk);
            }
        );
        addToHistory(input, mode, fullResponse, false);
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetAll = () => {
    if (window.confirm("คุณต้องการล้างข้อมูลทั้งหมดหรือไม่?\n\n- ประวัติการใช้งาน\n- ข้อมูลร้านค้า\n- ข้อความปัจจุบัน\n\nการกระทำนี้ไม่สามารถย้อนกลับได้")) {
      setInput('');
      setMode(AppMode.AUTO);
      setFramework('');
      setTone('');
      setStyle('');
      setTargetAudience('');
      setScriptLength('');
      setScriptTemplate(''); // Reset template
      setCharLimitSetting(''); // Reset character limit setting
      setProductFeatures('');
      setProductBenefits('');
      setPlatform('');
      setContentType('');
      setAspectRatio('1:1');
      setSelectedVoice('Kore');
      setVoiceStyle('normal');
      setVoiceSpeed(1);
      setVoicePitch(0);
      setVoiceModeType('single');
      setResult('');
      setAttachedImage(null);
      setError(null);
      setShopInfo({
        name: '',
        shippingPolicy: '',
        paymentMethods: '',
        additionalInfo: ''
      });
      setHistory([]);
      
      // Clear Affiliate Data
      localStorage.removeItem('affiliate_analysis');
      localStorage.removeItem('affiliate_content');
      setResetKey(prev => prev + 1); // Force remount
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleGenerateContent();
    }
  };

  const getCharLimit = (m: AppMode) => {
    switch (m) {
        case AppMode.CAPTION: return 2200; // Instagram caption limit
        case AppMode.SCRIPT: return 10000; // Script can be long
        case AppMode.REPLY: return 2000; // Reply context
        case AppMode.AUTO: return 4000; // General
        default: return null;
    }
  };

  const charLimit = getCharLimit(mode);
  const isOverLimit = charLimit ? input.length > charLimit : false;
  const isNearLimit = charLimit ? input.length > charLimit * 0.9 : false;

  // Wrapper for generate button to handle meta key and limits
  const handleGenerateContent = () => {
    if (isOverLimit || !input.trim() || isGenerating) return;
    handleGenerate();
  }

  const placeholderText = {
    [AppMode.AUTO]: "เช่น 'เขียนแคปชั่นขายเดรสสีแดง' หรือ 'ลูกค้าถามว่าส่งของวันไหน'",
    [AppMode.CAPTION]: "บอกรายละเอียดสินค้า โปรโมชั่น หรือจุดเด่นที่ต้องการขาย...",
    [AppMode.REPLY]: "วางข้อความที่ลูกค้าถามมา หรือบอกสถานการณ์ที่ต้องการตอบกลับ...",
    [AppMode.SCRIPT]: "ระบุข้อมูลสินค้า จุดเด่น โปรโมชั่น หรือสิ่งที่ต้องการนำเสนอในคลิป...",
    [AppMode.IMAGE_GEN]: "อธิบายภาพที่ต้องการ เช่น 'พื้นหลังสีพาสเทลสำหรับวางสินค้าเครื่องสำอาง'...",
    [AppMode.VOICE_STUDIO]: voiceModeType === 'conversation'
        ? "Example:\nA: Hello, how are you today?\nB: I'm doing great! How about you?\nA: I'm good too, thanks for asking." 
        : "ใส่ข้อความที่ต้องการให้ AI พากย์เสียง (ภาษาอังกฤษจะแม่นยำที่สุด)...",
    [AppMode.AFFILIATE]: ""
  };

  const showOptions = mode === AppMode.AUTO || mode === AppMode.CAPTION || mode === AppMode.REPLY || mode === AppMode.SCRIPT;
  const isImageGen = mode === AppMode.IMAGE_GEN;
  const isVoiceStudio = mode === AppMode.VOICE_STUDIO;
  const isAffiliate = mode === AppMode.AFFILIATE;

  const renderAspectIcon = (id: string) => {
    if (id === '1:1') return <Square className="w-4 h-4" />;
    if (id === '16:9' || id === '4:3') return <RectangleHorizontal className="w-4 h-4" />;
    return <RectangleVertical className="w-4 h-4" />;
  };

  // Improved Grid Layout for Fullscreen Dashboard
  // Always use sidebar layout, even for Affiliate
  const gridLayoutClass = 'grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[460px_1fr] 2xl:grid-cols-[500px_1fr]';

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900">
      <Header 
        onHistoryClick={() => setIsHistoryOpen(true)} 
        onResetClick={handleResetAll}
      />
      
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRestore={(item) => {
          if (item.mode === AppMode.AFFILIATE) {
              alert("Affiliate items are managed within the Content Creator mode.");
              setMode(AppMode.AFFILIATE);
              return;
          }
          setInput(item.input);
          setMode(item.mode);
          setResult(item.output);
          setIsResultImage(!!item.isImage);
          setIsResultAudio(!!item.isAudio);
          setIsHistoryOpen(false);
          if (window.innerWidth < 1024) {
            setTimeout(() => {
              resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        }}
        onDelete={(id) => setHistory(prev => prev.filter(h => h.id !== id))}
        onClear={() => setHistory([])}
      />

      {/* Settings Modal (Overlay for Fullscreen Access) */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                 <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <span className="p-1.5 bg-brand-100 rounded-lg text-brand-600">
                       <LayoutTemplate className="w-5 h-5" />
                    </span>
                    ตั้งค่าข้อมูลร้านค้า
                 </h3>
                 <button 
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                 >
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <p className="text-sm text-slate-500 mb-4">
                   แก้ไขข้อมูลร้านค้าได้ที่นี่ ข้อมูลจะถูกบันทึกอัตโนมัติและนำไปใช้ในการสร้างเนื้อหาครั้งต่อไป
                </p>
                <ShopSettings 
                    shopInfo={shopInfo} 
                    setShopInfo={setShopInfo} 
                    forceExpanded={true}
                    className="border-0 shadow-none ring-1 ring-slate-100"
                />
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={() => setIsSettingsModalOpen(false)}
                        className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm"
                    >
                        เสร็จสิ้น
                    </button>
                </div>
              </div>
           </div>
        </div>
      )}

      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10 relative">
        <div className={`grid ${gridLayoutClass} gap-8 items-start`}>
          
          {/* Left Column: Controls & Input - Sticky on Desktop */}
          <div className="w-full lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2 custom-scrollbar flex flex-col gap-6">
            
            {/* Shop Settings Section - Hide in Image/Voice/Affiliate Mode */}
            {!isImageGen && !isAffiliate && !isVoiceStudio && (
                <ShopSettings 
                    shopInfo={shopInfo} 
                    setShopInfo={setShopInfo} 
                    disabled={isGenerating} 
                />
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 ring-1 ring-slate-100 flex-shrink-0">
              <div className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-500" />
                        เลือกโหมดการทำงาน
                    </label>
                    <ModeSelector currentMode={mode} setMode={setMode} disabled={isGenerating} />
                    
                    {/* STANDARD MODES OPTIONS */}
                    {!isAffiliate && (
                        <>
                        {showOptions && (
                          <div className="mt-5 space-y-5 animate-in fade-in slide-in-from-top-1">
                            
                            {/* Marketing Specifics (Platform & Content Type) - CAPTION Mode Only */}
                            {mode === AppMode.CAPTION && (
                                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                            <span className="flex items-center gap-1">
                                                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                                                แพลตฟอร์ม
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={platform}
                                                onChange={(e) => setPlatform(e.target.value)}
                                                disabled={isGenerating}
                                                className="w-full pl-2 pr-6 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-800 appearance-none truncate cursor-pointer hover:bg-slate-100"
                                                title="เลือกแพลตฟอร์มที่ต้องการนำไปโพสต์"
                                            >
                                                <option value="">-- ทั่วไป --</option>
                                                {PLATFORM_OPTIONS.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                            <span className="flex items-center gap-1">
                                                <Target className="w-3.5 h-3.5 text-rose-600" />
                                                จุดประสงค์
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={contentType}
                                                onChange={(e) => setContentType(e.target.value)}
                                                disabled={isGenerating}
                                                className="w-full pl-2 pr-6 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-800 appearance-none truncate cursor-pointer hover:bg-slate-100"
                                                title="เลือกวัตถุประสงค์ของคอนเทนต์"
                                            >
                                                <option value="">-- ทั่วไป --</option>
                                                {CONTENT_TYPE_OPTIONS.map((c) => (
                                                    <option key={c.id} value={c.id}>{c.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Copywriting Framework - AUTO, CAPTION, SCRIPT */}
                            {mode !== AppMode.REPLY && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                        <LayoutTemplate className="w-3.5 h-3.5 text-blue-600" />
                                        โครงสร้างการเขียน (Framework)
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={framework}
                                            onChange={(e) => setFramework(e.target.value)}
                                            disabled={isGenerating}
                                            className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-800 appearance-none truncate cursor-pointer hover:bg-slate-100"
                                            title="เลือกโครงสร้างการเขียนที่ต้องการ"
                                        >
                                            <option value="">-- เลือกโครงสร้าง (แนะนำ) --</option>
                                            {COPYWRITING_FRAMEWORKS.map((fw) => (
                                                <option key={fw.id} value={fw.id}>{fw.name} - {fw.description}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                        <Palette className="w-3.5 h-3.5 text-purple-600" />
                                        น้ำเสียง (Tone)
                                    </label>
                                    <select
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value)}
                                        disabled={isGenerating}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
                                        title="เลือกน้ำเสียงของภาษา"
                                    >
                                        <option value="">-- ปกติ --</option>
                                        {TONE_OPTIONS.map((t) => (
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                        <MessageSquareQuote className="w-3.5 h-3.5 text-green-600" />
                                        สไตล์ (Style)
                                    </label>
                                    <select
                                        value={style}
                                        onChange={(e) => setStyle(e.target.value)}
                                        disabled={isGenerating}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
                                        title="เลือกรูปแบบการเขียน"
                                    >
                                        <option value="">-- ปกติ --</option>
                                        {STYLE_OPTIONS.map((s) => (
                                            <option key={s.id} value={s.id}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Character Limit Output Setting */}
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                    <Gauge className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                    จำกัดจำนวนอักษรผลลัพธ์
                                </label>
                                <select
                                    value={charLimitSetting}
                                    onChange={(e) => setCharLimitSetting(e.target.value)}
                                    disabled={isGenerating}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
                                    title="ตั้งค่าจำนวนตัวอักษรของผลลัพธ์ที่ต้องการให้ AI สร้าง"
                                >
                                    <option value="">-- อัตโนมัติ (ขึ้นอยู่กับรูปแบบโหมด) --</option>
                                    {CHAR_LIMIT_OPTIONS.map((c) => (
                                        <option key={c.id} value={c.id}>{c.label}</option>
                                    ))}
                                </select>
                                {charLimitSetting && (
                                    <p className="mt-1.5 text-xs text-slate-500 italic font-light pl-1 flex items-center gap-1">
                                        💡 {CHAR_LIMIT_OPTIONS.find(c => c.id === charLimitSetting)?.description}
                                    </p>
                                )}
                            </div>

                            {mode === AppMode.SCRIPT && (
                                <div className="space-y-3 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-1">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                            <FileVideo className="w-3.5 h-3.5 text-blue-600" />
                                            รูปแบบสคริปต์ (Template)
                                        </label>
                                        <select
                                            value={scriptTemplate}
                                            onChange={(e) => setScriptTemplate(e.target.value)}
                                            disabled={isGenerating}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
                                        >
                                            <option value="">-- ไม่ระบุ (ทั่วไป) --</option>
                                            {SCRIPT_TEMPLATES.map((t) => (
                                                <option key={t.id} value={t.id}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5 text-orange-600" />
                                            กลุ่มเป้าหมาย (Target Audience)
                                        </label>
                                        <input
                                            type="text"
                                            value={targetAudience}
                                            onChange={(e) => setTargetAudience(e.target.value)}
                                            placeholder="เช่น วัยรุ่นชอบแต่งตัว, แม่บ้านยุคใหม่..."
                                            disabled={isGenerating}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-shadow"
                                            title="ระบุกลุ่มลูกค้าที่ต้องการสื่อสารด้วย"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                                            ความยาวคลิป
                                        </label>
                                        <select
                                            value={scriptLength}
                                            onChange={(e) => setScriptLength(e.target.value)}
                                            disabled={isGenerating}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
                                            title="เลือกความยาวของสคริปต์"
                                        >
                                            <option value="">-- เลือกความยาว --</option>
                                            {SCRIPT_LENGTH_OPTIONS.map((l) => (
                                                <option key={l.id} value={l.id}>{l.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                                <Star className="w-3.5 h-3.5 text-yellow-500" />
                                                ฟีเจอร์เด่น
                                            </label>
                                            <input
                                                type="text"
                                                value={productFeatures}
                                                onChange={(e) => setProductFeatures(e.target.value)}
                                                placeholder="เช่น กันน้ำ, แบตอึด..."
                                                disabled={isGenerating}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                                title="จุดเด่นของสินค้า"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                                                <Heart className="w-3.5 h-3.5 text-pink-500" />
                                                ประโยชน์
                                            </label>
                                            <input
                                                type="text"
                                                value={productBenefits}
                                                onChange={(e) => setProductBenefits(e.target.value)}
                                                placeholder="เช่น ประหยัดเวลา..."
                                                disabled={isGenerating}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                                title="สิ่งที่ลูกค้าจะได้รับ"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                          </div>
                        )}

                        {/* Image Generation Options */}
                        {isImageGen && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-1">
                                <label className="block text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <LayoutTemplate className="w-3.5 h-3.5 text-purple-600" />
                                    อัตราส่วนภาพ (Aspect Ratio)
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                    {ASPECT_RATIO_OPTIONS.map((ratio) => (
                                        <button
                                            key={ratio.id}
                                            onClick={() => setAspectRatio(ratio.id)}
                                            disabled={isGenerating}
                                            title={`เลือกอัตราส่วน ${ratio.label}`}
                                            className={`
                                                flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all
                                                ${aspectRatio === ratio.id 
                                                    ? 'bg-purple-50 border-purple-500 text-purple-700 font-medium shadow-sm' 
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200 hover:bg-slate-50'}
                                            `}
                                        >
                                            {renderAspectIcon(ratio.id)}
                                            <span className="mt-1">{ratio.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Voice Studio Options */}
                        {isVoiceStudio && (
                             <div className="mt-4 animate-in fade-in slide-in-from-top-1 space-y-5 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                                {/* Mode Switcher */}
                                <div className="flex bg-white p-1 rounded-lg border border-indigo-100 shadow-sm">
                                    <button
                                        onClick={() => setVoiceModeType('single')}
                                        title="โหมดเสียงพากย์คนเดียว"
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${voiceModeType === 'single' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                    >
                                        <Volume2 className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Single</span>
                                    </button>
                                    <button
                                        onClick={() => setVoiceModeType('conversation')}
                                        title="โหมดบทสนทนาโต้ตอบ"
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${voiceModeType === 'conversation' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                    >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Conv.</span>
                                    </button>
                                </div>

                                {voiceModeType === 'conversation' ? (
                                    <div className="space-y-4 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 animate-in fade-in">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-indigo-900 mb-1.5">Speaker A (A:)</label>
                                                <select 
                                                    value={speakerA}
                                                    onChange={(e) => setSpeakerA(e.target.value)}
                                                    className="w-full text-xs p-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                                    title="เลือกเสียงผู้พูด A"
                                                >
                                                    {VOICE_PRESETS.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                                                </select>
                                            </div>
                                            <button 
                                                onClick={handleSwapSpeakers}
                                                className="mt-5 p-1.5 rounded-full hover:bg-white hover:shadow-sm text-indigo-500 transition-all"
                                                title="สลับผู้พูด"
                                            >
                                                <ArrowRightLeft className="w-4 h-4" />
                                            </button>
                                            <div className="flex-1">
                                                <label className="block text-xs font-bold text-indigo-900 mb-1.5">Speaker B (B:)</label>
                                                <select 
                                                    value={speakerB}
                                                    onChange={(e) => setSpeakerB(e.target.value)}
                                                    className="w-full text-xs p-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                                    title="เลือกเสียงผู้พูด B"
                                                >
                                                    {VOICE_PRESETS.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 animate-in fade-in">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-indigo-900">เลือกเสียงพากย์ (Voice)</label>
                                            <span className="text-[10px] text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                                                {VOICE_PRESETS.find(v => v.id === selectedVoice)?.gender}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={selectedVoice}
                                                onChange={(e) => setSelectedVoice(e.target.value)}
                                                disabled={isGenerating}
                                                className="w-full pl-3 pr-10 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none hover:border-indigo-300 transition-colors cursor-pointer appearance-none text-slate-700 font-medium"
                                                title="เลือกเสียงพากย์ที่ต้องการ"
                                            >
                                                {VOICE_PRESETS.map((v) => (
                                                    <option key={v.id} value={v.id}>{v.label} - {v.description}</option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-500">
                                                <ChevronDown className="h-4 w-4" />
                                            </div>
                                        </div>
                                        {/* Description of selected voice */}
                                        <p className="text-[10px] text-slate-500 italic px-1">
                                            {VOICE_PRESETS.find(v => v.id === selectedVoice)?.description}
                                        </p>
                                    </div>
                                )}
                                
                                {/* Advanced Controls */}
                                <div className="space-y-4 pt-3 border-t border-indigo-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voice Settings</span>
                                        <button 
                                            onClick={() => {
                                                setVoiceStyle('normal');
                                                setVoiceSpeed(1);
                                                setVoicePitch(0);
                                            }}
                                            className="text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                                            title="รีเซ็ตค่าทั้งหมด"
                                        >
                                            <RotateCcw className="w-3 h-3" /> Reset
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="flex justify-between text-[10px] font-medium text-slate-600 mb-1.5">
                                                <span>Tone / Style</span>
                                                <span className="text-indigo-600">{VOICE_STYLES.find(s => s.id === voiceStyle)?.label}</span>
                                            </label>
                                            <select 
                                                value={voiceStyle} 
                                                onChange={(e) => setVoiceStyle(e.target.value)}
                                                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                                            >
                                                {VOICE_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                            </select>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="flex justify-between text-[10px] font-medium text-slate-600 mb-1.5">
                                                    <span>Speed</span>
                                                    <span className="text-indigo-600">{voiceSpeed}x</span>
                                                </label>
                                                <input 
                                                    type="range" min="0.5" max="1.5" step="0.1" 
                                                    value={voiceSpeed} onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                                                    <span>Slow</span>
                                                    <span>Fast</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="flex justify-between text-[10px] font-medium text-slate-600 mb-1.5">
                                                    <span>Pitch</span>
                                                    <span className="text-indigo-600">{voicePitch > 0 ? `+${voicePitch}` : voicePitch}</span>
                                                </label>
                                                <input 
                                                    type="range" min="-2" max="2" step="0.5" 
                                                    value={voicePitch} onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                                                    <span>Deep</span>
                                                    <span>High</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        )}
                        </>
                    )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Input Area & Results - Now Fullscreen for all modes */}
        <div className="space-y-6 flex flex-col min-h-[calc(100vh-8rem)]">
              {isAffiliate ? (
                  // Affiliate Dashboard Mode
                  <AffiliateCreator 
                    key={resetKey} 
                    onHistoryUpdate={(i, o) => addToHistory(i, AppMode.AFFILIATE, o)}
                    onUse={(content) => {
                        setInput(content);
                        setMode(AppMode.CAPTION);
                    }}
                  />
              ) : (
                // Standard Dashboard Mode
                <>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 ring-1 ring-slate-100">
                    <div className="relative group">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholderText[mode]}
                            className={`w-full h-40 p-4 rounded-xl border outline-none resize-none transition-all duration-200 text-slate-800 placeholder:text-slate-400 leading-relaxed
                            ${isOverLimit
                                ? 'bg-red-50 border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                : isNearLimit
                                    ? 'bg-amber-50 border-amber-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500'
                                    : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 hover:border-brand-200'
                            }
                            ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            disabled={isGenerating}
                            title="พื้นที่สำหรับใส่ข้อความคำสั่ง หรือเนื้อหาที่ต้องการให้ AI ทำงาน"
                        />
                        
                        {/* Character Counter */}
                        {charLimit && (
                            <div className={`absolute bottom-3 right-3 text-xs font-medium py-1 px-2 rounded-md transition-all duration-300 pointer-events-none ${
                                isOverLimit 
                                ? 'bg-red-100 text-red-600 shadow-sm border border-red-200 opacity-100' 
                                : isNearLimit
                                    ? 'bg-amber-100 text-amber-700 shadow-sm border border-amber-200 opacity-100'
                                    : 'bg-slate-100/80 text-slate-400 opacity-0 group-hover:opacity-100'
                            }`}>
                                {input.length.toLocaleString()} / {charLimit.toLocaleString()}
                            </div>
                        )}
                    </div>
                    
                    {/* Visual Feedback for Limit */}
                    {isOverLimit && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-red-600 font-medium animate-in slide-in-from-top-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            ข้อความยาวเกินกำหนด ({input.length - charLimit} ตัวอักษร) กรุณาลดจำนวนลง
                        </div>
                    )}

                    {attachedImage && (
                        <div className="mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                            <div className="relative group/img">
                                <img src={attachedImage} alt="attached" className="h-16 w-16 object-cover rounded-lg border border-slate-200 shadow-sm" />
                                <button
                                    onClick={removeImage}
                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover/img:opacity-100 transition-opacity"
                                    title="ลบรูปภาพ"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                            <span className="text-xs text-slate-500">แนบรูปภาพแล้ว</span>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between gap-3 mt-4">
                         <div className="flex items-center gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isGenerating}
                                className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200"
                                title="แนบรูปภาพเพื่อใช้ประกอบการสร้างคอนเทนต์"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            {input && (
                                <button
                                    onClick={() => setInput('')}
                                    disabled={isGenerating}
                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    title="ล้างข้อความทั้งหมด"
                                >
                                    <Eraser className="w-5 h-5" />
                                </button>
                            )}
                         </div>

                         <button
                            onClick={handleGenerateContent}
                            disabled={isGenerating || !input.trim() || isOverLimit}
                            title={isOverLimit ? "ไม่สามารถสร้างเนื้อหาได้เนื่องจากข้อความยาวเกินกำหนด" : "กดเพื่อเริ่มสร้างเนื้อหาด้วย AI (Ctrl + Enter)"}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-brand-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed
                            ${isGenerating 
                                ? 'bg-slate-100 text-slate-400' 
                                : isOverLimit
                                    ? 'bg-red-50 text-red-400 border border-red-100'
                                    : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white'
                            }`}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    <span>กำลังคิด...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    <span>สร้างเนื้อหา</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}
                
                <div ref={resultRef} className="flex-1">
                    <ResultCard 
                        content={result} 
                        isStreaming={isGenerating} 
                        isImage={isResultImage}
                        isAudio={isResultAudio}
                        onRegenerate={handleGenerateContent}
                        onOpenSettings={() => setIsSettingsModalOpen(true)}
                        onUse={() => {
                            setInput(result);
                            if (window.innerWidth < 1024) {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                    />
                </div>
                </>
              )}
          </div>
        </div>
      </main>
      
      <ChatWidget />
      
    </div>
  );
};

export default App;