import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spray } from '../types';
import { Crown, Sparkles, Flame, DollarSign } from 'lucide-react';

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
          Scan the QR code below or visit the spray link on your phone to spray the celebrants live on screen!
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Awaiting Next Big Baller
        </div>
      </div>
    );
  }

  const getTierBadge = (tier: string, amount: number) => {
    if (amount >= 50 || tier === 'otunba') {
      return {
        label: '👑 OTUNBA BALLER ALERT',
        style: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black shadow-lg shadow-gold-500/50',
      };
    }
    if (amount >= 20 || tier === 'executive') {
      return {
        label: '💎 CHIEF EXECUTIVE SPRAY',
        style: 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/40',
      };
    }
    return {
      label: '💸 CHAIRMAN SPRAY',
      style: 'bg-gradient-to-r from-gold-500 to-amber-500 text-black shadow-md shadow-gold-500/30',
    };
  };

  const badge = getTierBadge(spray.tier, spray.amount);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={spray.id}
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -30 }}
        transition={{ type: 'spring', damping: 18, stiffness: 220 }}
        className="relative w-full max-w-2xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-gold-400 via-amber-600/40 to-transparent shadow-[0_0_80px_rgba(245,158,11,0.4)]"
      >
        {/* Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-gold-500/30 via-emerald-500/20 to-gold-500/30 rounded-3xl blur-2xl -z-10 animate-pulse-glow" />

        <div className="relative rounded-[22px] bg-obsidian-950/90 backdrop-blur-2xl border border-white/10 p-6 md:p-8 overflow-hidden text-center">
          {/* Top Decorative Tier Tag */}
          <div className="flex justify-center mb-4">
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs md:text-sm font-extrabold uppercase tracking-wider ${badge.style}`}>
              <Flame className="w-4 h-4 fill-current" />
              {badge.label}
              <Flame className="w-4 h-4 fill-current" />
            </span>
          </div>

          {/* Guest Name & Avatar */}
          <div className="flex items-center justify-center gap-3 mb-3">
            {spray.avatarUrl ? (
              <img
                src={spray.avatarUrl}
                alt={spray.guestName}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-gold-400 shadow-md"
              />
            ) : (
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center text-obsidian-950 font-black text-xl border-2 border-gold-300">
                {spray.guestName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow font-display">
                {spray.guestName}
              </h2>
              <p className="text-xs text-gold-400/90 font-medium flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-gold-400" />
                Just Sprayed On The Dance Floor
              </p>
            </div>
          </div>

          {/* Sprayed Amount Callout */}
          <div className="my-5 py-4 px-6 rounded-2xl bg-gradient-to-r from-gold-500/10 via-gold-500/20 to-gold-500/10 border border-gold-500/30">
            <span className="text-xs font-semibold text-gold-300 uppercase tracking-widest block mb-1">
              Sprayed Amount
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 font-mono tracking-tight drop-shadow-lg">
                ${spray.amount.toLocaleString()}
              </span>
              <span className="text-lg md:text-xl font-bold text-gold-400/90 font-mono">
                {spray.currency}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-400 font-medium">
              ≈ ₦{(spray.amount * 1650).toLocaleString()} (Instant Web3 Settlement)
            </div>
          </div>

          {/* Guest Personal Shoutout */}
          {spray.shoutout && (
            <div className="relative mt-4 px-6 py-3 rounded-xl bg-white/5 border border-white/10 max-w-lg mx-auto">
              <span className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-obsidian-900 border border-white/10 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Shoutout to Celebrants
              </span>
              <p className="text-base md:text-lg font-semibold text-gray-100 italic">
                "{spray.shoutout}"
              </p>
            </div>
          )}

          {/* Footer mini info */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span>Tx: {spray.txHash.slice(0, 10)}...</span>
            <span>•</span>
            <span>Pollar Stellar Testnet</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

