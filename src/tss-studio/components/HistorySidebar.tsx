
import React from 'react';
import { HistoryItem, AppMode } from '../types';
import { X, Trash2, RotateCcw, PenTool, MessageCircleHeart, Sparkles, Mic } from 'lucide-react';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  onRestore,
  onDelete,
  onClear,
}) => {
  const getModeIcon = (mode: AppMode) => {
    switch (mode) {
      case AppMode.CAPTION:
        return <PenTool className="w-3 h-3" />;
      case AppMode.REPLY:
        return <MessageCircleHeart className="w-3 h-3" />;
      case AppMode.SCRIPT:
        return <Mic className="w-3 h-3" />;
      default:
        return <Sparkles className="w-3 h-3" />;
    }
  };

  const getModeLabel = (mode: AppMode) => {
    switch (mode) {
      case AppMode.CAPTION: return 'Caption';
      case AppMode.REPLY: return 'Reply';
      case AppMode.SCRIPT: return 'Script';
      default: return 'Auto';
    }
  };

  const getModeColor = (mode: AppMode) => {
    switch (mode) {
      case AppMode.CAPTION: return 'bg-blue-100 text-blue-700';
      case AppMode.REPLY: return 'bg-green-100 text-green-700';
      case AppMode.SCRIPT: return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-end ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`} 
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div 
        className={`relative w-full max-w-sm bg-white shadow-2xl h-full flex flex-col transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">ประวัติการใช้งาน</h2>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button 
                type="button"
                onClick={onClear}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 hover:border-red-200 shadow-sm cursor-pointer"
                title="รีเซ็ตประวัติทั้งหมด (Reset)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ต</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 space-y-4">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-2 p-8">
              <RotateCcw className="w-10 h-10 opacity-20" />
              <p className="text-sm">ยังไม่มีประวัติการใช้งาน</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getModeColor(item.mode)}`}>
                      {getModeIcon(item.mode)}
                      {getModeLabel(item.mode)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString('th-TH', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="space-y-2 cursor-pointer" onClick={() => onRestore(item)}>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-0.5">คำสั่ง:</p>
                    <p className="text-sm text-slate-700 line-clamp-1 bg-slate-50 p-2 rounded-md border border-slate-100">
                      {item.input}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-0.5">AI ตอบ:</p>
                    <p className="text-sm text-slate-600 line-clamp-2 pl-2 border-l-2 border-brand-200">
                      {item.output}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                   <button 
                    onClick={() => onRestore(item)}
                    className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    ใช้ซ้ำ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorySidebar;
