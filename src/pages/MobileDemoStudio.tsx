import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, RotateCcw, Download, Sparkles, Smartphone, 
  Tv, Landmark, ShieldCheck, CheckCircle, ArrowRight, Video, 
  Volume2, VolumeX, FastForward 
} from 'lucide-react';
import { Onboarding } from './Onboarding';
import { HostDashboard } from './HostDashboard';
import { HostBankSettlement } from './HostBankSettlement';
import { HostQrCode } from './HostQrCode';
import { GuestSprayPad } from './GuestSprayPad';
import { ProjectorWall } from './ProjectorWall';

interface DemoScene {
  id: number;
  title: string;
  durationSec: number;
  route: string;
  badge: string;
  subtitle: string;
  narration: string;
}

const DEMO_SCENES: DemoScene[] = [
  {
    id: 1,
    title: 'The Owambe Problem & Cultural Context',
    durationSec: 25,
    route: '/onboarding',
    badge: '1. CULTURAL PROBLEM',
    subtitle: 'Why Nigerian Owambe parties urgently need p-zeh',
    narration: 'In Nigerian culture, spraying cash at weddings and parties is the ultimate expression of joy. But billions of physical Naira get stolen on the dance floor, notes get torn and dirty, and diaspora family in London, Houston, and Atlanta are completely locked out. p-zeh digitizes the dance floor.',
  },
  {
    id: 2,
    title: 'Host Onboarding & Custom Security PIN',
    durationSec: 35,
    route: '/onboarding',
    badge: '2. HOST ONBOARDING',
    subtitle: 'Setting up celebration details & 4-digit security PIN',
    narration: 'The host sets up in under 60 seconds. They enter celebration details and set their own private 4-digit security PIN and biometric Face ID to protect the payout vault. No hardcoded demo PINs — production-grade security.',
  },
  {
    id: 3,
    title: 'Live NIBSS Bank Account Check (OPay)',
    durationSec: 30,
    route: '/onboarding',
    badge: '3. BANK RESOLUTION',
    subtitle: 'Auto-resolving account 9136447931 to IBRAHIM MUJIDAH',
    narration: 'When the host enters their 10-digit OPay account number 9136447931, p-zeh’s automated NIBSS resolver instantly validates the account and verifies the account holder name, Ibrahim Mujidah. Real bank verification, ready for instant settlement.',
  },
  {
    id: 4,
    title: 'Table QR Tent Card Distribution',
    durationSec: 25,
    route: '/qr',
    badge: '4. TABLE QR CARDS',
    subtitle: 'High-res QR tent cards printed for banquet tables',
    narration: 'From the Table QR tab, the host generates high-resolution QR tent cards for guest dining tables. Guests simply point their phone camera at the QR code, opening their mobile spray pad instantly with zero app download required.',
  },
  {
    id: 5,
    title: 'Guest Mobile Spray Pad & Pollar Integration',
    durationSec: 40,
    route: '/spray/owambe-2026',
    badge: '5. GUEST SPRAY PAD',
    subtitle: 'Selecting Otunba Baller ($50) & 1-click Google Sign-in',
    narration: 'On the guest mobile phone, guests pick a tier like Otunba Baller ($50), type a shoutout like "Soft life forever! 🥂", and sign in with Google via Pollar. Zero seed phrases, zero gas tokens, and zero crypto confusion.',
  },
  {
    id: 6,
    title: 'Stellar Blockchain Sub-Second Settlement',
    durationSec: 25,
    route: '/spray/owambe-2026',
    badge: '6. ON-CHAIN RAILS',
    subtitle: 'Cryptographic proof on Stellar Horizon Testnet',
    narration: 'Every spray executes on the Stellar Horizon blockchain network. Real value moves with sub-second finality and near-zero network fees, providing an immutable cryptographic transaction hash for every dollar sprayed.',
  },
  {
    id: 7,
    title: 'Venue Projector TV Wall Celebration',
    durationSec: 35,
    route: '/wall/owambe-2026',
    badge: '7. PROJECTOR TV WALL',
    subtitle: 'Afrobeats fanfare, falling Naira cascade & live leaderboard',
    narration: 'Instantly, the big TV projector wall explodes! Afrobeats brass fanfares play, Nigerian 1000 Naira notes and dollar bills rain down, and the Otunba Baller shoutout shines on screen as the Top Ballers Tonight leaderboard shifts live.',
  },
  {
    id: 8,
    title: 'Instant Bank Auto-Settlement & Audit Ledger',
    durationSec: 30,
    route: '/host',
    badge: '8. AUTO-OFFRAMP VAULT',
    subtitle: 'Instant NGN deposit to OPay + CSV audit download',
    narration: 'Back in the Host Dashboard, the money is already there! Pollar’s automated off-ramp converts and credits the NGN equivalent directly to the host’s verified OPay account in real time. The host can export the full CSV audit ledger with one tap.',
  },
];

