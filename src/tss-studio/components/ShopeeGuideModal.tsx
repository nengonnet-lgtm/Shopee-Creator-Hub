import React, { useState, useMemo } from 'react';
import { 
  X, 
  BookOpen, 
  Search, 
  Copy, 
  Check, 
  Rocket, 
  Target, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Layers, 
  FileText,
  DollarSign,
  ShieldAlert,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { SHOPEE_AFFILIATE_GUIDE, SHOPEE_BANNED_WORDS } from '../data/knowledgeBase';

interface ShopeeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShopeeGuideModal: React.FC<ShopeeGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'part1' | 'part2' | 'banned' | 'raw'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyGuide = async () => {
    try {
      await navigator.clipboard.writeText(SHOPEE_AFFILIATE_GUIDE.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy guide:", err);
    }
  };

  const filteredBannedWords = useMemo(() => {
    if (!searchTerm.trim()) return SHOPEE_BANNED_WORDS;
    const term = searchTerm.toLowerCase();
    return SHOPEE_BANNED_WORDS.filter(
      item => 
        item.word.toLowerCase().includes(term) ||
        item.reason.toLowerCase().includes(term) ||
        item.suggestion.toLowerCase().includes(term) ||
        item.categoryLabel.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-5xl h-[90vh] max-h-[860px] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-slate-100 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  คู่มือ Shopee Affiliate ฉบับสมบูรณ์
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/30">
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  เป้าหมาย 6 หลัก/เดือน
                </span>
              </div>
              <p className="text-xs text-orange-100 mt-0.5">
                ขั้นตอนปฏิบัติจริงสำหรับมือใหม่, แผนสเกลยอดขาย, ระบบ UTM, และกฎคำต้องห้าม
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/20 text-white transition-all shadow-sm"
              title="คัดลอกข้อความคู่มือทั้งหมด"
            >
              {copied ? <Check className="w-4 h-4 text-amber-200" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'คัดลอกสำเร็จ' : 'คัดลอกคู่มือ'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 active:bg-white/30 transition-colors"
              title="ปิดหน้าต่าง (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Navigation Tabs + Search */}
        <div className="px-5 py-3 sm:px-8 border-b border-slate-200/80 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/30'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              ทั้งหมด
            </button>
            <button
              onClick={() => setActiveTab('part1')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'part1'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/30'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <Rocket className="w-3.5 h-3.5 text-amber-400" />
              PART 1: 7 ขั้นตอนมือใหม่
            </button>
            <button
              onClick={() => setActiveTab('part2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'part2'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/30'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-blue-400" />
              PART 2: แผนปฏิบัติการ 6 หลัก
            </button>
            <button
              onClick={() => setActiveTab('banned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'banned'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/30'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              คำต้องห้าม ({SHOPEE_BANNED_WORDS.length})
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'raw'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-500/30'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              ข้อความเต็ม (Raw)
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Search bar */}
            <div className="relative min-w-[180px] sm:min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาในคู่มือ เช่น UTM, AIDA..."
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-slate-400"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {(searchTerm || activeTab !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveTab('all');
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl text-xs font-medium transition-all shadow-sm flex-shrink-0"
                title="รีเซ็ตการค้นหาและแท็บ (Reset View)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ต</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 bg-slate-50/50">
          
          {/* TAB: RAW TEXT */}
          {activeTab === 'raw' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">ต้นฉบับข้อความคู่มือ (Text Format)</span>
                <button
                  onClick={handleCopyGuide}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> คัดลอกทั้งหมด
                </button>
              </div>
              <pre className="text-xs sm:text-sm font-mono text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/70 overflow-x-auto">
                {SHOPEE_AFFILIATE_GUIDE.trim()}
              </pre>
            </div>
          )}

          {/* TAB: BANNED WORDS */}
          {activeTab === 'banned' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-amber-900 space-y-1">
                  <p className="font-semibold">คู่มือนโยบายความปลอดภัยและคำต้องห้าม (Shopee & Community Guidelines)</p>
                  <p className="text-amber-800 leading-relaxed">
                    การใช้คำโฆษณาเกินจริง คำรับประกัน 100% หรือคำเคลมทางการแพทย์ อาจทำให้โพสต์โดนลดการมองเห็น (Shadowban), โดนปิดกั้นคลิป หรือถูกระงับสิทธิ์ค่าคอมมิชชั่นได้ แนะนำให้ใช้ "คำแนะนำทดแทน" แทนคำเหล่านี้
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBannedWords.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                        <X className="w-3.5 h-3.5" />
                        "{item.word}"
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.categoryLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-700">เหตุผลที่ห้าม:</span> {item.reason}
                    </p>
                    <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-emerald-900">แนะนำใช้แทน:</span> {item.suggestion}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ALL / PART 1 / PART 2 */}
          {(activeTab === 'all' || activeTab === 'part1') && (
            <div className="space-y-6">
              {/* Part 1 Header Banner */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">PART 1: 🚀 7 ขั้นตอนสำหรับมือใหม่</h3>
                    <p className="text-xs text-orange-100 mt-0.5">
                      โฟกัสการเริ่มต้นจาก 0, สูตรเลือกสินค้าขายดี, และการเริ่มทำคอนเทนต์รีวิว
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full border border-white/30 hidden sm:inline-block">
                  มือใหม่เริ่มต้นที่นี่
                </span>
              </div>

              {/* 7 Steps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* STEP 1 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">1</span>
                    <h4 className="font-bold text-sm text-slate-800">STEP 1: รู้ก่อนว่าตลาดตอนนี้นิยมอะไร</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ส่องจาก <strong>Shopee Top Products / Flash Sale / Shopee Live</strong> หรือค้น “สินค้าขายดี Shopee”
                  </p>
                  <div className="bg-orange-50/70 border border-orange-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-orange-900 mb-1.5">5 หมวดทำ Affiliate ปังที่สุด:</p>
                    <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                      <li>สินค้าไลฟ์สไตล์ / ของใช้ในบ้าน</li>
                      <li>สุขภาพ / ความงาม</li>
                      <li>Gadget / ของใช้ไอที</li>
                      <li>เสื้อผ้า / แฟชั่น</li>
                      <li>สินค้าสัตว์เลี้ยง</li>
                    </ul>
                  </div>
                </div>

                {/* STEP 2 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">2</span>
                    <h4 className="font-bold text-sm text-slate-800">STEP 2: ใช้ Shopee Insight คัดสินค้า</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    เข้าสู่ Shopee Affiliate Dashboard ไปที่แท็บ “สินค้าขายดี/มาแรง” และดูเกณฑ์ 3 ข้อ:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      <div className="font-bold text-orange-600">500+</div>
                      <div className="text-[11px] text-slate-500">ยอดขาย/เดือน</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      <div className="font-bold text-orange-600">4.8+</div>
                      <div className="text-[11px] text-slate-500">คะแนนร้านค้า</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      <div className="font-bold text-orange-600">1,000+</div>
                      <div className="text-[11px] text-slate-500">รีวิวผู้ซื้อ</div>
                    </div>
                  </div>
                  <div className="bg-amber-50 text-amber-900 p-2.5 rounded-xl text-xs border border-amber-200/60 font-medium">
                    💡 <strong>สูตรมือใหม่:</strong> รีวิวเยอะ + ราคากลางๆ (100–300 บาท) + คนซื้อซ้ำได้ง่าย
                  </div>
                </div>

                {/* STEP 3 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">3</span>
                    <h4 className="font-bold text-sm text-slate-800">STEP 3: ตรวจสอบกระแสบนโซเชียล</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    เข้า TikTok / Reels / YouTube ค้น “ของใน Shopee”, “ของมันต้องมี Shopee”
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    <li>หาคลิปที่คนดู 1 หมื่นวิวขึ้นไป</li>
                    <li>ดูว่าสินค้าแบบไหนถูกแชร์ซ้ำบ่อย</li>
                    <li>สังเกต Hook เช่น "ของมันต้องมี", "แกะกล่อง Shopee", "ถูกแต่ดี"</li>
                  </ul>
                </div>

                {/* STEP 4 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">4</span>
                    <h4 className="font-bold text-sm text-slate-800">STEP 4: ตรวจสอบราคา + ค่าคอมมิชชั่น</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ค้นชื่อสินค้าในระบบ Shopee Affiliate แล้วเช็ก % ค่าคอม (Commission Rate):
                  </p>
                  <div className="bg-emerald-50 text-emerald-900 p-3 rounded-xl text-xs border border-emerald-200/70 space-y-1">
                    <p>• ค่าคอม <strong>มากกว่า 5%</strong> ถือว่าดี</p>
                    <p>• สินค้าราคา 200–500 บาท ได้ค่าคอมชิ้นละ 10–30 บาท</p>
                    <p>• ถ้าขายได้วันละ 10–20 ชิ้น จะเริ่มมีรายได้วันละ <strong>หลักร้อยถึงพันบาท</strong></p>
                  </div>
                </div>

                {/* STEP 5 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">5</span>
                    <h4 className="font-bold text-sm text-slate-800">STEP 5: ทำลิสต์ "สินค้าทำเงิน"</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    สร้างตารางใน Google Sheet หรือ Notion จดข้อมูลสินค้า:
                  </p>
                  <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1 text-slate-700 font-mono">
                    <div>หมวด | ชื่อสินค้า | ราคา | คอม (%) | ยอดขาย | ลิงก์</div>
                    <div className="text-orange-600">• คัดไว้ 5–10 ชิ้นแรกที่ตรงกับกลุ่มเป้าหมายของเรา</div>
                  </div>
                </div>

                {/* STEP 6 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">6</span>
                    <h4 className="font-bold text-sm text-slate-800">STEP 6: เริ่มทำคอนเทนต์รีวิว</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    มือใหม่ <strong>ไม่ต้องมีหน้ากล้องก็ได้</strong>: ใช้ภาพจาก Shopee + เสียงพากย์ AI จากระบบนี้ หรือ Text รีวิวสั้น
                  </p>
                  <div className="bg-orange-50/70 p-3 rounded-xl border border-orange-100 text-xs text-orange-950 space-y-1">
                    <p className="font-semibold">แนวคอนเทนต์ที่ยอดวิวโตไว:</p>
                    <p>• รีวิวของใช้ “ถูกแต่โคตรดี”</p>
                    <p>• เปรียบเทียบ “ของใน Shopee vs ของแบรนด์”</p>
                    <p>• คลิป Before-After / แกะกล่องทดลองใช้ 10–15 วินาที</p>
                  </div>
                </div>

                {/* STEP 7 */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">7</span>
                    <h4 className="font-bold text-sm text-slate-800">STEP 7: 💰 สร้างระบบรายได้ประจำ (Daily Routine)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      <div className="font-bold text-slate-800 mb-1">โพสต์สม่ำเสมอ</div>
                      <div className="text-slate-600">ลงคลิป/โพสต์ วันละ 1–2 คอนเทนต์ทุกวัน</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      <div className="font-bold text-slate-800 mb-1">กระจายหลายช่องทาง</div>
                      <div className="text-slate-600">แชร์ลิงก์ไป Facebook, TikTok, IG, Line</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      <div className="font-bold text-slate-800 mb-1">มอนิเตอร์รายสัปดาห์</div>
                      <div className="text-slate-600">ดูว่าตัวไหนขายดี แล้วทำคอนเทนต์เพิ่ม</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      <div className="font-bold text-slate-800 mb-1">หมุนสินค้าใหม่</div>
                      <div className="text-slate-600">เพิ่มสินค้าใหม่เข้าระบบ 3–5 ชิ้นทุกเดือน</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 p-3.5 rounded-xl text-xs text-orange-900 flex items-center justify-between">
                    <div>
                      <strong>📍 ทริคจำง่าย:</strong> “หาของดีจาก Shopee → ดูกระแสใน TikTok → ทำคลิปรีวิวสั้น → แปะลิงก์ Aff → ปรับตามยอด”
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: ALL / PART 2 */}
          {(activeTab === 'all' || activeTab === 'part2') && (
            <div className="space-y-6 pt-4 border-t border-slate-200">
              {/* Part 2 Header Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">PART 2: 🎯 แผนปฏิบัติการขั้นสูง (สายแปะลิ้งก์ 6 หลัก)</h3>
                    <p className="text-xs text-blue-100 mt-0.5">
                      สูตรคำนวณตัวเลขเป้าหมาย 100,000 บาท/เดือน, ระบบ UTM Tracking, ตาราง Day 0–7, และเทมเพลต AIDA
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full border border-white/30 hidden sm:inline-block">
                  Scale Up Strategy
                </span>
              </div>

              {/* Math Target Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    สูตรคำนวณตัวเลขเป้าหมาย 100,000 บาท/เดือน
                  </h4>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                    คณิตศาสตร์ Affiliate
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                    <span className="text-slate-500">ตะกร้าเฉลี่ย (AOV)</span>
                    <p className="text-base font-bold text-slate-800 mt-0.5">400 บาท</p>
                    <p className="text-[11px] text-slate-500 mt-1">Average Order Value</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                    <span className="text-slate-500">ค่าคอมฯ เฉลี่ย (8%)</span>
                    <p className="text-base font-bold text-orange-600 mt-0.5">32 บาท / ออเดอร์</p>
                    <p className="text-[11px] text-slate-500 mt-1">400 × 0.08 = 32 บาท</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                    <span className="text-slate-500">จำนวนออเดอร์เป้าหมาย</span>
                    <p className="text-base font-bold text-emerald-600 mt-0.5">~105 ออเดอร์ / วัน</p>
                    <p className="text-[11px] text-slate-500 mt-1">100,000 ÷ 32 ≈ 3,125 ออเดอร์/เดือน</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs space-y-2">
                  <p className="font-semibold text-slate-800">5 ปัจจัยดันยอดให้ถึงเป้าหมาย 105 ออเดอร์/วัน:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                    <div>• <strong>เพิ่ม CTR (Click Rate):</strong> ทำปกคลิป/พาดหัวให้น่ากดที่สุด</div>
                    <div>• <strong>เพิ่ม CR (Conversion Rate):</strong> คัดสินค้าที่รีวิวดี มีโปรคุ้ม</div>
                    <div>• <strong>ดัน AOV:</strong> ป้ายยาสินค้าซื้อคู่ หรือสินค้าเซ็ต</div>
                    <div>• <strong>เลือกคอมฯ สูง:</strong> ปรับหาสินค้าที่ให้คอมมิชชั่นสูง</div>
                  </div>
                </div>
              </div>

              {/* Day-by-Day Execution Plan */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  ตารางลงมือทำแบบวันต่อวัน (Day 0 – Day 7)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="font-bold text-blue-600">Day 0 – เตรียมของ</span>
                    <p className="text-slate-600">ยืนยันแอ็กเคานต์ Shopee Aff, เลือก 1–2 นิช, สร้าง Sheet ติดตาม และเตรียม CapCut</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="font-bold text-blue-600">Day 1 – ค้น & คัดสินค้า</span>
                    <p className="text-slate-600">คัด 50 สินค้าแรกที่มีเรตติ้ง ≥4.7 และรีวิว 1k+ บันทึกลง Sheet พร้อมจุดขาย 3 ข้อ</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="font-bold text-blue-600">Day 2 – เทมเพลตพร้อมใช้</span>
                    <p className="text-slate-600">เตรียมแคปชัน 5–10 แบบ, รูป 3 สไตล์, จัดคิวโพสต์วันละ 20–50 ชิ้นใน 2 ช่องทาง</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="font-bold text-blue-600">Day 3–7 – ยิงคอนเทนต์</span>
                    <p className="text-slate-600">โพสต์ทุกวันตามเวลา, ตอบคอมเมนต์ไว, เก็บตัวเลขยอดคลิก, ดึง Top 10 มาต่อยอด</p>
                  </div>
                </div>
              </div>

              {/* UTM Tracking & AIDA Formula */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* UTM Tracking */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    ระบบ UTM Tracking สำคัญอย่างไร?
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ถ้าไม่ใช้ UTM คุณจะเห็นแค่ยอดรวม แต่ไม่รู้ว่ายอดมาจากโพสต์ไหน แพลตฟอร์มไหน หรือข้อความแบบไหนที่เวิร์ก
                  </p>
                  <div className="bg-purple-50 text-purple-950 p-3 rounded-xl text-xs font-mono border border-purple-100 space-y-1">
                    <div className="text-[11px] text-purple-700 font-sans font-bold">ตัวอย่างลิงก์ติด UTM:</div>
                    <div className="break-all text-[11px]">
                      ...?utm_source=tiktok&utm_medium=short&utm_campaign=fan2026&utm_content=hook1
                    </div>
                  </div>
                </div>

                {/* AIDA Formula */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    โครงสร้างโพสต์ขายดี (AIDA Model)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                      <strong>A (Attention):</strong> หยุดนิ้วโป้งใน 3 วิแรก
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                      <strong>I (Interest):</strong> บอกประโยชน์ ไม่ใช่แค่สเปค
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                      <strong>D (Desire):</strong> กระตุ้นด้วยรีวิวและโปรโมชั่น
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                      <strong>A (Action):</strong> CTA ชี้พิกัดในตะกร้า/ลิงก์
                    </div>
                  </div>
                </div>
              </div>

              {/* Ready-to-use Script Templates */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  เทมเพลตแคปชันสำเร็จรูปจากคู่มือ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="font-bold text-slate-800">1. สูตรใช้จริงแก้ปัญหา:</span>
                    <p className="text-slate-600 italic">"ใช้จริง ดีจริง ✅ [ปัญหา] หายจบในงบไม่เกิน [ราคา] ลิ้งนี่เลย 👇 [พิกัด]"</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="font-bold text-slate-800">2. สูตร 3 เหตุผลที่ต้องซื้อ:</span>
                    <p className="text-slate-600 italic">"3 เหตุผลที่ชอบตัวนี้: ① คุ้ม ② ใช้ง่าย ③ ทนทาน เทียบหลายรุ่นแล้วตัวนี้คุ้มสุด ⤵️ [พิกัด]"</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="font-bold text-slate-800">3. สูตร Flash Sale เร่งด่วน:</span>
                    <p className="text-slate-600 italic">"⚡️แฟลชเซลล์! [สินค้า] เหลือ [ราคา] บาท (แค่ 2 ชม. นี้) ตุนได้ตุน พิกัด 📌 [พิกัด]"</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-orange-500" />
            <span>มีข้อสงสัยเพิ่มเติม? สามารถกดคุยกับ <strong>"ผู้ช่วย Affiliate"</strong> ที่มุมล่างขวาได้ตลอดเวลา</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            ปิดคู่มือ
          </button>
        </div>

      </div>
    </div>
  );
};
