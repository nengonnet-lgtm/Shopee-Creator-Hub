import React from 'react';
import { ShoppingBag, Zap, History, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onHistoryClick: () => void;
  onResetClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHistoryClick, onResetClick }) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-brand-100 to-brand-50 rounded-lg text-brand-600 shadow-sm border border-brand-100">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              AI Shop Assistant
              <span className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-full font-medium shadow-sm shadow-brand-200">Pro</span>
            </h1>
            <p className="text-xs text-slate-500">ผู้ช่วยแม่ค้าออนไลน์ 24 ชม.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onResetClick}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            title="ล้างข้อมูลทั้งหมดและเริ่มต้นใหม่ (Reset All)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">เริ่มใหม่</span>
          </button>

          <button 
            onClick={onHistoryClick}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium"
            title="ดูประวัติการใช้งานที่ผ่านมา (History)"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">ประวัติ</span>
          </button>
          
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 pl-4 border-l border-slate-200 ml-2">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100" title="ขับเคลื่อนด้วยโมเดล Gemini 3 Pro">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="font-medium text-slate-600 text-xs">Gemini 3 Pro</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;