import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, QrCode, Tv, Share2, Copy, Check, 
  Building, CheckCircle, ArrowUpRight, Download, 
  Wallet, Landmark, Plus, ArrowRight, ShieldCheck, Smartphone 
} from 'lucide-react';
import { Party, Spray } from '../types';
import { 
  getHostUser, getParties, getPartyById, saveParty, 
  getPartySprays, resetAllStorageToClean, INITIAL_PARTIES, 
  hasCompletedOnboarding 
} from '../services/storage';
import { subscribeToPartyLiveSync } from '../services/channel';
import { fetchSpraysFromSupabase } from '../services/supabase';

export const HostDashboard: React.FC = () => {
  const navigate = useNavigate();

  // If first-time user, redirect to onboarding flow
  useEffect(() => {
    if (!hasCompletedOnboarding()) {
      navigate('/onboarding', { replace: true });
    }
  }, [navigate]);

  const host = getHostUser();
  const parties = getParties();

  const [activePartyId, setActivePartyId] = useState<string>(host?.activePartyId || parties[0]?.id || 'owambe-2026');
  const [party, setParty] = useState<Party>(() => getPartyById(activePartyId) || parties[0] || INITIAL_PARTIES[0]);
  const [sprays, setSprays] = useState<Spray[]>(() => getPartySprays(activePartyId));

  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const current = getPartyById(activePartyId) || parties[0] || INITIAL_PARTIES[0];
    setParty(current);
    setSprays(getPartySprays(activePartyId));

    // Sync from Supabase Cloud if online
    fetchSpraysFromSupabase(activePartyId).then((cloudSprays) => {
      if (cloudSprays && cloudSprays.length > 0) {
        setSprays((prev) => {
          const map = new Map();
          [...cloudSprays, ...prev].forEach((s) => map.set(s.id, s));
          return Array.from(map.values());
        });
      }
    });

    const unsubscribe = subscribeToPartyLiveSync(activePartyId, (newSpray) => {
      setSprays((prev) => [newSpray, ...prev.filter((s) => s.id !== newSpray.id)]);
      const refreshed = getPartyById(activePartyId);
      if (refreshed) setParty(refreshed);
    });

    return unsubscribe;
  }, [activePartyId]);

  const partySlug = party?.slug || party?.id || 'owambe-2026';
  const partyName = party?.name || 'Owambe Live Celebration';
  const totalSettled = party?.totalSettled ?? 0;
  const safeAccountNumber = String(party?.accountNumber || '9136447931');
  const safeBankName = party?.bankName || 'OPay Digital Bank';

  const sprayUrl = `${window.location.origin}/spray/${partySlug}`;
  const wallUrl = `${window.location.origin}/wall/${partySlug}`;

  const copySprayLink = () => {
    navigator.clipboard.writeText(sprayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportLedgerCsv = () => {
    if (sprays.length === 0) {
      alert('No sprays recorded yet tonight.');
      return;
    }
    const headers = 'ID,Guest Name,Amount USDC,Amount NGN,Time,Shoutout,Settled Bank\n';
    const rows = sprays
      .map(
        (s) =>
          `"${s.id}","${s.guestName.replace(/"/g, '""')}",${s.amount},${s.amount * 1650},"${s.timestamp}","${(
            s.shoutout || ''
          ).replace(/"/g, '""')}","${safeBankName}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `p-zeh-ledger-${partySlug}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-obsidian-950 text-white flex justify-center selection:bg-emerald-500 selection:text-black overflow-hidden font-sans">
      {/* 100% Viewport Height Mobile Container */}
      <div className="w-full max-w-md h-full flex flex-col bg-obsidian-950 sm:border-x sm:border-white/10 relative overflow-hidden">
        
        {/* ======================================================== */}
        {/* HOST DASHBOARD HEADER                                    */}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Top Emerald Green Auto-Settled Vault Card */}
          <div className="shrink-0 bg-gradient-to-b from-[#022c22] via-[#064e3b] to-[#022c22] px-5 pt-5 pb-4 rounded-b-[28px] shadow-xl border-b border-emerald-500/20 relative">
            
            {/* Event Name & Switcher */}
            <div className="flex items-center justify-between mb-2">
              <div 
                onClick={() => navigate('/parties')}
                className="flex items-center gap-1.5 cursor-pointer group"
              >
                <Building className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-xs font-bold text-emerald-100 group-hover:text-white truncate max-w-[210px]">
                  {partyName}
                </span>
                <span className="text-[9px] bg-emerald-900/90 px-1 py-0.2 rounded text-emerald-300 border border-emerald-500/30">
                  Switch
                </span>
              </div>

              <div 
                onClick={() => navigate('/bank')}
                className="w-7 h-7 rounded-full bg-emerald-950/70 border border-emerald-400/30 flex items-center justify-center text-xs font-bold text-emerald-300 cursor-pointer"
                title="Host Vault & Bank"
              >
                {host?.name ? host.name.charAt(0).toUpperCase() : 'I'}
              </div>
            </div>

            {/* Total Settled to Bank */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-200/80 text-[11px] font-medium">
                  <span>Total Settled to Bank</span>
                  <button 
                    onClick={() => setShowBalance(!showBalance)}
                    className="hover:text-white transition-colors"
                  >
                    {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/40">
                  Instant Auto-Offramp ✓
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-black text-white font-mono tracking-tight">
                  {showBalance ? `$${totalSettled.toLocaleString()}` : '••••••••'}
                </span>
                <span className="text-[11px] font-bold text-emerald-300 font-mono">
                  USDC
                </span>
              </div>

              <div className="text-[10px] text-emerald-300/90 font-medium truncate">
                {showBalance ? `≈ ₦${(totalSettled * 1650).toLocaleString()} credited directly to ${safeBankName}` : ''}
              </div>
            </div>

            {/* 4 Action Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-4 pt-1">
              {/* Bank Settlement Settings */}
              <button
                onClick={() => navigate('/bank')}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-11 h-11 rounded-full bg-white text-emerald-950 flex items-center justify-center font-bold shadow-md group-hover:scale-105 active:scale-95 transition-all">
                  <Landmark className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-100">
                  My Bank
                </span>
              </button>

              {/* Table QR Tent Card */}
              <button
                onClick={() => navigate('/qr')}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-11 h-11 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 active:scale-95 transition-all">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-100">
                  Table QR
                </span>
              </button>

              {/* Open Projector TV Wall */}
              <button
                onClick={() => window.open(wallUrl, '_blank')}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-11 h-11 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 active:scale-95 transition-all">
                  <Tv className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-100">
                  TV Wall
                </span>
              </button>

              {/* Export CSV Audit */}
              <button
                onClick={exportLedgerCsv}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-11 h-11 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 active:scale-95 transition-all">
                  <Download className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-100">
                  Export CSV
                </span>
              </button>
            </div>
          </div>

          {/* Scrollable Content: Settlement Destination & Transactions */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            
            {/* Linked Bank Account Card */}
            <div 
              onClick={() => navigate('/bank')}
              className="p-3 rounded-2xl bg-gradient-to-r from-obsidian-900 to-emerald-950/40 border border-emerald-500/20 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider block">
                    Auto-Offramp Destination
                  </span>
                  <h4 className="text-xs font-bold text-white">
                    {safeBankName} • {safeAccountNumber.slice(-4)}
                  </h4>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                Change <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-obsidian-900 border border-white/5">
                <span className="text-[10px] text-gray-400 block">Total Sprayers</span>
                <span className="text-base font-black text-white font-mono">
                  {party?.totalSprayers ?? sprays.length} Ballers
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-obsidian-900 border border-white/5">
                <span className="text-[10px] text-gray-400 block">Settlement Speed</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  Instant ⚡
                </span>
              </div>
            </div>

            {/* Quick Test Spray Pill */}
            <div className="p-2.5 rounded-xl bg-obsidian-900 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-gray-300 font-medium text-[11px]">Spray as guest from phone</span>
              </div>
              <button
                onClick={() => window.open(sprayUrl, '_blank')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold hover:bg-emerald-500 hover:text-obsidian-950 transition-all flex items-center gap-1"
              >
                <span>Spray Now</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* Transactions Title */}
            <div className="flex items-center justify-between pt-1">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                Real-Time Offramp Ledger
              </h3>
              <span className="text-[10px] text-gray-400 font-mono">
                {sprays.length} sprays
              </span>
            </div>

            {/* Transactions List */}
            <div className="space-y-2 pb-2">
              {sprays.length === 0 ? (
                <div className="p-6 rounded-2xl bg-obsidian-900/40 border border-dashed border-white/10 text-center space-y-2 my-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-base">
                    💸
                  </div>
                  <h4 className="text-xs font-bold text-white">No Sprays Yet Tonight</h4>
                  <p className="text-[10px] text-gray-400 max-w-[220px] mx-auto">
                    Your live offramp ledger will update in real time as soon as guests spray from their phones.
                  </p>
                  <button
                    onClick={() => navigate('/qr')}
                    className="mt-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold inline-flex items-center gap-1 hover:bg-emerald-500 hover:text-obsidian-950 transition-all"
                  >
                    <QrCode className="w-3 h-3" /> Display Table QR Card
                  </button>
                </div>
              ) : (
                sprays.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-2xl bg-obsidian-900/80 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                        {s.guestName ? s.guestName.charAt(0) : 'G'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate max-w-[170px]">
                          {s.guestName}
                        </h4>
                        <p className="text-[10px] text-gray-400 truncate max-w-[170px]">
                          {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • "{s.shoutout || 'Soft life!'}"
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-emerald-400 font-mono">
                        + ${s.amount?.toLocaleString()}
                      </span>
                      <span className="block text-[8px] text-emerald-300">
                        ✓ Settled to Bank
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* FOOTER NAVBAR (ALWAYS PINNED)                            */}
        {/* ======================================================== */}
        <nav className="shrink-0 h-16 bg-obsidian-950 border-t border-white/10 flex items-center justify-around px-2 z-40">
          <button
            onClick={() => navigate('/host')}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-emerald-400 scale-105 transition-all"
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
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-gray-400 hover:text-white transition-all"
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
