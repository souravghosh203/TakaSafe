import React, { useState } from 'react';
import { CustomerBaseline } from '../../types';
import { Eye, EyeOff } from 'lucide-react';
import { formatLocalizedNumber } from '../../utils/formatCurrency';

interface TakaSafeSovereignCardProps {
  customer: CustomerBaseline;
  lang?: 'EN' | 'BN';
}

export const TakaSafeSovereignCard: React.FC<TakaSafeSovereignCardProps> = ({
  customer,
  lang = 'EN',
}) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(true);

  // Format wallet into a 4-cluster luxury card number format
  // e.g. 01711-239481 -> 3759 0171 1239 9481
  const cleanWallet = customer.wallet.replace(/\D/g, '');
  const prefix = '3759';
  const part1 = cleanWallet.slice(0, 4) || '0171';
  const part2 = cleanWallet.slice(4, 8) || '1239';
  const part3 = cleanWallet.slice(8) || '9481';

  return (
    <div className="relative group select-none">
      {/* Outer ambient glow and luxury drop shadow */}
      <div className="absolute -inset-1 rounded-[26px] bg-gradient-to-r from-blue-600/30 via-cyan-500/20 to-indigo-600/30 blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Main Card Container */}
      <div className="relative w-full rounded-2xl p-6 sm:p-7 overflow-hidden text-white shadow-[0_20px_50px_-15px_rgba(3,18,43,0.85),0_0_0_1px_rgba(255,255,255,0.18)] bg-gradient-to-br from-[#1C3E67] via-[#102744] to-[#0A182B] transition-all duration-300 hover:shadow-[0_25px_60px_-15px_rgba(3,18,43,0.95),0_0_0_1px_rgba(255,255,255,0.28)]">
        {/* Layer 1: Fine-line Security Guilloché & Concentric Lathe-Work */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.22] pointer-events-none mix-blend-screen"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="amex-guilloche" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="28" fill="none" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
              <circle cx="30" cy="30" r="22" fill="none" stroke="#93C5FD" strokeWidth="0.4" />
              <circle cx="30" cy="30" r="16" fill="none" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3 2" />
              <circle cx="30" cy="30" r="10" fill="none" stroke="#93C5FD" strokeWidth="0.4" />
              <circle cx="30" cy="30" r="4" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#amex-guilloche)" />
        </svg>

        {/* Layer 2: Neoclassical Sovereign Guardian Centurion Medallion (Watermark Inspired by Reference) */}
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none opacity-[0.28] mix-blend-overlay">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
            {/* Concentric security borders */}
            <circle cx="100" cy="100" r="94" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="1" />
            <circle cx="100" cy="100" r="82" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
            <circle cx="100" cy="100" r="72" stroke="currentColor" strokeWidth="0.75" />

            {/* Classical Sovereign Helmet / Guardian Silhouette Profile */}
            <path
              d="M100 35 C125 35 145 55 145 80 C145 95 138 115 130 128 L142 165 L100 155 L58 165 L70 128 C62 115 55 95 55 80 C55 55 75 35 100 35 Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="currentColor"
              fillOpacity="0.08"
            />
            {/* Centurion Crest Feather Arcs */}
            <path
              d="M72 48 Q100 20 128 48 Q100 32 72 48 Z"
              stroke="currentColor"
              strokeWidth="1"
              fill="currentColor"
              fillOpacity="0.15"
            />
            <path
              d="M78 40 Q100 15 122 40"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeDasharray="2 1"
            />
            {/* Visor & Shield Guard */}
            <path d="M80 80 L120 80 M85 92 L115 92 M90 104 L110 104" stroke="currentColor" strokeWidth="1" />
            <circle cx="100" cy="62" r="5" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        {/* Layer 3: Diagonal Iridescent Reflection Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent pointer-events-none transform -skew-x-12" />

        {/* Card Content Hierarchy */}
        <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
          {/* Top Row: Brand & Posh Security Seal */}
          <div className="flex items-start justify-between gap-4">
            {/* Left: Card Tier & Account Name */}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-slate-300 font-extrabold drop-shadow-sm">
                  TAKASAFE SOVEREIGN
                </span>
              </div>
              <span className="text-[9px] font-sans text-blue-200/80 tracking-wider uppercase block mt-0.5">
                {lang === 'BN' ? 'প্রিমিয়াম সুরক্ষিত অ্যাকাউন্ট' : 'Private Reserve Account'}
              </span>
            </div>

            {/* Right: Posh, High-End ScamShield Security Seal (Replaces Yellow Badge) */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
              </span>
              <span className="text-[9.5px] font-mono font-bold tracking-[0.14em] uppercase text-slate-100">
                SCAMSHIELD 24/7
              </span>
            </div>
          </div>

          {/* Middle Row: Realistic Metallic EMV Smart Chip & Contactless Wave */}
          <div className="flex items-center justify-between pt-1">
            {/* High-Fidelity Brushed Gold/Palladium EMV Microchip */}
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-9 rounded-md bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300/90 border border-amber-400/90 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.35)] relative overflow-hidden flex items-center justify-center"
                title="EMV Cryptographic Smart Chip"
              >
                {/* Microchip internal trace geometry */}
                <div className="absolute inset-0 border border-amber-500/40 rounded-sm m-1 pointer-events-none" />
                <div className="w-full h-[0.5px] bg-amber-600/50 absolute top-1/2 -translate-y-1/2" />
                <div className="h-full w-[0.5px] bg-amber-600/50 absolute left-1/3" />
                <div className="h-full w-[0.5px] bg-amber-600/50 absolute right-1/3" />
                <div className="w-2.5 h-3 rounded-xs border border-amber-600/60 bg-amber-200/50 shadow-inner z-10" />
              </div>

              {/* Contactless Wave Icon (Amex inspired) */}
              <div className="text-slate-300/90 flex items-center" title="NFC Contactless">
                <svg className="w-5 h-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8.5 16.5a5 5 0 0 1 0-9" strokeLinecap="round" />
                  <path d="M12 19a8.5 8.5 0 0 0 0-14" strokeLinecap="round" />
                  <path d="M15.5 21.5a12 12 0 0 0 0-19" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Right: Security ID / CID */}
            <div className="text-right">
              <span className="font-mono text-xs font-bold tracking-[0.2em] text-slate-300/90 drop-shadow-sm">
                7997
              </span>
            </div>
          </div>

          {/* Balance Display: Refined Luxury Typography */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-[9.5px] uppercase font-bold tracking-[0.2em] text-slate-300/80">
              <span>{lang === 'BN' ? 'বর্তমান ব্যালেন্স' : 'Available Sovereign Balance'}</span>
              <button
                type="button"
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer p-0.5"
                title={isBalanceVisible ? 'Hide Balance' : 'Show Balance'}
              >
                {isBalanceVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-baseline gap-1.5 mt-1">
              {/* Currency Symbol in Frosted Platinum Foil */}
              <span className="text-lg font-serif font-bold text-slate-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                ৳
              </span>
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
                {isBalanceVisible ? formatLocalizedNumber(customer.balance, lang) : '••••••••'}
              </span>
            </div>
          </div>

          {/* Embossed Card Number (Amex 4-block style) */}
          <div className="pt-1">
            <div className="font-mono text-sm sm:text-base font-bold tracking-[0.24em] text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9),0_-1px_1px_rgba(255,255,255,0.25)] flex items-center justify-between">
              <span>{prefix}</span>
              <span>{part1}</span>
              <span>{part2}</span>
              <span>{part3}</span>
            </div>
          </div>

          {/* Bottom Row: Member Since Ribbon, Cardholder Name, Expiry */}
          <div className="pt-2 border-t border-white/15 flex items-end justify-between text-[10px] text-slate-200">
            {/* Cardholder Name & Expiry */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-3 text-[9px] text-slate-300/80 font-mono uppercase tracking-wider">
                <span>VAL THRU 09/29</span>
                <span>•</span>
                <span className="text-emerald-300 font-semibold">KYC VERIFIED</span>
              </div>
              <div className="font-sans font-black text-xs sm:text-sm tracking-[0.14em] uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {customer.name}
              </div>
            </div>

            {/* Member Since Ribbon (Amex Centurion Hallmark) */}
            <div className="text-right">
              <div className="inline-block border border-white/40 bg-white/5 backdrop-blur-xs px-2.5 py-0.5 rounded-sm text-[8px] font-mono font-bold uppercase tracking-[0.18em] text-slate-200 shadow-inner">
                MEMBER SINCE 24
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
