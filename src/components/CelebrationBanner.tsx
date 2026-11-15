import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spray } from '../types';
import { Crown, Sparkles, Flame, DollarSign, Volume2, ShieldCheck } from 'lucide-react';

interface CelebrationBannerProps {
  spray: Spray | null;
}

export const CelebrationBanner: React.FC<CelebrationBannerProps> = ({ spray }) => {
  if (!spray) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-3xl border border-white/5 bg-obsidian-900/60 backdrop-blur-xl text-center max-w-xl mx-auto shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mb-4 animate-float">
          <Sparkles className="w-8 h-8 text-gold-400" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide mb-1 font-display">
          The Dance Floor is Open!
        </h3>
        <p className="text-sm text-gray-400 max-w-sm">
          Scan the table QR code or visit the spray link on your phone to spray the celebrants live on screen!
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Awaiting Next Big Odogwu Baller
        </div>
      </div>
    );
  }

  const isOdogwu = spray.isOdogwu || spray.ballerTitle === 'Odogwu' || spray.amount >= 50 || spray.tier === 'otunba';

  const getTierBadge = () => {
    if (isOdogwu) {
      return {
        label: '👑 ODOGWU SPRAY ALERT • HAIL THE ODOGWU! 👑',
        style: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black shadow-xl shadow-yellow-500/60 font-black',
      };
    }
    if (spray.amount >= 20 || spray.tier === 'executive') {
      return {
        label: '💎 CHIEF EXECUTIVE SPRAY',
        style: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/40 font-bold',
      };
    }
    return {
      label: '💸 CHAIRMAN SPRAY',
      style: 'bg-gradient-to-r from-gold-500 to-amber-500 text-black shadow-md shadow-gold-500/30 font-bold',
    };
  };

  const badge = getTierBadge();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={spray.id}
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -30 }}
        transition={{ type: 'spring', damping: 18, stiffness: 220 }}
        className={`relative w-full max-w-2xl mx-auto rounded-3xl p-1 ${
          isOdogwu 
            ? 'bg-gradient-to-b from-yellow-300 via-amber-500 to-yellow-600 shadow-[0_0_100px_rgba(245,158,11,0.6)] animate-pulse'
            : 'bg-gradient-to-b from-gold-400 via-amber-600/40 to-transparent shadow-[0_0_80px_rgba(245,158,11,0.4)]'
        }`}
      >
        {/* Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-gold-500/30 via-emerald-500/20 to-gold-500/30 rounded-3xl blur-2xl -z-10 animate-pulse-glow" />

        <div className="relative rounded-[22px] bg-obsidian-950/95 backdrop-blur-2xl border border-white/10 p-6 md:p-8 overflow-hidden text-center">
          {/* Top Decorative Tier Tag */}
          <div className="flex justify-center mb-4">
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs md:text-sm uppercase tracking-wider ${badge.style}`}>
              <Crown className="w-4 h-4 fill-current" />
              {badge.label}
              <Crown className="w-4 h-4 fill-current" />
            </span>
          </div>

          {/* Guest Name & Avatar */}
          <div className="flex items-center justify-center gap-3 mb-3">
            {spray.avatarUrl ? (
              <img
                src={spray.avatarUrl}
                alt={spray.guestName}
                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-gold-400 shadow-md"
              />
            ) : (
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 flex items-center justify-center text-obsidian-950 font-black text-2xl border-2 border-gold-300 shadow-lg shadow-yellow-500/30">
                {spray.guestName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight drop-shadow font-display">
                  {spray.guestName}
                </h2>
                {isOdogwu && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-obsidian-950 text-[10px] font-black uppercase">
                    👑 ODOGWU
                  </span>
                )}
              </div>
              <p className="text-xs text-gold-400/90 font-medium flex items-center gap-1 mt-0.5">
                <Crown className="w-3.5 h-3.5 text-gold-400" />
                {isOdogwu ? 'Hailed by Afrobeats Praise Singers!' : 'Just Sprayed On The Dance Floor'}
              </p>
            </div>
          </div>

          {/* Sprayed Amount Callout */}
          <div className="my-5 py-4 px-6 rounded-2xl bg-gradient-to-r from-gold-500/10 via-gold-500/20 to-gold-500/10 border border-gold-500/30">
            <span className="text-xs uppercase tracking-widest text-gold-400/90 font-semibold block mb-1">
              Confirmed Real-Time Spray
            </span>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl md:text-5xl font-black text-gold-400 font-mono tracking-tight">
                ${spray.amount.toLocaleString()}
              </span>
              <span className="text-base font-bold text-gray-300 font-mono">
                USDC
              </span>
              <span className="text-xs md:text-sm font-semibold text-emerald-400 ml-2">
                (≈ ₦{(spray.amount * 1650).toLocaleString()})
              </span>
            </div>
          </div>

          {/* Shoutout Quote */}
          {spray.shoutout && (
            <div className="relative inline-block max-w-md mx-auto my-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-lg text-gold-400/50 absolute -top-2 left-2">“</span>
              <p className="text-sm md:text-base font-medium text-gray-200 italic px-2">
                {spray.shoutout}
              </p>
              <span className="text-lg text-gold-400/50 absolute -bottom-4 right-2">”</span>
            </div>
          )}

          {/* Real-Time Auto-Offramp Notification */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-emerald-400 font-mono">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              100% Auto-Settled into Host Nigerian Bank
            </span>
            {spray.txHash && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                Stellar On-Chain: {spray.txHash.slice(0, 6)}...{spray.txHash.slice(-4)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
