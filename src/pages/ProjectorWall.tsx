import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Volume2, VolumeX, Maximize, Minimize, Sparkles, 
  Flame, Crown, QrCode 
} from 'lucide-react';
import { Party, Spray } from '../types';
import { getPartyById, getPartySprays, calculateLeaderboard, getParties } from '../services/storage';
import { subscribeToPartyLiveSync } from '../services/channel';
import { playCelebrationSound } from '../services/sound';
import { fetchSpraysFromSupabase } from '../services/supabase';
import { CelebrationBanner } from '../components/CelebrationBanner';
import { Leaderboard } from '../components/Leaderboard';
import { FallingMoney } from '../components/FallingMoney';

export const ProjectorWall: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const party = getPartyById(id || '') || getParties()[0];

  if (!party) {
    return (
      <div className="min-h-screen bg-obsidian-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center text-3xl mb-4">
          📺
        </div>
        <h2 className="text-xl font-black text-white font-display mb-2">Live Screen Not Found</h2>
        <p className="text-xs text-gray-400 max-w-xs mb-6">
          No active Owambe wall found for "{id}".
        </p>
        <Link to="/" className="px-6 py-2.5 rounded-xl bg-emerald-500 text-obsidian-950 font-bold text-xs uppercase">
          Go to Host Dashboard
        </Link>
      </div>
    );
  }

  const [sprays, setSprays] = useState<Spray[]>(() => getPartySprays(party.id));
  const [activeSpray, setActiveSpray] = useState<Spray | null>(() => {
    const list = getPartySprays(party.id);
    return list.length > 0 ? list[0] : null;
  });
  const [triggerCount, setTriggerCount] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const sprayUrl = `${window.location.origin}/spray/${party.slug}`;
  const totalSprayed = sprays.reduce((sum, s) => sum + s.amount, 0);
  const leaderboard = calculateLeaderboard(sprays);

  useEffect(() => {
    // Initial fetch from Supabase Cloud
    fetchSpraysFromSupabase(party.id).then((cloudSprays) => {
      if (cloudSprays && cloudSprays.length > 0) {
        setSprays((prev) => {
          const map = new Map();
          [...cloudSprays, ...prev].forEach((s) => map.set(s.id, s));
          const merged = Array.from(map.values());
          if (merged.length > 0) {
            setActiveSpray(merged[0]);
          }
          return merged;
        });
      }
    });

    const unsubscribe = subscribeToPartyLiveSync(party.id, (newSpray) => {
      setSprays((prev) => [newSpray, ...prev.filter((s) => s.id !== newSpray.id)]);
      setActiveSpray(newSpray);
      setTriggerCount((c) => c + 1);

      if (soundEnabled) {
        const isOdogwu = Boolean(
          newSpray.isOdogwu || 
          newSpray.ballerTitle === 'Odogwu' || 
          newSpray.amount >= 50 || 
          newSpray.tier === 'otunba'
        );
        playCelebrationSound(isOdogwu, newSpray.guestName, newSpray.amount);
      }
    });

    return unsubscribe;
  }, [party.id, soundEnabled]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="relative min-h-screen bg-obsidian-950 text-white overflow-hidden flex flex-col justify-between selection:bg-gold-500 selection:text-black">
      {/* Falling Money and Confetti FX */}
      <FallingMoney triggerCount={triggerCount} amount={activeSpray?.amount || 20} />

      {/* Ambient Luxury Lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top TV Header Bar */}
      <header className="w-full px-6 py-4 border-b border-white/10 bg-obsidian-900/60 backdrop-blur-xl flex items-center justify-between z-20">
        {/* Left: Event Title & Celebrant */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-400 to-amber-600 p-[1.5px] shadow-lg shadow-gold-500/20">
            <img
              src={party.celebrantPhoto}
              alt={party.celebrantName}
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h1 className="text-xl md:text-2xl font-black text-white tracking-wide font-display">
                {party.name}
              </h1>
            </div>
            <p className="text-xs text-gold-400 font-semibold">
              Live Owambe Dance Floor • Spraying {party.celebrantName}
            </p>
          </div>
        </div>

        {/* Center: Glowing Total Sprayed Ticker */}
        <div className="hidden lg:flex flex-col items-center px-8 py-2 rounded-2xl bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 border border-gold-500/40 shadow-xl shadow-gold-500/10">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-gold-400" />
            Total Sprayed Tonight
            <Sparkles className="w-3 h-3 text-gold-400" />
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 font-mono tracking-tight">
              ${totalSprayed.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-gold-400 font-mono">
              USDC
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            ≈ ₦{(totalSprayed * 1650).toLocaleString()}
          </span>
        </div>

        {/* Right: Screen Controls (Sound & Fullscreen) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-2xl border transition-all ${
              soundEnabled
                ? 'bg-gold-500/20 text-gold-400 border-gold-500/40'
                : 'bg-obsidian-800 text-gray-400 border-white/10'
            }`}
            title={soundEnabled ? 'Mute Celebration Sound' : 'Enable Celebration Sound'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-obsidian-800 hover:bg-obsidian-700 text-white border border-white/10 transition-all"
            title="Toggle TV Fullscreen (F11)"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Cinema Grid Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center z-10">
        {/* Left / Center Zone (7 cols on large screens): The Celebration Blast Area */}
        <div className="lg:col-span-7 flex flex-col justify-center items-center h-full min-h-[420px]">
          <CelebrationBanner spray={activeSpray} />
        </div>

        {/* Right Zone (5 cols on large screens): Top Ballers Leaderboard */}
        <div className="lg:col-span-5 h-[520px] max-h-[85vh]">
          <Leaderboard entries={leaderboard} currency={party.currency} />
        </div>
      </main>

      {/* Bottom Ticker & Scan Card */}
      <footer className="w-full px-6 py-3 border-t border-white/10 bg-obsidian-900/70 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
        {/* Left: Scan QR to Spray with Phone */}
        <div className="flex items-center gap-3 bg-obsidian-950/90 border border-gold-500/30 px-3.5 py-2 rounded-2xl shadow-lg">
          <div className="p-1 bg-white rounded-lg shadow shrink-0">
            <QRCodeSVG value={sprayUrl} size={52} level="M" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Scan Phone To Spray
              </span>
            </div>
            <p className="text-[10px] text-gold-400 font-mono truncate max-w-[220px]">
              {sprayUrl}
            </p>
          </div>
        </div>

        {/* Center: Live Mobile Indicator for Projector Guests */}
        <div className="text-center">
          <span className="text-xs text-gray-400">
            Smart Web3 Dance Floor • Instant Mobile Settlement • Powered by <strong className="text-white">Pollar</strong>
          </span>
        </div>

        {/* Right: Host Receiving Vault Tag */}
        <div className="hidden sm:flex items-center gap-2 text-right">
          <div className="text-[10px] text-gray-400">
            <span>Settling to Event Vault:</span>
            <code className="block text-gold-400 font-mono">{party.hostWallet}</code>
          </div>
        </div>
      </footer>
    </div>
  );
};
