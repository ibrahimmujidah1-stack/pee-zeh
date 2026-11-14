import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardEntry } from '../types';
import { Trophy, Crown, Flame, Award } from 'lucide-react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currency?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, currency = 'USDC' }) => {
  const topEntries = entries.slice(0, 5);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-600 flex items-center justify-center text-obsidian-950 font-black shadow-lg shadow-gold-500/50">
            <Crown className="w-5 h-5 fill-current" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-300 via-slate-100 to-gray-400 flex items-center justify-center text-obsidian-950 font-black shadow-md shadow-gray-400/30">
            <span className="text-xs font-black">2</span>
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-800 flex items-center justify-center text-white font-black shadow-md shadow-amber-700/30">
            <span className="text-xs font-black">3</span>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 font-bold">
            <span className="text-xs">{rank}</span>
          </div>
        );
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-obsidian-900/80 backdrop-blur-2xl p-5 md:p-6 shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-wide font-display flex items-center gap-1.5">
              Top Ballers Tonight
              <Flame className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-gray-400">Live leaderboard ranking</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gold-500/20 text-gold-300 border border-gold-500/40">
          TOP 5
        </span>
      </div>

      {/* List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {topEntries.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            No ballers yet. Spray first to take the #1 Crown!
          </div>
        ) : (
          <AnimatePresence>
            {topEntries.map((entry) => (
              <motion.div
                key={entry.guestName}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                className={`relative rounded-2xl p-3.5 transition-all border ${
                  entry.rank === 1
                    ? 'bg-gradient-to-r from-gold-500/20 via-obsidian-800/80 to-obsidian-800/80 border-gold-500/50 shadow-lg shadow-gold-500/20'
                    : 'bg-obsidian-800/50 hover:bg-obsidian-800/80 border-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {getRankBadge(entry.rank)}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm md:text-base font-bold text-white truncate">
                          {entry.guestName}
                        </h4>
                        {entry.rank === 1 && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-gold-400 text-black">
                            CHAIRMAN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate max-w-[180px]">
                        {entry.sprayCount} {entry.sprayCount === 1 ? 'spray' : 'sprays'} • "{entry.latestShoutout || 'Soft life!'}"
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <span className="text-base md:text-lg font-black text-gold-400 font-mono">
                      ${entry.totalAmount.toLocaleString()}
                    </span>
                    <span className="text-[10px] block text-gray-500 font-mono">
                      {currency}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-white/5 mt-auto flex items-center justify-between text-[11px] text-gray-500">
        <span className="flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-gold-500" />
          Updated instantaneously
        </span>
        <span className="text-emerald-400 font-medium">● Realtime Sync</span>
      </div>
    </div>
  );
};