export const MobileDemoStudio: React.FC = () => {
  const navigate = useNavigate();
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const scene = DEMO_SCENES[currentSceneIdx];
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (currentSceneIdx < DEMO_SCENES.length - 1) {
          setCurrentSceneIdx((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, scene.durationSec * 1000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentSceneIdx, scene.durationSec]);

  // Browser Screen Recording handler
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: true,
      });
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `p-zeh-mobile-demo-recording.webm`;
        a.click();
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
      setIsPlaying(true);
      setCurrentSceneIdx(0);
    } catch (err) {
      console.warn('Screen recording cancelled or not supported:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-white flex flex-col font-sans select-none">
      
      {/* Top Studio Control Bar */}
      <header className="shrink-0 bg-obsidian-900 border-b border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/host')}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white font-bold"
          >
            <span>← Dashboard</span>
          </button>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500 text-obsidian-950 font-black text-[10px] uppercase">
              Mobile Demo Studio
            </span>
            <span className="text-xs font-bold text-white hidden sm:inline">
              Full 4-Minute Vertical Mobile Walkthrough (9:16)
            </span>
          </div>
        </div>

        {/* Studio Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-xl bg-obsidian-800 border border-white/20 hover:border-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isPlaying ? 'Pause Demo' : 'Auto-Play Walkthrough'}</span>
          </button>

          <button
            onClick={() => {
              setCurrentSceneIdx(0);
              setIsPlaying(false);
            }}
            className="p-1.5 rounded-xl bg-obsidian-800 border border-white/10 hover:border-white/30 text-gray-300"
            title="Restart from Beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Record WebM / MP4</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-obsidian-950 text-xs font-black flex items-center gap-1.5 animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>Stop & Save Video</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Studio Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8 gap-6 overflow-hidden">
        
        {/* ======================================================== */}
        {/* LEFT / CENTER: SMARTPHONE HARDWARE CHASSIS (9:16)        */}
        {/* ======================================================== */}
        <div className="relative shrink-0 flex items-center justify-center">
          
          {/* Ambient Glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 via-yellow-500/10 to-emerald-600/20 rounded-[50px] blur-2xl opacity-75 pointer-events-none" />

          {/* Smartphone Frame (390 x 844 iPhone Viewport) */}
          <div className="w-[360px] sm:w-[390px] h-[720px] sm:h-[780px] bg-obsidian-950 rounded-[44px] border-[8px] border-obsidian-800 shadow-2xl relative flex flex-col overflow-hidden ring-1 ring-white/10">
            
            {/* Dynamic Island / Speaker Notch */}
            <div className="shrink-0 h-6 bg-transparent flex items-center justify-center z-50 pt-1 pointer-events-none">
              <div className="w-24 h-4 bg-black rounded-full border border-white/10 flex items-center justify-end px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Inner Mobile Screen Content (Swaps smoothly based on Scene) */}
            <div className="flex-1 relative overflow-hidden bg-obsidian-950 flex flex-col">
              {scene.id === 1 && (
                /* Scene 1: The Cultural Problem */
                <div className="flex-1 p-5 flex flex-col justify-center items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-3xl">
                    🍾
                  </div>
                  <div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider inline-block mb-2">
                      The Cultural Problem
                    </span>
                    <h2 className="text-xl font-black text-white font-display">
                      Owambe Money Spraying
                    </h2>
                    <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                      Spraying cash is Nigerian culture, but physical banknotes bring huge problems:
                    </p>
                  </div>
                  <div className="w-full space-y-2 text-left">
                    <div className="p-2.5 rounded-xl bg-obsidian-900 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                      <span>⚠️</span> <span>Dance floor theft & lost cash</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-obsidian-900 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                      <span>⚠️</span> <span>Dirty, torn notes & 4hr counting fatigue</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-obsidian-900 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                      <span>⚠️</span> <span>Diaspora in US & UK completely excluded</span>
                    </div>
                  </div>
                  <div className="w-full p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    ✓ The Solution: p-zeh on Stellar + Pollar Rails
                  </div>
                </div>
              )}

              {(scene.id === 2 || scene.id === 3) && (
                /* Scene 2 & 3: Host Onboarding & Bank Resolution */
                <div className="flex-1 overflow-y-auto">
                  <Onboarding />
                </div>
              )}

              {scene.id === 4 && (
                /* Scene 4: Table QR Card */
                <div className="flex-1 overflow-y-auto">
                  <HostQrCode />
                </div>
              )}

              {(scene.id === 5 || scene.id === 6) && (
                /* Scene 5 & 6: Guest Spray Pad & Stellar Rails */
                <div className="flex-1 overflow-y-auto">
                  <GuestSprayPad />
                </div>
              )}

              {scene.id === 7 && (
                /* Scene 7: Projector TV Wall Celebration */
                <div className="flex-1 overflow-y-auto">
                  <ProjectorWall />
                </div>
              )}

              {scene.id === 8 && (
                /* Scene 8: Host Dashboard & Auto-Offramp */
                <div className="flex-1 overflow-y-auto">
                  <HostDashboard />
                </div>
              )}
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="shrink-0 h-4 bg-obsidian-950 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-1 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT: STORYBOARD & LIVE NARRATION CAPTIONS             */}
        {/* ======================================================== */}
        <div className="flex-1 max-w-xl flex flex-col justify-between space-y-4">
          
          {/* Current Scene Header */}
          <div className="p-4 rounded-3xl bg-obsidian-900 border border-white/10 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-wider border border-emerald-500/30">
                {scene.badge}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Scene {scene.id} of {DEMO_SCENES.length} • {scene.durationSec}s
              </span>
            </div>

            <h3 className="text-base font-black text-white font-display">
              {scene.title}
            </h3>
            <p className="text-xs text-gray-300 font-medium">
              {scene.subtitle}
            </p>

            {/* Subtitle / Script Box */}
            <div className="mt-3 p-3.5 rounded-2xl bg-obsidian-950 border border-emerald-500/30 text-xs text-emerald-100 leading-relaxed font-sans relative">
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">
                <Volume2 className="w-3 h-3" />
                <span>Voiceover Script & Narration:</span>
              </div>
              "{scene.narration}"
            </div>
          </div>

          {/* Interactive Scene Selector Timeline */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Timeline Navigation (Jump to Scene)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEMO_SCENES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentSceneIdx(idx);
                    setIsPlaying(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    idx === currentSceneIdx
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md shadow-emerald-500/10'
                      : 'bg-obsidian-900 border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="text-[9px] font-mono text-emerald-400 block font-bold">
                    0{s.id}. {s.durationSec}s
                  </span>
                  <span className="text-[11px] font-bold truncate block">
                    {s.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Submission Checklist Info Box */}
          <div className="p-3.5 rounded-2xl bg-obsidian-900/60 border border-white/5 text-xs text-gray-400 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-white font-bold block text-[11px]">Ready for Boundless & Pollar Hackathon Submission</span>
              <p className="text-[10px] text-gray-400">Vertical 9:16 mobile format covers Problem, Onboarding, Stellar Rails, Wall, and Auto-Offramp.</p>
            </div>
            <a
              href="https://pee-zeh.web.app/onboarding"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold shrink-0 transition-all"
            >
              Open Live App ↗
            </a>
          </div>

        </div>

      </div>

    </div>
  );
};
