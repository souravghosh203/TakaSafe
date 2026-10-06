import React from 'react';
import { MessageSquare, Mail, Phone, MapPin, Clock, Sparkles } from 'lucide-react';

interface UpayFooterProps {
  lang?: 'EN' | 'BN';
  onOpenModal?: (modalType: string) => void;
  onNavigateHome?: () => void;
}

export const UpayFooter: React.FC<UpayFooterProps> = ({
  lang = 'EN',
  onOpenModal,
  onNavigateHome,
}) => {
  const isBn = lang === 'BN';
  const handleLogoClick = () => {
    if (onNavigateHome) onNavigateHome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative overflow-hidden border-t-4 border-[#FAB915] bg-[#1f2329] text-slate-300 text-xs">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(250,185,21,0.08),transparent_68%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative grid grid-cols-1 gap-x-10 gap-y-9 py-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-y-10 lg:py-12">
          {/* Column 1: Brand & Purpose */}
          <div className="sm:col-span-2 lg:col-span-3">
            {/* Brand Zone: Authentic MFS Animated Logo in Footer */}
            <button
              onClick={handleLogoClick}
              className="inline-flex items-center gap-2.5 mb-3 cursor-pointer text-left group shrink-0 focus:outline-none select-none transition-transform duration-300 ease-out active:scale-[0.97]"
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
            <p className="max-w-xs text-[13px] leading-6 text-slate-400">
              {isBn ? 'সহজ, নিরাপদ ও উদ্ভাবনী ডিজিটাল আর্থিক সেবার মাধ্যমে মানুষের লক্ষ্য অর্জনে TakaSafe কাজ করছে।' : 'TakaSafe is aiming to help people achieve their goals through easy, secure and innovative digital financial services.'}
            </p>
          </div>

          {/* Column 2: GET IN TOUCH */}
          <div className="lg:col-span-4">
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">{isBn ? 'যোগাযোগ' : 'CONTACT & SUPPORT'}</h4>
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-4">
            
            <button
              onClick={() => onOpenModal?.('LIVE_CHAT')}
              className="flex items-center gap-2.5 hover:text-amber-300 transition-colors cursor-pointer text-left w-full focus:outline-none"
            >
              <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="font-semibold underline decoration-amber-400/50 underline-offset-2">
                {isBn ? 'লাইভ চ্যাট সহায়তা (২৪/৭)' : 'Live Chat Support (24/7 Assistant)'}
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
              </div>

              <div className="space-y-4">
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
            </div>
          </div>

          {/* Column 3: USEFUL LINKS & COMPANY INFO */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-3 lg:gap-6">
            <div>
              <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">{isBn ? 'প্রয়োজনীয় লিংক' : 'EXPLORE'}</h4>
              <ul className="space-y-3 text-[12px] text-slate-400">
                <li onClick={() => onOpenModal?.('ABSTRACT')} className="text-amber-300 font-bold hover:text-white cursor-pointer transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{isBn ? 'প্রকল্পের সারসংক্ষেপ ও SDG' : 'Official Project Abstract & SDGs'}</span>
                </li>
                <li onClick={() => onOpenModal?.('LIMITS_CHARGES')} className="hover:text-white cursor-pointer transition-colors">{isBn ? 'সীমা ও চার্জ' : 'Limits and Charges'}</li>
                <li onClick={() => onOpenModal?.('MEDIA')} className="hover:text-white cursor-pointer transition-colors">{isBn ? 'সংবাদ বিজ্ঞপ্তি' : 'Press Release'}</li>
                <li onClick={() => onOpenModal?.('NEED_HELP')} className="hover:text-white cursor-pointer transition-colors">{isBn ? 'সহায়তা' : 'Need Help?'}</li>
                <li onClick={() => onOpenModal?.('PARTNER')} className="hover:text-white cursor-pointer transition-colors">{isBn ? 'অংশীদার' : 'Partner'}</li>
                <li onClick={() => onOpenModal?.('DISCONTINUED_AGENTS')} className="hover:text-white cursor-pointer transition-colors">{isBn ? 'বন্ধ এজেন্ট' : 'Discontinued Agents'}</li>
              </ul>
            </div>

          <div>
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">{isBn ? 'প্রতিষ্ঠানের তথ্য' : 'COMPANY'}</h4>
            <ul className="space-y-3 text-[12px] text-slate-400">
              <li onClick={() => onOpenModal?.('PRIVACY_POLICY')} className="hover:text-white cursor-pointer transition-colors">{isBn ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</li>
              <li onClick={() => onOpenModal?.('TERMS')} className="hover:text-white cursor-pointer transition-colors">{isBn ? 'শর্তাবলি' : 'Terms and Conditions'}</li>
              <li onClick={() => onOpenModal?.('ABOUT_US')} className="hover:text-white cursor-pointer transition-colors">{isBn ? 'আমাদের পরিচিতি' : 'Who We Are'}</li>
              <li onClick={() => onOpenModal?.('BUSINESS')} className="hover:text-white cursor-pointer transition-colors">{isBn ? 'ব্যবসায়িক সমাধান' : 'Business Solution'}</li>
            </ul>
          </div>
          </div>

          {/* Column 4: STAY CONNECTED & APP DOWNLOADS */}
          <div className="lg:col-span-2">
          <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">{isBn ? 'সঙ্গে থাকুন' : 'FOLLOW & GET THE APP'}</h4>
            
            {/* Social Icons */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
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
        <div className="relative flex flex-col items-center justify-between gap-3 border-t border-white/10 py-5 text-center text-[11px] text-slate-500 sm:flex-row sm:text-left">
          <div className="whitespace-nowrap">
            © 2026 TakaSafe. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-end">
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
