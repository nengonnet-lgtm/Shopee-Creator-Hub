import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, X, Search, FileText, Video, Instagram, Facebook, Youtube, Copy, Check, RotateCcw, Loader2, Wand2, Sparkles, Link as LinkIcon, AlertCircle, Download, FileEdit, Target, LayoutTemplate, Palette, Gauge, Smile } from 'lucide-react';
import { analyzeAffiliateProduct, generateAffiliateContent, generateAffiliateScript } from '../services/geminiService';
import { AffiliateAnalysisData, COPYWRITING_FRAMEWORKS, TONE_OPTIONS, STYLE_OPTIONS, CONTENT_TYPE_OPTIONS, CHAR_LIMIT_OPTIONS, AFFILIATE_CONTENT_TYPE_OPTIONS } from '../types';
import { SHOPEE_BANNED_WORDS, BannedWord } from '../data/knowledgeBase';

interface AffiliateCreatorProps {
  onHistoryUpdate: (input: string, output: string) => void;
  onUse: (content: string) => void;
}

const AffiliateCreator: React.FC<AffiliateCreatorProps> = ({ onHistoryUpdate, onUse }) => {
  // Input State
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Script Configuration States
  const [purpose, setPurpose] = useState('');
  const [framework, setFramework] = useState('');
  const [tone, setTone] = useState('');
  const [style, setStyle] = useState('');
  const [charLimit, setCharLimit] = useState('');

  // Process State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AffiliateAnalysisData | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  
  // Output Modal State
  const [generatedContent, setGeneratedContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [modalTab, setModalTab] = useState<'script' | 'audit'>('script');

  // Community Standards Checker
  const checkBannedWords = (text: string) => {
    if (!text) return [];
    const found: typeof SHOPEE_BANNED_WORDS = [];
    SHOPEE_BANNED_WORDS.forEach(item => {
      if (text.includes(item.word)) {
        found.push(item);
      }
    });
    return found;
  };

  const GENERATION_STEPS = [
    "กำลังอ่านข้อมูลสินค้า...",
    "วิเคราะห์จุดขาย (Selling Points)...",
    "เลือกสูตรการเขียนจากคู่มือ...",
    "เรียบเรียงภาษาให้น่าซื้อ...",
    "ตรวจสอบความถูกต้อง..."
  ];

  // Load from LocalStorage
  useEffect(() => {
    const savedAnalysis = localStorage.getItem('affiliate_analysis');
    const savedContent = localStorage.getItem('affiliate_content');
    if (savedAnalysis) setAnalysisResult(JSON.parse(savedAnalysis));
    if (savedContent) setGeneratedContent(savedContent);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        if (file.size > 5 * 1024 * 1024) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!url && !description && attachedImages.length === 0) {
      alert("กรุณาใส่ URL, รายละเอียด หรือรูปภาพสินค้าอย่างน้อย 1 อย่าง");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) return prev;
        const remaining = 90 - prev;
        return prev + (remaining * 0.1); // Decelerating progress
      });
    }, 200);

    try {
      const result = await analyzeAffiliateProduct(url, description, attachedImages);
      setAnalysisProgress(100);
      setAnalysisResult(result);
      localStorage.setItem('affiliate_analysis', JSON.stringify(result));
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการวิเคราะห์สินค้า");
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisProgress(0);
      }, 500);
    }
  };

  const handleGenerateContent = async (type: 'SHORT_POST' | 'MINI_REVIEW' | 'VIDEO_SCRIPT' | 'TIKTOK' | 'FACEBOOK' | 'INSTAGRAM' | 'YOUTUBE') => {
    if (!analysisResult) return;
    
    setIsGeneratingContent(true);
    setShowModal(true);
    setModalTab('script');
    setGeneratedContent('');
    setGenerationStep(0);
    
    // Simulate steps progress
    const stepInterval = setInterval(() => {
        setGenerationStep(prev => {
            if (prev < GENERATION_STEPS.length - 1) return prev + 1;
            return prev;
        });
    }, 1500);

    try {
      const content = await generateAffiliateContent(analysisResult, type);
      setGeneratedContent(content);
      localStorage.setItem('affiliate_content', content);
      
      // Save to main history
      const inputSummary = `[Affiliate] ${type} for ${analysisResult.productName}`;
      onHistoryUpdate(inputSummary, content);
      
    } catch (error) {
      console.error(error);
      setGeneratedContent("Error generating content. Please try again.");
    } finally {
      clearInterval(stepInterval);
      setIsGeneratingContent(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!analysisResult) return;
    
    setIsGeneratingContent(true);
    setShowModal(true);
    setModalTab('script');
    setGeneratedContent('');
    setGenerationStep(0);
    
    // Simulate steps progress
    const stepInterval = setInterval(() => {
        setGenerationStep(prev => {
            if (prev < GENERATION_STEPS.length - 1) return prev + 1;
            return prev;
        });
    }, 1500);

    try {
      const content = await generateAffiliateScript(
        analysisResult, 
        purpose, 
        framework, 
        tone, 
        style, 
        charLimit
      );
      setGeneratedContent(content);
      localStorage.setItem('affiliate_content', content);
      
      // Save to main history
      const inputSummary = `[Shopee Affiliate Script] ${analysisResult.productName}`;
      onHistoryUpdate(inputSummary, content);
      
    } catch (error) {
      console.error(error);
      setGeneratedContent("เกิดข้อผิดพลาดในการสร้างบทพูด กรุณาลองใหม่อีกครั้ง");
    } finally {
      clearInterval(stepInterval);
      setIsGeneratingContent(false);
    }
  };

  const handleReset = () => {
    if(window.confirm("ต้องการล้างข้อมูล Affiliate ทั้งหมดใช่หรือไม่?")) {
        setUrl('');
        setDescription('');
        setAttachedImages([]);
        setPurpose('');
        setFramework('');
        setTone('');
        setStyle('');
        setCharLimit('');
        setAnalysisResult(null);
        setGeneratedContent('');
        setShowModal(false);
        localStorage.removeItem('affiliate_analysis');
        localStorage.removeItem('affiliate_content');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      
      {/* SECTION 1: INPUT DASHBOARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="p-1.5 bg-orange-100 rounded-lg text-orange-600"><Sparkles className="w-5 h-5" /></span>
                Shopee/TikTok Affiliate Creator
            </h3>
            {analysisResult && (
                <button 
                    onClick={handleReset}
                    className="text-sm text-slate-500 hover:text-red-500 flex items-center gap-1 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors font-medium border border-transparent hover:border-red-100"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                </button>
            )}
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left Col: Inputs */}
            <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" /> URL สินค้า (ถ้ามี)
                    </label>
                    <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://shopee.co.th/product/..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-shadow"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">รายละเอียดเพิ่มเติม</label>
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="ก๊อปปี้รายละเอียดสินค้า หรือจุดเด่นที่อยากเน้นมาวางที่นี่..."
                        rows={3}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    />
                </div>
            </div>

            {/* Right Col: Images & Action */}
            <div className="space-y-4">
                 <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1">
                    <Paperclip className="w-3 h-3" /> รูปภาพสินค้า (ใช้ Gemini Vision วิเคราะห์)
                 </label>
                 <div className="flex flex-wrap gap-2">
                    {attachedImages.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden group shadow-sm">
                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                            <X className="w-3 h-3" />
                        </button>
                        </div>
                    ))}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:text-orange-600 hover:border-orange-400 hover:bg-orange-50 transition-all gap-1"
                    >
                        <Paperclip className="w-5 h-5" />
                        <span className="text-[10px] font-medium">เพิ่มรูป</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" multiple accept="image/*" />
                </div>
                
                <div className="pt-2">
                    <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={`w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:shadow-none ${isAnalyzing ? 'cursor-wait' : ''}`}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>กำลังวิเคราะห์... {Math.round(analysisProgress)}%</span>
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                วิเคราะห์สินค้า (Analyze)
                            </>
                        )}
                    </button>
                    {isAnalyzing && (
                        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-orange-500 transition-all duration-300 rounded-full" style={{ width: `${analysisProgress}%` }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* SECTION 2: ANALYSIS & TOOLS */}
      {analysisResult && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
            📊 ผลการวิเคราะห์ & เครื่องมือสร้างคอนเทนต์
          </h3>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
             {/* Data Card */}
             <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 xl:col-span-1 space-y-4">
                 <div>
                    <h4 className="font-bold text-slate-800 leading-snug">{analysisResult.productName}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-md font-medium">{analysisResult.category}</span>
                        <span className="px-2.5 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs rounded-md font-medium">{analysisResult.sellerType}</span>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-xs text-slate-400 mb-0.5">ราคาขาย</p>
                        <p className="text-lg font-bold text-red-600">{analysisResult.sellingPrice}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-xs text-slate-400 mb-0.5">ค่าคอมมิชชั่น</p>
                        <p className="text-lg font-bold text-green-600">{analysisResult.affiliateCommission}</p>
                    </div>
                 </div>

                 <div className="text-xs text-slate-500 space-y-1 pt-2">
                    <p>• ยอดขาย: {analysisResult.salesCount}</p>
                    <p>• เรตติ้ง: {analysisResult.rating} ({analysisResult.reviewCount})</p>
                    <p>• โปรโมชั่น: {analysisResult.promotions || '-'}</p>
                 </div>
             </div>
             
             {/* Tool Grid & Advanced Script Builder */}
             <div className="xl:col-span-2 space-y-6">
                {/* 1. Quick Presets */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                        รูปแบบด่วน (Quick Content Templates)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                        <button onClick={() => handleGenerateContent('SHORT_POST')} className="p-3 bg-white border border-slate-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 rounded-xl flex flex-col items-center gap-1.5 transition-all shadow-sm group">
                            <div className="p-1.5 bg-slate-100 rounded-full group-hover:bg-white transition-colors"><FileText className="w-4 h-4 text-slate-600 group-hover:text-orange-500" /></div>
                            <span className="text-xs font-semibold">โพสต์ป้ายยา</span>
                        </button>
                        
                        <button onClick={() => handleGenerateContent('MINI_REVIEW')} className="p-3 bg-white border border-slate-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 rounded-xl flex flex-col items-center gap-1.5 transition-all shadow-sm group">
                            <div className="p-1.5 bg-slate-100 rounded-full group-hover:bg-white transition-colors"><FileText className="w-4 h-4 text-slate-600 group-hover:text-orange-500" /></div>
                            <span className="text-xs font-semibold">Mini Review</span>
                        </button>
                        
                        <button onClick={() => handleGenerateContent('VIDEO_SCRIPT')} className="p-3 bg-white border border-slate-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 rounded-xl flex flex-col items-center gap-1.5 transition-all shadow-sm group">
                            <div className="p-1.5 bg-slate-100 rounded-full group-hover:bg-white transition-colors"><Video className="w-4 h-4 text-slate-600 group-hover:text-orange-500" /></div>
                            <span className="text-xs font-semibold">สคริปต์คลิปสั้น</span>
                        </button>
                        
                        <button onClick={() => handleGenerateContent('TIKTOK')} className="p-3 bg-white border border-slate-200 hover:border-black hover:bg-slate-50 hover:text-black rounded-xl flex flex-col items-center gap-1.5 transition-all shadow-sm group">
                            <div className="p-1.5 bg-slate-100 rounded-full group-hover:bg-white transition-colors"><svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-600 group-hover:text-black"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg></div>
                            <span className="text-xs font-semibold">TikTok</span>
                        </button>

                        <button onClick={() => handleGenerateContent('FACEBOOK')} className="p-3 bg-white border border-slate-200 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl flex flex-col items-center gap-1.5 transition-all shadow-sm group">
                            <div className="p-1.5 bg-slate-100 rounded-full group-hover:bg-white transition-colors"><Facebook className="w-4 h-4 text-slate-600 group-hover:text-blue-600" /></div>
                            <span className="text-xs font-semibold">Facebook</span>
                        </button>

                        <button onClick={() => handleGenerateContent('INSTAGRAM')} className="p-3 bg-white border border-slate-200 hover:border-pink-600 hover:bg-pink-50 hover:text-pink-700 rounded-xl flex flex-col items-center gap-1.5 transition-all shadow-sm group">
                            <div className="p-1.5 bg-slate-100 rounded-full group-hover:bg-white transition-colors"><Instagram className="w-4 h-4 text-slate-600 group-hover:text-pink-600" /></div>
                            <span className="text-xs font-semibold">Instagram</span>
                        </button>

                        <button onClick={() => handleGenerateContent('YOUTUBE')} className="p-3 bg-white border border-slate-200 hover:border-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl flex flex-col items-center gap-1.5 transition-all shadow-sm group">
                            <div className="p-1.5 bg-slate-100 rounded-full group-hover:bg-white transition-colors"><Youtube className="w-4 h-4 text-slate-600 group-hover:text-red-600" /></div>
                            <span className="text-xs font-semibold">YouTube</span>
                        </button>
                    </div>
                </div>

                {/* 2. Custom Video Script Builder */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                            <Video className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">สร้างบทพูดสำหรับรีวิวสินค้า (สคริปต์วิดีโอสั้น)</h4>
                            <p className="text-[10px] text-slate-500">ปรับแต่งโครงสร้าง น้ำเสียง สไตล์ และความยาว ได้ตามใจชอบ</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Purpose */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5 text-indigo-500" />
                                จุดประสงค์ของบทพูด
                            </label>
                            <select
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <option value="">-- เลือกจุดประสงค์ (อัตโนมัติ) --</option>
                                {AFFILIATE_CONTENT_TYPE_OPTIONS.map((c) => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Copywriting Framework */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                <LayoutTemplate className="w-3.5 h-3.5 text-blue-500" />
                                โครงสร้างการเขียน (Framework)
                            </label>
                            <select
                                value={framework}
                                onChange={(e) => setFramework(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <option value="">-- เลือกโครงสร้างการเขียน --</option>
                                {COPYWRITING_FRAMEWORKS.map((fw) => (
                                    <option key={fw.id} value={fw.id}>{fw.name} - {fw.description}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tone */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                <Smile className="w-3.5 h-3.5 text-emerald-500" />
                                น้ำเสียง (Tone)
                            </label>
                            <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <option value="">-- เลือกน้ำเสียงของคนพูด --</option>
                                {TONE_OPTIONS.map((t) => (
                                    <option key={t.id} value={t.id}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Style */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                <Palette className="w-3.5 h-3.5 text-pink-500" />
                                สไตล์การนำเสนอ (Style)
                            </label>
                            <select
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <option value="">-- เลือกสไตล์การนำเสนอ --</option>
                                {STYLE_OPTIONS.map((s) => (
                                    <option key={s.id} value={s.id}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Character Limit */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                <Gauge className="w-3.5 h-3.5 text-amber-500" />
                                จำกัดจำนวนอักษรผลลัพธ์
                            </label>
                            <select
                                value={charLimit}
                                onChange={(e) => setCharLimit(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-none hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <option value="">-- อัตโนมัติ --</option>
                                {CHAR_LIMIT_OPTIONS.map((c) => (
                                    <option key={c.id} value={c.id}>{c.label} ({c.description})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateScript}
                        className="w-full mt-2 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Wand2 className="w-4 h-4 animate-spin-slow" />
                        สร้างบทพูดสคริปต์รีวิววิดีโอสั้น
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* MODAL OUTPUT (Fullscreen) */}
      {showModal && (
        <div className="fixed inset-0 z-[150] w-full h-full bg-white">
            <div className="w-full h-full flex flex-col animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            {isGeneratingContent ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                                    กำลังสร้างคอนเทนต์...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6 text-orange-500" />
                                    คอนเทนต์พร้อมใช้งาน
                                </>
                            )}
                        </h3>
                        {!isGeneratingContent && <p className="text-sm text-slate-500 mt-1">คัดลอกและนำไปโพสต์ได้เลย หรือกด "นำไปใช้" เพื่อแก้ไขต่อ</p>}
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-8 h-8" />
                    </button>
                </div>
                
                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-16 bg-white flex justify-center">
                    <div className="w-full max-w-6xl">
                        {isGeneratingContent ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-10 animate-in fade-in duration-500">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-20"></div>
                                    <div className="relative bg-white p-6 rounded-full shadow-lg border border-orange-100">
                                        <Wand2 className="w-12 h-12 text-orange-500 animate-pulse" />
                                    </div>
                                </div>
                                
                                <div className="w-full max-w-md space-y-6 text-center">
                                    <h4 className="text-2xl font-semibold text-slate-800 animate-pulse">
                                        {GENERATION_STEPS[generationStep]}
                                    </h4>
                                    <div className="flex justify-center gap-2 pt-2">
                                        {GENERATION_STEPS.map((_, i) => (
                                            <div 
                                                key={i} 
                                                className={`h-2 rounded-full transition-all duration-500 ${
                                                    i <= generationStep 
                                                    ? 'w-10 bg-orange-500' 
                                                    : 'w-2 bg-slate-200'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Tab Controls */}
                                <div className="flex border-b border-slate-200 gap-6">
                                    <button
                                        onClick={() => setModalTab('script')}
                                        className={`pb-3 text-sm font-bold transition-all relative ${
                                            modalTab === 'script'
                                            ? 'text-orange-600 border-b-2 border-orange-500'
                                            : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    >
                                        📝 บทคอนเทนต์ / บทพูด
                                    </button>
                                    <button
                                        onClick={() => setModalTab('audit')}
                                        className={`pb-3 text-sm font-bold transition-all flex items-center gap-2 relative ${
                                            modalTab === 'audit'
                                            ? 'text-orange-600 border-b-2 border-orange-500'
                                            : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    >
                                        🛡️ ตรวจคำต้องห้าม Shopee Affiliate
                                        {checkBannedWords(generatedContent).length > 0 ? (
                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-600 rounded-full">
                                                พบ {checkBannedWords(generatedContent).length} คำเตือน
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-600 rounded-full">
                                                ปลอดภัย 100%
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {/* Tab Content */}
                                {modalTab === 'script' ? (
                                    <div className="bg-slate-50/50 rounded-2xl p-6 md:p-8 border border-slate-100 prose prose-slate prose-lg max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                                        {generatedContent}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Audit Intro Header */}
                                        <div className={`p-5 rounded-2xl border flex items-start gap-4 ${
                                            checkBannedWords(generatedContent).length > 0 
                                            ? 'bg-amber-50/60 border-amber-200/60 text-amber-900' 
                                            : 'bg-emerald-50/60 border-emerald-200/60 text-emerald-900'
                                        }`}>
                                            <div className={`p-2 rounded-xl flex-shrink-0 ${
                                                checkBannedWords(generatedContent).length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                                <AlertCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">
                                                    {checkBannedWords(generatedContent).length > 0 
                                                    ? 'พบคำโฆษณาเกินจริงหรือคำต้องห้ามที่ควรระมัดระวัง!' 
                                                    : 'ยอดเยี่ยม! ไม่พบคำต้องห้ามหรือคำโฆษณาเกินจริง'}
                                                </h4>
                                                <p className="text-xs mt-1 leading-relaxed text-slate-600">
                                                    {checkBannedWords(generatedContent).length > 0 
                                                    ? 'สคริปต์นี้มีคำศัพท์ที่อาจขัดต่อมาตรฐานชุมชนของ Shopee Affiliate หรือ TikTok Creator (เช่น คำโฆษณาเกินจริง, การอ้างอิงสุขภาพแบบอ้างอิงตรงตัว, คำรับประกันแบบเด็ดขาด) แนะนำให้ปรับแต่งเนื้อหาเพื่อความปลอดภัยของช่องท่าน' 
                                                    : 'จากการเปรียบเทียบกับพจนานุกรมคำต้องห้ามมาตรฐานของสำนักงานคณะกรรมการคุ้มครองผู้บริโภค (สคบ.) และนโยบาย Shopee Affiliate ไม่พบคำเปรียบเทียบขั้นสุดหรือคำรับรองเกินจริงใดๆ'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Warning List */}
                                        {checkBannedWords(generatedContent).length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
                                                {checkBannedWords(generatedContent).map((item, index) => (
                                                    <div key={index} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="px-2.5 py-1 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-lg">
                                                                คำต้องห้าม: "{item.word}"
                                                            </span>
                                                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                                                {item.categoryLabel}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                            <span className="font-bold text-slate-700">เหตุผลที่ควรเลี่ยง:</span> {item.reason}
                                                        </div>
                                                        <div className="text-xs text-emerald-700 bg-emerald-50/70 border border-emerald-100/70 p-3 rounded-xl flex items-start gap-1.5">
                                                            <span className="font-bold text-emerald-800 flex-shrink-0">💡 คำแนะนำปรับเปลี่ยน:</span> 
                                                            <span>{item.suggestion}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in fade-in duration-300">
                                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-2xl animate-bounce">
                                                    ✓
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-slate-800 text-base">ปลอดภัยพร้อมเผยแพร่</h5>
                                                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">สคริปต์นี้สอดคล้องตามมาตรฐานพันธมิตรของ Shopee และไม่มีคำเสี่ยงสูงต่อการถูกปิดกั้นการเข้าถึง</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                {!isGeneratingContent && (
                    <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>AI อาจมีข้อผิดพลาด โปรดตรวจสอบก่อนโพสต์</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => {
                                    const blob = new Blob([generatedContent], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `affiliate-content-${Date.now()}.txt`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    URL.revokeObjectURL(url);
                                }}
                                className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                                title="ดาวน์โหลดเป็นไฟล์ .txt"
                            >
                                <Download className="w-5 h-5" />
                                <span className="hidden lg:inline">บันทึก</span>
                            </button>

                            <button 
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold shadow-sm transition-all transform active:scale-95 ${
                                    copied 
                                    ? 'bg-green-500 text-white shadow-green-200' 
                                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                            </button>

                            <button
                                onClick={() => {
                                    onUse(generatedContent);
                                    setShowModal(false);
                                }}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl text-base font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                            >
                                <FileEdit className="w-5 h-5" />
                                นำไปใช้ / แก้ไข
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
};

export default AffiliateCreator;