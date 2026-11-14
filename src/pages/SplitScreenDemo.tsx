import React from 'react';
import { ProjectorWall } from './ProjectorWall';
import { GuestSprayPad } from './GuestSprayPad';
import { Smartphone, Tv, Sparkles, MonitorPlay } from 'lucide-react';

export const SplitScreenDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col text-white">
      {/* Top Demo Bar */}
      <div className="bg-obsidian-900 border-b border-white/10 px-6 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-gold-500 text-black font-black text-[10px] uppercase">
            90-Second Demo Studio
          </span>
          <span className="font-semibold text-gray-300">
            TV Projector Wall (Left) + Guest Smartphone Spray Pad (Right) Side-by-Side
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-gray-400">
          <span className="flex items-center gap-1.5 text-gold-400">
            <Sparkles className="w-3.5 h-3.5" />
            0ms Native Cross-Window Sync Active
          </span>
          <span>•</span>
          <span>Ideal for 90s Hackathon Video Recording</span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden">
        {/* Left 65%: The Projector Wall */}
        <div className="xl:col-span-8 border-b xl:border-b-0 xl:border-r border-white/10 overflow-y-auto">
          <ProjectorWall />
        </div>

        {/* Right 35%: The Interactive Mobile Spray Phone */}
        <div className="xl:col-span-4 bg-obsidian-950/90 p-4 lg:p-6 flex flex-col items-center justify-center overflow-y-auto">
          <div className="w-full max-w-sm mb-3 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1.5 text-gold-400 font-bold">
              <Smartphone className="w-4 h-4" />
              <span>Guest Phone View</span>
            </div>
            <span className="text-[11px] bg-white/5 px-2 py-0.5 rounded text-gray-400">
              Interactive Mockup
            </span>
          </div>

          {/* Smartphone Hardware Frame */}
          <div className="w-full max-w-sm rounded-[40px] border-4 border-obsidian-700 bg-obsidian-950 p-2 shadow-2xl shadow-black relative">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-obsidian-950 rounded-full z-30 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-obsidian-900 border border-white/10 mr-2" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
            </div>

            <div className="rounded-[32px] overflow-hidden border border-white/5">
              <GuestSprayPad />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

