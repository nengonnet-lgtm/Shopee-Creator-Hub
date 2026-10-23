import React, { useState, useEffect } from "react";
import ShopeeStudioApp from "./ShopeeStudioApp";
import TssStudioApp from "./tss-studio/App";
import { Sparkles, ShoppingBag } from "lucide-react";

export default function App() {
  const [activeStudio, setActiveStudio] = useState<"tss" | "shopee">(() => {
    const saved = localStorage.getItem("active_studio_tab");
    return (saved as "tss" | "shopee") || "shopee";
  });

  useEffect(() => {
    localStorage.setItem("active_studio_tab", activeStudio);
  }, [activeStudio]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* Global Studio Switcher Tab Bar */}
      <div className="bg-white text-slate-900 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-widest font-sans text-orange-600 uppercase">
              SHOPEE CREATOR HUB
            </span>
          </div>

          {/* Segmented control for tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveStudio("shopee")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeStudio === "shopee"
                  ? "bg-white text-orange-600 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>🛍️ Shopee Studio (สคริปต์ & พากย์เสียง)</span>
            </button>
            <button
              onClick={() => setActiveStudio("tss")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeStudio === "tss"
                  ? "bg-white text-orange-600 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>🏠 ผู้ช่วยร้านค้าออนไลน์ (TSS Assistant)</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Render the selected studio */}
      <div className="flex-grow">
        {activeStudio === "shopee" ? (
          <ShopeeStudioApp />
        ) : (
          <TssStudioApp />
        )}
      </div>
    </div>
  );
}
