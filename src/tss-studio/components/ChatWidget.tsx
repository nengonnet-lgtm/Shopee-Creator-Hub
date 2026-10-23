
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, BookOpen, RotateCcw } from 'lucide-react';
import { chatWithAffiliateExpert } from '../services/geminiService';
import { ShopeeGuideModal } from './ShopeeGuideModal';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([
    { role: 'model', content: 'สวัสดีครับ! ผมคือผู้เชี่ยวชาญ Shopee Affiliate ถามข้อสงสัยจากคู่มือได้เลยครับ เช่น "มือใหม่เริ่มยังไง?" หรือ "เทคนิคเพิ่มยอดขาย"' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleResetChat = () => {
    setMessages([
      { role: 'model', content: 'สวัสดีครับ! ผมคือผู้เชี่ยวชาญ Shopee Affiliate ถามข้อสงสัยจากคู่มือได้เลยครับ เช่น "มือใหม่เริ่มยังไง?" หรือ "เทคนิคเพิ่มยอดขาย"' }
    ]);
    setInput('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
        const response = await chatWithAffiliateExpert(userMsg, messages);
        setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
        setMessages(prev => [...prev, { role: 'model', content: "ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่" }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div 
        className={`bg-white w-[300px] sm:w-[380px] h-[450px] sm:h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-300 origin-bottom-right mb-4 overflow-hidden pointer-events-auto ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="bg-orange-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-full">
                    <Bot className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">ผู้ช่วย Affiliate</h3>
                    <p className="text-[10px] opacity-80">ตอบคำถามจากคู่มือฉบับสมบูรณ์</p>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                <button
                  onClick={handleResetChat}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white/90 hover:text-white rounded-lg text-xs font-medium transition-colors"
                  title="รีเซ็ตการสนทนา (Reset Chat)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>รีเซ็ต</span>
                </button>
                <button 
                  onClick={() => setShowGuide(true)} 
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition-colors"
                  title="เปิดอ่านคู่มือฉบับเต็ม"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>คู่มือ</span>
                </button>
                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                            m.role === 'user' 
                            ? 'bg-orange-600 text-white rounded-br-none' 
                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                        }`}
                    >
                        {m.content}
                    </div>
                </div>
            ))}
            {messages.length === 1 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                    <button
                        onClick={() => setShowGuide(true)}
                        className="text-[11px] bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full transition-colors font-medium flex items-center gap-1"
                    >
                        <BookOpen className="w-3 h-3" /> เปิดคู่มือฉบับเต็ม
                    </button>
                    <button
                        onClick={() => {
                            setInput('มือใหม่เริ่มทำ Shopee Affiliate ยังไง? สรุป 7 ขั้นตอนให้หน่อย');
                        }}
                        className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full transition-colors"
                    >
                        🚀 7 ขั้นตอนมือใหม่
                    </button>
                    <button
                        onClick={() => {
                            setInput('แผนปฏิบัติการสายแปะลิ้งก์ 100,000 บาท/เดือน ต้องทำอะไรบ้าง?');
                        }}
                        className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full transition-colors"
                    >
                        🎯 แผน 6 หลัก/เดือน
                    </button>
                    <button
                        onClick={() => {
                            setInput('มีคำต้องห้ามอะไรบ้างที่ไม่ควรใช้ในการทำคอนเทนต์ Shopee Affiliate?');
                        }}
                        className="text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full transition-colors"
                    >
                        ⚠️ คำต้องห้ามเลี่ยงแบน
                    </button>
                </div>
            )}
            {isLoading && (
                 <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl rounded-bl-none shadow-sm">
                        <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                    </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ถามข้อสงสัย..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                className="p-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center ${
            isOpen ? 'bg-slate-200 text-slate-600 rotate-90' : 'bg-orange-600 text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Shopee Affiliate Guide Full Modal */}
      <ShopeeGuideModal 
        isOpen={showGuide} 
        onClose={() => setShowGuide(false)} 
      />
    </div>
  );
};

export default ChatWidget;
