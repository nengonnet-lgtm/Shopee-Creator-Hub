import React from 'react';
import { AppMode } from '../types';
import { Sparkles, PenTool, MessageCircleHeart, Image as ImageIcon, Mic, ShoppingBag, Volume2 } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  disabled?: boolean;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, setMode, disabled }) => {
  const modes = [
    { 
      id: AppMode.AUTO, 
      icon: Sparkles, 
      label: 'อัตโนมัติ', 
      mobileLabel: 'Auto',
      desc: 'ผู้ช่วยอัจฉริยะ',
      activeColor: 'bg-teal-500 shadow-teal-500/25', 
      iconColor: 'text-teal-600'
    },
    { 
      id: AppMode.CAPTION, 
      icon: PenTool, 
      label: 'เขียนโพสต์', 
      mobileLabel: 'Post', 
      desc: 'แคปชั่นขายของ',
      activeColor: 'bg-blue-500 shadow-blue-500/25', 
      iconColor: 'text-blue-600'
    },
    { 
      id: AppMode.REPLY, 
      icon: MessageCircleHeart, 
      label: 'ตอบแชท', 
      mobileLabel: 'Reply', 
      desc: 'ปิดการขาย',
      activeColor: 'bg-green-500 shadow-green-500/25', 
      iconColor: 'text-green-600'
    },
    { 
      id: AppMode.SCRIPT, 
      icon: Mic, 
      label: 'สคริปต์', 
      mobileLabel: 'Script', 
      desc: 'วิดีโอสั้น',
      activeColor: 'bg-rose-500 shadow-rose-500/25', 
      iconColor: 'text-rose-600'
    },
    { 
      id: AppMode.VOICE_STUDIO, 
      icon: Volume2, 
      label: 'เสียงพากย์', 
      mobileLabel: 'Voice', 
      desc: 'TTS สำเร็จรูป',
      activeColor: 'bg-indigo-500 shadow-indigo-500/25', 
      iconColor: 'text-indigo-600'
    },
    { 
      id: AppMode.AFFILIATE, 
      icon: ShoppingBag, 
      label: 'นายหน้า', 
      mobileLabel: 'Affiliate', 
      desc: 'Shopee/TikTok',
      activeColor: 'bg-orange-500 shadow-orange-500/25', 
      iconColor: 'text-orange-600'
    },
    { 
      id: AppMode.IMAGE_GEN, 
      icon: ImageIcon, 
      label: 'สร้างรูป', 
      mobileLabel: 'Image', 
      desc: 'ออกแบบภาพ',
      activeColor: 'bg-purple-500 shadow-purple-500/25', 
      iconColor: 'text-purple-600'
    },
  ];

  return (
    <div className="w-full relative z-20">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {modes.map((mode) => {
          const isSelected = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setMode(mode.id)}
              disabled={disabled}
              title={`เปลี่ยนโหมดเป็น ${mode.label}: ${mode.desc}`}
              className={`
                group relative flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all duration-300 border
                min-h-[100px] touch-manipulation outline-none
                ${isSelected 
                  ? `${mode.activeColor} border-transparent text-white scale-[1.03] z-10 shadow-lg` 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:shadow-md hover:-translate-y-1'
                }
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
              `}
            >
              <div className={`
                p-2 rounded-full transition-colors duration-300
                ${isSelected ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-slate-100'}
              `}>
                <mode.icon className={`w-5 h-5 ${isSelected ? 'text-white' : mode.iconColor}`} />
              </div>
              
              <div className="flex flex-col items-center text-center leading-none">
                <span className={`text-sm font-semibold mb-1 ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                   <span className="hidden sm:inline">{mode.label}</span>
                   <span className="sm:hidden">{mode.mobileLabel}</span>
                </span>
                <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                  {mode.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ModeSelector;