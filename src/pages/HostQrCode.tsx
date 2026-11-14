import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, CheckCircle, Copy, Check, Download, 
  Share2, Tv, Smartphone, Wallet, Building, QrCode, Landmark 
} from 'lucide-react';
import { getHostUser, getParties, getPartyById, INITIAL_PARTIES, Party } from '../services/storage';

export const HostQrCode: React.FC = () => {
  const navigate = useNavigate();
  const host = getHostUser();
  const parties = getParties();

  const [activePartyId] = useState<string>(host?.activePartyId || parties[0]?.id || 'owambe-2026');
  const party: Party = getPartyById(activePartyId) || parties[0] || INITIAL_PARTIES[0];

  const [copied, setCopied] = useState<boolean>(false);

  const partySlug = party?.slug || party?.id || 'owambe-2026';
  const partyName = party?.name || 'Owambe Celebration';

  const sprayUrl = `${window.location.origin}/spray/${partySlug}`;
  const wallUrl = `${window.location.origin}/wall/${partySlug}`;

  const copySprayLink = () => {
    navigator.clipboard.writeText(sprayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-obsidian-950 text-white flex justify-center selection:bg-emerald-500 selection:text-black overflow-hidden font-sans">
      <div className="w-full max-w-md h-full flex flex-col bg-obsidian-950 sm:border-x sm:border-white/10 relative overflow-hidden">
        
        {/* Header */}
        <div className="shrink-0 px-4 py-3 bg-obsidian-900 border-b border-white/10 flex items-center justify-between">
          <button
            onClick={() => navigate('/host')}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white font-bold"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Dashboard</span>
          </button>

          <span className="text-xs font-black text-white font-display">
            Table QR Tent Card
          </span>

          <button
            onClick={() => window.open(wallUrl, '_blank')}
            className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-obsidian-950 font-bold flex items-center gap-1"
          >
            <Tv className="w-3 h-3" />
            <span>Open Wall</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-5 text-center min-h-0 overflow-y-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 mb-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Live Event QR Ready
          </span>

          <h2 className="text-lg font-black text-white font-display">
            {partyName}
          </h2>
          <p className="text-[11px] text-gray-400 mb-4 max-w-xs">
            Display at guest banquet tables to spray frictionless USDC on Stellar
          </p>

          {/* QR Card Container */}
          <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-emerald-900/40">
            <QRCodeSVG value={sprayUrl} size={190} level="H" includeMargin={false} />
          </div>

          {/* Link URL pill */}
          <div className="mt-4 px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-[11px] font-mono text-emerald-300 max-w-xs break-all select-all">
            {sprayUrl}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2.5 w-full mt-4 max-w-xs">
            <button
              onClick={copySprayLink}
              className="py-2.5 px-2 rounded-xl bg-obsidian-900 border border-white/10 text-[11px] font-bold text-white hover:border-emerald-500/50 flex flex-col items-center gap-1 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="py-2.5 px-2 rounded-xl bg-obsidian-900 border border-white/10 text-[11px] font-bold text-white hover:border-emerald-500/50 flex flex-col items-center gap-1 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print Tent</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: partyName, url: sprayUrl }).catch(() => {});
                } else {
                  copySprayLink();
                }
              }}
              className="py-2.5 px-2 rounded-xl bg-obsidian-900 border border-white/10 text-[11px] font-bold text-white hover:border-emerald-500/50 flex flex-col items-center gap-1 transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Share</span>
            </button>
          </div>

          {/* Quick launch test button */}
          <div className="mt-4 w-full max-w-xs">
            <button
              onClick={() => window.open(sprayUrl, '_blank')}
              className="w-full py-2.5 rounded-xl bg-obsidian-900 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/40 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Test Spray as Guest in New Tab</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <nav className="shrink-0 h-16 bg-obsidian-950 border-t border-white/10 flex items-center justify-around px-2 z-40">
          <button
            onClick={() => navigate('/host')}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-gray-400 hover:text-white transition-all"
          >
            <Wallet className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => navigate('/parties')}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-gray-400 hover:text-white transition-all"
          >
            <Building className="w-5 h-5" />
            <span>Parties</span>
          </button>

          <button
            onClick={() => navigate('/qr')}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-emerald-400 scale-105 transition-all"
          >
            <QrCode className="w-5 h-5" />
            <span>Table QR</span>
          </button>

          <button
            onClick={() => navigate('/bank')}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-gray-400 hover:text-white transition-all"
          >
            <Landmark className="w-5 h-5" />
            <span>My Bank</span>
          </button>
        </nav>

      </div>
    </div>
  );
};
