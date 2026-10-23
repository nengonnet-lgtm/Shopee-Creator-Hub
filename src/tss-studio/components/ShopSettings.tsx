import React, { useState } from 'react';
import { Store, Truck, CreditCard, Info, ChevronDown, ChevronUp, CheckCircle2, RotateCcw } from 'lucide-react';
import { ShopInfo } from '../types';

interface ShopSettingsProps {
  shopInfo: ShopInfo;
  setShopInfo: (info: ShopInfo) => void;
  disabled?: boolean;
  forceExpanded?: boolean;
  className?: string;
}

const ShopSettings: React.FC<ShopSettingsProps> = ({ shopInfo, setShopInfo, disabled, forceExpanded = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const isExpanded = forceExpanded || isOpen;

  const handleChange = (field: keyof ShopInfo, value: string) => {
    setShopInfo({ ...shopInfo, [field]: value });
  };

  const handleResetShopInfo = () => {
    setShopInfo({
      name: '',
      shippingPolicy: '',
      paymentMethods: '',
      additionalInfo: ''
    });
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      {!forceExpanded && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <Store className="w-5 h-5 text-brand-600" />
              <span>ตั้งค่าข้อมูลร้านค้า</span>
            </div>
            <div className="flex items-center gap-2">
                {!isOpen && (shopInfo.name || shopInfo.shippingPolicy) && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      บันทึกแล้ว
                    </span>
                )}
                {isOpen && (
                  <span className="text-xs text-slate-400 font-normal mr-2 hidden sm:inline">
                    (บันทึกอัตโนมัติ)
                  </span>
                )}
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </button>
      )}

      {isExpanded && (
        <div className={`${forceExpanded ? 'p-0' : 'px-6 pb-6 pt-2'} space-y-4 animate-in slide-in-from-top-2 duration-200`}>
            {!forceExpanded && (
                <div className="p-3 bg-brand-50 border border-brand-100 rounded-lg">
                    <p className="text-xs text-brand-700">
                        💡 <strong>Pro Tip:</strong> ใส่ข้อมูลร้านค้าตรงนี้ AI จะจดจำและนำไปใช้ตอบลูกค้าอัตโนมัติ โดยที่คุณไม่ต้องพิมพ์ซ้ำ!
                    </p>
                </div>
            )}

            <div className="space-y-3">
                <div>
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5 mb-1.5">
                        ชื่อร้าน
                    </label>
                    <input
                        type="text"
                        value={shopInfo.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="เช่น ABC Shop"
                        disabled={disabled}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none disabled:opacity-50"
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5 mb-1.5">
                        <Truck className="w-3.5 h-3.5" />
                        การจัดส่ง
                    </label>
                    <input
                        type="text"
                        value={shopInfo.shippingPolicy}
                        onChange={(e) => handleChange('shippingPolicy', e.target.value)}
                        placeholder="เช่น ส่งฟรีทุกออเดอร์, ตัดรอบ 14.00 น."
                        disabled={disabled}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none disabled:opacity-50"
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5 mb-1.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        การชำระเงิน
                    </label>
                    <input
                        type="text"
                        value={shopInfo.paymentMethods}
                        onChange={(e) => handleChange('paymentMethods', e.target.value)}
                        placeholder="เช่น โอนเงิน, ปลายทาง +30 บาท"
                        disabled={disabled}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none disabled:opacity-50"
                    />
                </div>

                <div>
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5 mb-1.5">
                        <Info className="w-3.5 h-3.5" />
                        ข้อมูลเพิ่มเติม
                    </label>
                    <textarea
                        value={shopInfo.additionalInfo}
                        onChange={(e) => handleChange('additionalInfo', e.target.value)}
                        placeholder="ข้อมูลอื่นๆ ที่อยากให้ AI รู้..."
                        rows={2}
                        disabled={disabled}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none disabled:opacity-50"
                    />
                </div>

                {(shopInfo.name || shopInfo.shippingPolicy || shopInfo.paymentMethods || shopInfo.additionalInfo) && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleResetShopInfo}
                      disabled={disabled}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 hover:border-red-200 shadow-sm"
                      title="รีเซ็ตข้อมูลร้านค้าทั้งหมด (Reset)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>รีเซ็ตข้อมูลร้านค้า</span>
                    </button>
                  </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ShopSettings;