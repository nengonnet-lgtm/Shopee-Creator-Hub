import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, RefreshCw, Download, Music, Columns, AlignJustify, Maximize2, Minimize2, Store, FileEdit } from 'lucide-react';

interface ResultCardProps {
  content: string;
  isStreaming: boolean;
  isImage?: boolean;
  isAudio?: boolean;
  onRegenerate?: () => void;
  onOpenSettings?: () => void;
  onUse?: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ content, isStreaming, isImage, isAudio, onRegenerate, onOpenSettings, onUse }) => {
  const [copied, setCopied] = useState(false);
  const [layout, setLayout] = useState<'single' | 'split'>('single');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    if (!content) return;
    const link = document.createElement('a');
    
    if (isImage) {
        link.href = content;
        link.download = `generated-image-${Date.now()}.png`;
    } else if (isAudio) {
        link.href = content;
        link.download = `generated-voice-${Date.now()}.wav`;
    } else {
        const blob = new Blob([content], { type: 'text/markdown' });
        link.href = URL.createObjectURL(blob);
        link.download = `generated-content-${Date.now()}.md`;
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!content && !isStreaming) return null;

  return (
    <div className={`
      bg-white flex flex-col transition-all duration-300 ease-in-out
      ${isFullscreen 
        ? 'fixed inset-0 z-[100] w-full h-full rounded-none border-0' 
        : 'h-full min-h-[600px] rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 overflow-hidden'
      }
    `}>
      
      {/* Header */}
      <div className={`
        border-b border-slate-100 bg-slate-50/95 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10 flex-shrink-0 transition-all
        ${isFullscreen ? 'px-8 py-5 shadow-sm' : 'px-5 py-4'}
      `}>
        <div className="flex items-center gap-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2.5">
            {isStreaming ? (
                <>
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                </span>
                <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent font-bold">
                    {isImage ? 'กำลังสร้างรูปภาพ...' : isAudio ? 'กำลังสร้างเสียงพากย์...' : 'กำลังคิดคำตอบ...'}
                </span>
                </>
            ) : (
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                    <span className={isFullscreen ? 'text-lg' : ''}>ผลลัพธ์จาก AI</span>
                </span>
            )}
            </h3>

            {/* Layout Toggles (Only for Text, hide in fullscreen as user requested single column) */}
            {!isImage && !isAudio && content && !isFullscreen && (
                <div className="hidden sm:flex bg-slate-200/50 rounded-lg p-0.5 border border-slate-200">
                    <button
                        onClick={() => setLayout('single')}
                        className={`p-1.5 rounded-md transition-all ${layout === 'single' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="มุมมองปกติ (Single Column)"
                    >
                        <AlignJustify className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setLayout('split')}
                        className={`p-1.5 rounded-md transition-all ${layout === 'split' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        title="มุมมองแบบแยกคอลัมน์ (Two Columns) - เหมาะสำหรับอ่านบทความยาว"
                    >
                        <Columns className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>

        <div className="flex items-center gap-2">
           {!isStreaming && content && (
            <>
              {/* Fullscreen Shop Settings Trigger */}
              {isFullscreen && !isImage && !isAudio && onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors mr-2"
                    title="ตั้งค่าข้อมูลร้านค้า"
                  >
                    <Store className="w-4 h-4" />
                    <span className="hidden sm:inline">ข้อมูลร้านค้า</span>
                  </button>
              )}

              {onRegenerate && (
                <button
                    onClick={onRegenerate}
                    className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    title="ลองสร้างใหม่อีกครั้ง (Re-generate)"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
              )}
              
              <div className="h-4 w-px bg-slate-200 mx-1"></div>

              {isImage || isAudio ? (
                <button
                  onClick={handleDownload}
                  title={isImage ? "ดาวน์โหลดรูปภาพ" : "ดาวน์โหลดไฟล์เสียง"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:border-brand-200 hover:text-brand-600 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isImage ? 'บันทึกรูป' : 'บันทึกเสียง'}
                </button>
              ) : (
                <>
                    <button
                        onClick={handleDownload}
                        title="ดาวน์โหลดเป็นไฟล์ Markdown"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:border-brand-200 hover:text-brand-600 transition-all shadow-sm"
                    >
                        <Download className="w-3.5 h-3.5" />
                        บันทึก
                    </button>
                    {onUse && (
                        <button
                            onClick={onUse}
                            title="นำไปใช้ / แก้ไข (ส่งข้อความไปยังช่องกรอกข้อมูล)"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:border-brand-200 hover:text-brand-600 transition-all shadow-sm"
                        >
                            <FileEdit className="w-3.5 h-3.5" />
                            นำไปใช้
                        </button>
                    )}
                    <button
                    onClick={handleCopy}
                    title="คัดลอกข้อความทั้งหมด"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm ${
                        copied
                        ? 'bg-green-100 text-green-700 border border-transparent'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-200 hover:text-brand-600'
                    }`}
                    >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                    </button>
                </>
              )}
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`ml-1 p-2 rounded-lg transition-all ${
                    isFullscreen 
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title={isFullscreen ? "ย่อหน้าจอ (ESC)" : "ขยายเต็มหน้าจอ"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={`
        bg-white flex-1 text-slate-800 leading-relaxed overflow-y-auto custom-scrollbar
        ${isFullscreen ? 'p-8 md:p-12' : 'p-6 md:p-10'}
      `}>
        {isImage ? (
           content ? (
             <div className="flex justify-center bg-slate-50 rounded-xl border border-slate-100 p-2 h-full items-center">
                <img src={content} alt="Generated from AI" className="rounded-lg shadow-sm max-h-[85vh] w-auto object-contain" />
             </div>
           ) : null
        ) : isAudio ? (
            content ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-6 h-full">
                    <div className="bg-indigo-50 p-8 rounded-full border border-indigo-100 shadow-sm animate-in zoom-in duration-300">
                        <Music className="w-16 h-16 text-indigo-500" />
                    </div>
                    <div className="w-full max-w-md bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <audio controls src={content} className="w-full" />
                    </div>
                    <p className="text-sm text-slate-500">คลิกที่ ... เพื่อดาวน์โหลด หรือปรับความเร็วการเล่น</p>
                </div>
            ) : null
        ) : (
            <div className={`prose prose-slate prose-sm md:prose-base leading-8 text-slate-700 transition-all duration-300
                ${isFullscreen 
                    // Optimized for document reading: max-w-3xl is widely considered ideal for reading (~65 chars/line)
                    ? 'max-w-3xl mx-auto py-6' 
                    : layout === 'split' 
                        ? 'max-w-none columns-1 xl:columns-2 gap-16 [column-fill:balance]' 
                        : 'max-w-4xl mx-auto'
                }
            `}>
                <style>{`
                    .prose h1, .prose h2, .prose h3 { break-after: avoid; }
                    .prose p, .prose li, .prose blockquote { break-inside: avoid; }
                    .prose pre { break-inside: avoid; }
                    .prose strong { color: #0f172a; font-weight: 600; }
                `}</style>
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        )}
      </div>

      {!isStreaming && content && !isImage && !isAudio && (
        <div className={`
            bg-slate-50 border-t border-slate-100 flex justify-between items-center flex-shrink-0
            ${isFullscreen ? 'px-8 py-4' : 'px-6 py-3'}
        `}>
           <div className="flex gap-2">
             <div className="w-2 h-2 rounded-full bg-slate-300"></div>
             <div className="w-2 h-2 rounded-full bg-slate-300"></div>
             <div className="w-2 h-2 rounded-full bg-slate-300"></div>
           </div>
           <p className="text-xs text-slate-400 italic">AI อาจมีข้อผิดพลาด โปรดตรวจสอบความถูกต้องก่อนนำไปใช้</p>
        </div>
      )}
    </div>
  );
};

export default ResultCard;