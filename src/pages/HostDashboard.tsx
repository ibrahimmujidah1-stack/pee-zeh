import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, QrCode, Tv, Share2, Copy, Check, 
  Building, CheckCircle, ArrowUpRight, Download, 
  Wallet, Landmark, Plus, ArrowRight, ShieldCheck, Smartphone, X 
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

  // Modals
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newPartyName, setNewPartyName] = useState<string>('');
  const [newCelebrantName, setNewCelebrantName] = useState<string>('');
  const [newVenue, setNewVenue] = useState<string>('');

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

  const partyCodeDisplay = party?.partyCode || partySlug.toUpperCase();
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `🍾 Spray the celebrants on the live Owambe dance floor! Join here: ${sprayUrl} (Party Code: ${partyCodeDisplay}) 💸`
  )}`;

  const handleCreateNewParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim() || !newCelebrantName.trim()) {
      alert('Please provide party title and celebrant name.');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = newPartyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + `-${randomSuffix}`;
    const code = 'OWAMBE-' + randomSuffix;

    const newParty: Party = {
      id: slug,
      slug,
      partyCode: code,
      name: newPartyName.trim(),
      celebrantName: newCelebrantName.trim(),
      celebrantPhoto: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      hostId: host?.id || 'host-user',
      hostName: host?.name || 'Ibrahim Mujidah',
      hostWallet: 'GDQ5BL7R3X7V2TOWAMBEPZEHSTELLARKEMI9HQY37XZGNR2S7VWP',
      settlementType: 'bank',
      bankName: party?.bankName || 'OPay Digital Bank (PayCom)',
      accountNumber: party?.accountNumber || '9136447934',
      accountName: party?.accountName || 'ADELEKE TUNDE SULAIMAN',
      currency: 'USDC',
      targetAmount: 10000,
      totalSettled: 0,
      totalSprayers: 0,
      eventDate: 'Tonight • Lagos, Nigeria',
      venue: newVenue.trim() || 'Grand Ballroom, Lagos',
      createdAt: new Date().toISOString(),
    };

    saveParty(newParty);
    if (host) {
      host.activePartyId = newParty.id;
    }
    setActivePartyId(newParty.id);
    setParty(newParty);
    setShowCreateModal(false);
    setNewPartyName('');
    setNewCelebrantName('');
    setNewVenue('');
  };

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

            {/* 5 Action Buttons */}
            <div className="grid grid-cols-5 gap-1.5 mt-4 pt-1">
              {/* Share Party Link */}
              <button
                onClick={() => setShowShareModal(true)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-400 text-obsidian-950 flex items-center justify-center font-bold shadow-md group-hover:scale-105 active:scale-95 transition-all">
                  <Share2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-[9px] font-bold text-emerald-100">
                  Share
                </span>
              </button>

              {/* Bank Settlement Settings */}
              <button
                onClick={() => navigate('/bank')}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-white text-emerald-950 flex items-center justify-center font-bold shadow-md group-hover:scale-105 active:scale-95 transition-all">
                  <Landmark className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="text-[9px] font-semibold text-emerald-100">
                  My Bank
                </span>
              </button>

              {/* Table QR Tent Card */}
              <button
                onClick={() => navigate('/qr')}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 active:scale-95 transition-all">
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-semibold text-emerald-100">
                  Table QR
                </span>
              </button>

              {/* Open Projector TV Wall */}
              <button
                onClick={() => window.open(wallUrl, '_blank')}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 active:scale-95 transition-all">
                  <Tv className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-semibold text-emerald-100">
                  TV Wall
                </span>
              </button>

              {/* Create New Party */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 active:scale-95 transition-all">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-semibold text-emerald-100">
                  + Event
                </span>
              </button>
            </div>
          </div>

          {/* Scrollable Content: Settlement Destination & Transactions */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            
            {/* Quick Share Banner with Unique Party Code */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-obsidian-900 border border-emerald-500/30 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Party Code:</span>
                  <span className="text-xs font-mono font-black text-emerald-400 tracking-wider">
                    {partyCodeDisplay}
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 truncate">
                  Guests join instantly with this code or your link
                </p>
              </div>

              <button
                onClick={() => setShowShareModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-obsidian-950 font-black text-[10px] uppercase tracking-wider shadow-sm hover:bg-emerald-400 active:scale-95 transition-all flex items-center gap-1 shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </button>
            </div>
            
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
        {/* SHARE PARTY LINK MODAL                                   */}
        {/* ======================================================== */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-obsidian-900 border border-emerald-500/30 p-5 space-y-4 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍾</span>
                  <div>
                    <h3 className="text-sm font-black text-white font-display">Share Owambe Link</h3>
                    <p className="text-[10px] text-gray-400">{partyName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-7 h-7 rounded-full bg-white/10 text-gray-300 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Unique Party Code Display */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Unique Party Code
                </span>
                <div className="text-2xl font-black font-mono tracking-widest text-emerald-300">
                  {partyCodeDisplay}
                </div>
                <p className="text-[10px] text-gray-300">
                  Guests can enter this code directly on the home page to start spraying
                </p>
              </div>

              {/* Direct Guest Spray Pad Link & Copy */}
              <div>
                <label className="text-[10px] font-bold text-gray-300 block mb-1">
                  Direct Guest Spray Pad Link
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={sprayUrl}
                    className="flex-1 px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-white font-mono text-[11px] truncate"
                  />
                  <button
                    onClick={copySprayLink}
                    className="px-3 py-2 rounded-xl bg-emerald-500 text-obsidian-950 font-black text-xs flex items-center gap-1 shrink-0 hover:bg-emerald-400 active:scale-95 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* 1-Tap WhatsApp Share Button */}
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-[#25D366] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-green-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Share via WhatsApp</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              {/* Table QR Tent Card Shortcut */}
              <button
                type="button"
                onClick={() => {
                  setShowShareModal(false);
                  navigate('/qr');
                }}
                className="w-full py-2.5 rounded-2xl bg-obsidian-950 border border-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>View & Print Table QR Tent Cards</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CREATE NEW EVENT MODAL                                   */}
        {/* ======================================================== */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-obsidian-900 border border-white/10 p-5 space-y-4 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎉</span>
                  <h3 className="text-sm font-black text-white font-display">Create New Owambe Party</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-7 h-7 rounded-full bg-white/10 text-gray-300 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-400">
                Host a new celebration. All guest sprays will settle directly into your verified bank account.
              </p>

              <form onSubmit={handleCreateNewParty} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-300 block mb-1">
                    Owambe Event Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chief Adeleke Coronation Gala"
                    value={newPartyName}
                    onChange={(e) => setNewPartyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-300 block mb-1">
                    Celebrant Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. High Chief & Yeye Adeleke"
                    value={newCelebrantName}
                    onChange={(e) => setNewCelebrantName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-300 block mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eko Hotel Grand Ballroom, Lagos"
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[10px] text-emerald-300">
                  ✓ <strong>Settlement Protected:</strong> Linked to your verified {safeBankName} account.
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="py-2.5 px-4 rounded-xl bg-obsidian-950 border border-white/10 text-gray-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-95 transition-all"
                  >
                    Launch Celebration 🚀
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
