import React from 'react';
import { MessageSquare, Mail, Phone, MapPin, Clock, Sparkles } from 'lucide-react';

interface UpayFooterProps {
  onOpenModal?: (modalType: string) => void;
  onNavigateHome?: () => void;
}

export const UpayFooter: React.FC<UpayFooterProps> = ({
  onOpenModal,
  onNavigateHome,
}) => {
  const handleLogoClick = () => {
    if (onNavigateHome) onNavigateHome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#262626] text-slate-300 text-xs pt-12 pb-8 border-t-4 border-[#FAB915]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Column 1: Brand & Purpose */}
          <div className="lg:col-span-1">
            {/* Brand Zone: Authentic MFS Animated Logo in Footer */}
            <button
              onClick={handleLogoClick}
              className="inline-flex items-center gap-2.5 mb-4 cursor-pointer text-left group shrink-0 focus:outline-none select-none transition-transform duration-300 ease-out active:scale-[0.97]"
              title="TakaSafe Home"
            >
              <div className="relative w-9 h-9 shrink-0">
                <div className="absolute inset-0 rounded-full mfs-halo-pulse pointer-events-none" />
                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center p-1 shadow-sm mfs-icon-bounce transition-all duration-300 group-hover:shadow-[0_4px_18px_rgba(250,185,21,0.5),0_0_8px_rgba(250,185,21,0.4)]">
                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                    <path
                      d="M 22 45 C 22 75 78 75 78 45"
                      fill="none"
                      stroke="#FAB915"
                      strokeWidth="14"
                      strokeLinecap="round"
                      className="mfs-curve-flex origin-bottom"
                    />
                    <path
                      d="M 34 52 C 34 72 66 72 66 52"
                      fill="none"
                      stroke="#0054A6"
                      strokeWidth="10"
                      strokeLinecap="round"
                      className="mfs-curve-flex origin-bottom"
                    />
                    <circle cx="50" cy="30" r="8" fill="#E11D48" className="mfs-dot-wink origin-center" />
                  </svg>
                </div>
              </div>
              <div className="mfs-logo-text flex items-baseline tracking-tight select-none">
                <span className="font-['Hind_Siliguri','Noto_Sans_Bengali',sans-serif] text-xl font-black text-[#FAB915] leading-none">
                  টাকা
                </span>
                <span className="font-['Times_New_Roman',Times,serif] text-[22px] font-bold text-white leading-none ml-1 tracking-tight">
                  Safe
                </span>
              </div>
            </button>
            <p className="text-slate-400 text-[12px] leading-relaxed">
              TakaSafe is aiming to help aspirers achieve their goals through easy, secure and innovative Digital Financial Solutions.
            </p>
          </div>

          {/* Column 2: GET IN TOUCH */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-amber-400 font-bold tracking-wider uppercase text-xs mb-3">GET IN TOUCH</h4>
            
            <button
              onClick={() => onOpenModal?.('LIVE_CHAT')}
              className="flex items-center gap-2.5 hover:text-amber-300 transition-colors cursor-pointer text-left w-full focus:outline-none"
            >
              <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="font-semibold underline decoration-amber-400/50 underline-offset-2">
                Live Chat Support (24/7 Assistant)
              </span>
            </button>

            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <a href="mailto:customerservice@takasafe.com" className="hover:text-amber-300 transition-colors">
                  customerservice@takasafe.com
                </a>
                <span className="block text-[11px] text-slate-400">(For Customer Service only)</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <a href="mailto:info@takasafe.com" className="hover:text-amber-300 transition-colors">
                  info@takasafe.com
                </a>
                <span className="block text-[11px] text-slate-400">(For Media Queries)</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <a href="tel:16268" className="font-semibold text-white hover:text-amber-300 transition-colors">
                16268
              </a>
              <span className="text-slate-400">/</span>
              <a href="tel:09610916268" className="hover:text-amber-300 transition-colors">
                09610916268
              </a>
            </div>

            <div
              onClick={() => onOpenModal?.('SERVICE_LOCATIONS')}
              className="flex items-start gap-2.5 text-[11px] text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Plot CWS (A) -1, Road 34, Gulshan Avenue, Dhaka - 1212, Bangladesh</span>
            </div>

            <div
              onClick={() => onOpenModal?.('SERVICE_LOCATIONS')}
              className="flex items-start gap-2.5 text-[11px] text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-medium">TakaSafe Point (Customer Service Center):</span>{' '}
                Plot No.3, Block-5E(H)8, Near Shooting Club Gulshan Avenue, Gulshan-1, Dhaka-1212 ·{' '}
                <span className="text-amber-300">Timing: 9:30 am - 4:00 pm</span>
              </div>
            </div>
          </div>

          {/* Column 3: USEFUL LINKS & COMPANY INFO */}
          <div className="space-y-6">
            <div>
              <h4 className="text-amber-400 font-bold tracking-wider uppercase text-xs mb-3">USEFUL LINKS</h4>
              <ul className="space-y-1.5 text-[12px] text-slate-400">
                <li onClick={() => onOpenModal?.('ABSTRACT')} className="text-amber-300 font-bold hover:text-white cursor-pointer transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Official Project Abstract & SDGs</span>
                </li>
                <li onClick={() => onOpenModal?.('LIMITS_CHARGES')} className="hover:text-white cursor-pointer transition-colors">Limits and Charges</li>
                <li onClick={() => onOpenModal?.('MEDIA')} className="hover:text-white cursor-pointer transition-colors">Press Release</li>
                <li onClick={() => onOpenModal?.('NEED_HELP')} className="hover:text-white cursor-pointer transition-colors">Need Help?</li>
                <li onClick={() => onOpenModal?.('PARTNER')} className="hover:text-white cursor-pointer transition-colors">Partner</li>
                <li onClick={() => onOpenModal?.('DISCONTINUED_AGENTS')} className="hover:text-white cursor-pointer transition-colors">Discontinued Agents</li>
              </ul>
            </div>

            <div>
              <h4 className="text-amber-400 font-bold tracking-wider uppercase text-xs mb-2">COMPANY INFO</h4>
              <ul className="space-y-1.5 text-[12px] text-slate-400">
                <li onClick={() => onOpenModal?.('PRIVACY_POLICY')} className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
                <li onClick={() => onOpenModal?.('TERMS')} className="hover:text-white cursor-pointer transition-colors">Terms and Conditions</li>
                <li onClick={() => onOpenModal?.('ABOUT_US')} className="hover:text-white cursor-pointer transition-colors">Who We Are</li>
                <li onClick={() => onOpenModal?.('BUSINESS')} className="hover:text-white cursor-pointer transition-colors">Business Solution</li>
              </ul>
            </div>
          </div>

          {/* Column 4: STAY CONNECTED & APP DOWNLOADS */}
          <div>
            <h4 className="text-amber-400 font-bold tracking-wider uppercase text-xs mb-3">STAY CONNECTED</h4>
            
            {/* Social Icons */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => onOpenModal?.('MEDIA')}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-blue-600 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                title="Facebook Community"
              >
                f
              </button>
              <button
                onClick={() => onOpenModal?.('ABOUT_US')}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-blue-500 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                title="LinkedIn Network"
              >
                in
              </button>
              <button
                onClick={() => onOpenModal?.('MEDIA')}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-red-600 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                title="YouTube Channel"
              >
                ▶
              </button>
              <button
                onClick={() => onOpenModal?.('LIVE_CHAT')}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                title="WhatsApp Direct"
              >
                wa
              </button>
              <button
                onClick={() => onOpenModal?.('LIVE_CHAT')}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-sky-500 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                title="IMO Official"
              >
                imo
              </button>
            </div>

            {/* Badges */}
            <div className="space-y-2">
              <div
                onClick={() => onOpenModal?.('APP_DOWNLOAD')}
                className="bg-black hover:bg-slate-900 border border-slate-700 rounded-lg p-2 flex items-center gap-2 cursor-pointer transition-all hover:border-amber-400"
              >
                <div className="text-xl">▶</div>
                <div className="leading-tight">
                  <span className="text-[9px] uppercase text-slate-400 block">GET IT ON</span>
                  <span className="text-xs font-bold text-white">Google Play</span>
                </div>
              </div>

              <div
                onClick={() => onOpenModal?.('APP_DOWNLOAD')}
                className="bg-black hover:bg-slate-900 border border-slate-700 rounded-lg p-2 flex items-center gap-2 cursor-pointer transition-all hover:border-amber-400"
              >
                <div className="text-xl"></div>
                <div className="leading-tight">
                  <span className="text-[9px] uppercase text-slate-400 block">Download on the</span>
                  <span className="text-xs font-bold text-white">App Store</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-1.5 text-xs font-bold text-white">
              <span>Financial Trust & Resilience Platform</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <div>
            © 2026 TakaSafe. All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-semibold">TakaSafe MFS Platform</span>
            <span>·</span>
            <span>DIU CPC × upay AI DEV FEST 2026</span>
            <span>·</span>
            <span>Team 3AM Runtime</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
