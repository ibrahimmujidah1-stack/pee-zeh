import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Eye, EyeOff, QrCode, Tv, Share2, Copy, Check, 
  Building, CheckCircle, ArrowUpRight, Download, 
  Wallet, Landmark, Plus, ArrowRight, Lock, Unlock,
  ScanFace, KeyRound, ShieldCheck
} from 'lucide-react';
import { Party, Spray } from '../types';
import { 
  getHostUser, getParties, getPartyById, saveParty, 
  getPartySprays, resetAllStorageToClean, INITIAL_PARTIES
} from '../services/storage';
import { subscribeToPartyLiveSync } from '../services/channel';
import { 
  verifyHostPin, setHostSecurityPin, authenticateWithBiometrics 
} from '../services/biometrics';
import { 
  resolveNigerianBankAccount, PRIMARY_NIGERIAN_BANKS, BankResolveResult 
} from '../services/bankVerification';
import { fetchSpraysFromSupabase } from '../services/supabase';

export const HostDashboard: React.FC = () => {
  const host = getHostUser();
  const parties = getParties();

  const [activePartyId, setActivePartyId] = useState<string>(host?.activePartyId || parties[0]?.id || 'owambe-2026');
  const [party, setParty] = useState<Party>(() => getPartyById(activePartyId) || parties[0] || INITIAL_PARTIES[0]);
  const [sprays, setSprays] = useState<Spray[]>(() => getPartySprays(activePartyId));

  const [activeTab, setActiveTab] = useState<'home' | 'parties' | 'qr' | 'settlement'>('home');
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Settlement settings
  const [bankName, setBankName] = useState<string>(party?.bankName || 'Guaranty Trust Bank (GTBank)');
  const [accountNumber, setAccountNumber] = useState<string>(party?.accountNumber || '0142859124');
  const [accountName, setAccountName] = useState<string>(party?.accountName || host?.name || 'Owambe Event Settlement');
  const [settlementUpdated, setSettlementUpdated] = useState<boolean>(false);

  // Live Bank Resolution State
  const [isCheckingBank, setIsCheckingBank] = useState<boolean>(false);
  const [bankCheckResult, setBankCheckResult] = useState<BankResolveResult | null>(null);

  // Auto-resolve bank account when 10 digits are typed or bank name changes
  useEffect(() => {
    const clean = accountNumber.trim().replace(/\D/g, '');
    if (clean.length === 10) {
      setIsCheckingBank(true);
      resolveNigerianBankAccount(clean, bankName).then((res) => {
        setIsCheckingBank(false);
        setBankCheckResult(res);
        if (res.valid && res.accountName) {
          setAccountName(res.accountName);
        }
      });
    } else {
      setBankCheckResult(null);
    }
  }, [accountNumber, bankName]);

  // Security Vault PIN & Face ID state
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(false);
  const [vaultPinInput, setVaultPinInput] = useState<string>('');
  const [vaultPinError, setVaultPinError] = useState<string | null>(null);

  // Create party modal
  const [showCreatePartyModal, setShowCreatePartyModal] = useState<boolean>(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newCelebrantName, setNewCelebrantName] = useState('');
  const [newVenue, setNewVenue] = useState('');

  useEffect(() => {
    const current = getPartyById(activePartyId) || parties[0] || INITIAL_PARTIES[0];
    setParty(current);
    setSprays(getPartySprays(activePartyId));
    if (current) {
      setBankName(current.bankName || 'Guaranty Trust Bank (GTBank)');
      setAccountNumber(current.accountNumber || '0142859124');
      setAccountName(current.accountName || host?.name || 'Owambe Event Settlement');
    }

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
  const safeAccountNumber = party?.accountNumber || '0142859124';
  const safeBankName = party?.bankName || 'Guaranty Trust Bank (GTBank)';

  const sprayUrl = `${window.location.origin}/spray/${partySlug}`;
  const wallUrl = `${window.location.origin}/wall/${partySlug}`;

  const copySprayLink = () => {
    navigator.clipboard.writeText(sprayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...party,
      bankName,
      accountNumber,
      accountName,
    };
    saveParty(updated);
    setParty(updated);
    setSettlementUpdated(true);
    setTimeout(() => setSettlementUpdated(false), 2000);
  };

  const handleCreateParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim() || !newCelebrantName.trim()) {
      alert('Please provide party title and celebrant name.');
      return;
    }

    const slug = newPartyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + `-${Date.now().toString().slice(-4)}`;

    const newParty: Party = {
      id: slug,
      slug,
      name: newPartyName.trim(),
      celebrantName: newCelebrantName.trim(),
      celebrantPhoto: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      hostId: host?.id || 'host-adeleke',
      hostName: host?.name || 'Babatunde Adeleke',
      hostWallet: 'GDQ5...STELLAR...' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      settlementType: 'bank',
      bankName: 'Guaranty Trust Bank (GTBank)',
      accountNumber: '0142859124',
      accountName: host?.name || 'Babatunde Adeleke',
      currency: 'USDC',
      targetAmount: 10000,
      totalSettled: 0,
      totalSprayers: 0,
      eventDate: 'Upcoming Celebration',
      venue: newVenue || 'Lagos, Nigeria',
      createdAt: new Date().toISOString(),
    };

    saveParty(newParty);
    setActivePartyId(newParty.id);
    setShowCreatePartyModal(false);
    setNewPartyName('');
    setNewCelebrantName('');
    setActiveTab('home');
  };

  return (
    <div className="fixed inset-0 bg-obsidian-950 text-white flex justify-center selection:bg-emerald-500 selection:text-black overflow-hidden">
      {/* 100% Viewport Height Mobile Container */}
      <div className="w-full max-w-md h-full flex flex-col bg-obsidian-950 sm:border-x sm:border-white/10 relative overflow-hidden">
        
        {/* ======================================================== */}
        {/* TAB 1: HOME (Instant Auto-Settled Dashboard)             */}
        {/* ======================================================== */}
        {activeTab === 'home' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Top Emerald Green Auto-Settled Vault Card */}
            <div className="shrink-0 bg-gradient-to-b from-[#022c22] via-[#064e3b] to-[#022c22] px-5 pt-5 pb-4 rounded-b-[28px] shadow-xl border-b border-emerald-500/20 relative">
              
              {/* Event Name & Switcher */}
              <div className="flex items-center justify-between mb-2">
                <div 
                  onClick={() => setActiveTab('parties')}
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

                <div className="w-7 h-7 rounded-full bg-emerald-950/70 border border-emerald-400/30 flex items-center justify-center text-xs font-bold text-emerald-300">
                  {host?.name ? host.name.charAt(0) : 'B'}
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

                <div className="text-[10px] text-emerald-300/90 font-medium">
                  {showBalance ? `≈ ₦${(totalSettled * 1650).toLocaleString()} credited directly to ${safeBankName}` : ''}
                </div>
              </div>

              {/* 4 Action Buttons */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-1">
                {/* Bank Settlement Settings */}
                <button
                  onClick={() => setActiveTab('settlement')}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-11 h-11 rounded-full bg-white text-emerald-950 flex items-center justify-center font-bold shadow-md group-hover:scale-105 active:scale-95 transition-all">
                    <Landmark className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-100">
                    My Bank
                  </span>
                </button>

                {/* Table QR */}
                <button
                  onClick={() => setActiveTab('qr')}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-11 h-11 rounded-full bg-emerald-900/80 border border-emerald-400/40 text-emerald-200 flex items-center justify-center font-bold shadow-md group-hover:scale-105 active:scale-95 transition-all">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-100">
                    Table QR
                  </span>
                </button>

                {/* Live Wall */}
                <a
                  href={wallUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-11 h-11 rounded-full bg-emerald-900/80 border border-emerald-400/40 text-emerald-200 flex items-center justify-center font-bold shadow-md group-hover:scale-105 active:scale-95 transition-all">
                    <Tv className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-100 flex items-center">
                    Live Wall
                  </span>
                </a>

                {/* Share Link */}
                <button
                  onClick={copySprayLink}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-11 h-11 rounded-full bg-emerald-900/80 border border-emerald-400/40 text-emerald-200 flex items-center justify-center font-bold shadow-md group-hover:scale-105 active:scale-95 transition-all">
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-100">
                    {copied ? 'Copied' : 'Share'}
                  </span>
                </button>
              </div>
            </div>

            {/* Scrollable Content: Settlement Destination & Transactions */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {/* Linked Bank Account Card */}
              <div 
                onClick={() => setActiveTab('settlement')}
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

              {/* Transactions Title */}
              <div className="flex items-center justify-between pt-1">
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                  Real-Time Offramp Ledger
                </h3>
                <span className="text-[10px] text-gray-400">
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
                      onClick={() => setActiveTab('qr')}
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
        )}

        {/* ======================================================== */}
        {/* TAB 2: QR CODE                                           */}
        {/* ======================================================== */}
        {activeTab === 'qr' && (
          <div className="flex-1 flex flex-col items-center justify-center p-5 text-center min-h-0 overflow-y-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 mb-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Your QR code is ready
            </span>
            <h2 className="text-lg font-black text-white font-display">
              {partyName}
            </h2>
            <p className="text-[11px] text-gray-400 mb-4 max-w-xs">
              Display at tables or on projector to spray with Pollar
            </p>

            <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-emerald-900/40">
              <QRCodeSVG value={sprayUrl} size={180} level="H" includeMargin={false} />
            </div>

            <div className="mt-4 px-3 py-1.5 rounded-xl bg-obsidian-900 border border-white/10 text-[11px] font-mono text-emerald-300 max-w-xs break-all select-all">
              {sprayUrl}
            </div>

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
                <span>Print Card</span>
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
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PARTIES                                           */}
        {/* ======================================================== */}
        {activeTab === 'parties' && (
          <div className="flex-1 flex flex-col p-4 min-h-0">
            <div className="shrink-0 flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-black text-white font-display">
                  My Owambe Parties
                </h2>
                <p className="text-[11px] text-gray-400">
                  Switch or create party
                </p>
              </div>

              <button
                onClick={() => setShowCreatePartyModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-obsidian-950 font-black text-[11px] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                New Party
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
              {parties.map((p) => {
                const isSelected = p.id === activePartyId;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActivePartyId(p.id);
                      setActiveTab('home');
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-950/60 to-obsidian-900 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                        : 'bg-obsidian-900 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.celebrantPhoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'}
                        alt={p.celebrantName || 'Celebrants'}
                        className="w-10 h-10 rounded-xl object-cover border border-emerald-400/40"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white truncate">
                            {p.name}
                          </h4>
                          {isSelected && (
                            <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-400 text-obsidian-950 font-black">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 truncate">
                          {p.celebrantName} • Auto-settles to {p.bankName || 'GTBank'}
                        </p>
                        <div className="mt-0.5 text-[10px] text-emerald-400 font-mono">
                          Total Settled: ${(p.totalSettled ?? 0).toLocaleString()} USDC
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SETTLEMENT BANK ACCOUNT SETTINGS                  */}
        {/* ======================================================== */}
        {activeTab === 'settlement' && (
          <div className="flex-1 flex flex-col p-4 min-h-0 overflow-y-auto">
            {!isVaultUnlocked ? (
              /* Security Vault Lock Screen */
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4 animate-fade-in my-auto">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20">
                  <Lock className="w-8 h-8" />
                </div>

                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider inline-block mb-1 border border-emerald-500/30">
                    Host Vault Protected
                  </span>
                  <h2 className="text-lg font-black text-white font-display">
                    Bank Settlement Vault
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    Authenticate with Face ID or enter your 4-digit Host PIN to access and update your Nigerian bank payout account.
                  </p>
                </div>

                {/* 4-digit PIN form */}
                <div className="w-full max-w-xs space-y-3 pt-2">
                  <div>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={vaultPinInput}
                      onChange={(e) => {
                        setVaultPinInput(e.target.value);
                        setVaultPinError(null);
                      }}
                      className="w-36 mx-auto text-center tracking-[0.5em] text-2xl font-mono px-4 py-2.5 rounded-2xl bg-obsidian-900 border border-white/20 text-white focus:outline-none focus:border-emerald-400"
                    />
                    {vaultPinError && (
                      <p className="text-[11px] text-red-400 font-semibold mt-1.5">
                        {vaultPinError}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (verifyHostPin(vaultPinInput || '1234')) {
                        setIsVaultUnlocked(true);
                        setVaultPinError(null);
                      } else {
                        setVaultPinError('Incorrect PIN. Default is 1234.');
                      }
                    }}
                    className="w-full py-3 rounded-2xl bg-emerald-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Unlock Vault with PIN</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const res = await authenticateWithBiometrics(host?.name || 'Host');
                      if (res.success) {
                        setIsVaultUnlocked(true);
                      }
                    }}
                    className="w-full py-2.5 rounded-2xl bg-obsidian-900 border border-white/10 text-white hover:border-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <ScanFace className="w-4 h-4 text-emerald-400" />
                    <span>Unlock with Face ID / Passkey</span>
                  </button>

                  <p className="text-[10px] text-gray-500">
                    Default PIN for testing: <strong className="text-gray-300 font-mono">1234</strong>
                  </p>
                </div>
              </div>
            ) : (
              /* Unlocked Settlement Bank Account Form */
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider inline-block mb-1">
                      Vault Unlocked
                    </span>
                    <h2 className="text-base font-black text-white font-display">
                      Settlement Bank Account
                    </h2>
                  </div>

                  <button
                    onClick={() => {
                      setIsVaultUnlocked(false);
                      setVaultPinInput('');
                    }}
                    className="px-2.5 py-1 rounded-xl bg-obsidian-900 border border-white/10 text-gray-400 hover:text-white text-[10px] font-bold flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>Lock Vault</span>
                  </button>
                </div>

                <p className="text-[11px] text-gray-400 mb-3">
                  All guest sprays are automatically converted and deposited here in real time.
                </p>

                <form onSubmit={handleUpdateSettlement} className="space-y-3">
                  {settlementUpdated && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Bank details saved successfully!
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-gray-300 block mb-1">
                      Nigerian Bank
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      {PRIMARY_NIGERIAN_BANKS.map((b) => (
                        <option key={b.code} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-gray-300">
                        Account Number (10 Digits)
                      </label>
                      {isCheckingBank && (
                        <span className="text-[9px] text-amber-400 flex items-center gap-1 font-mono">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" /> Checking NIBSS...
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={10}
                      required
                      placeholder="e.g. 0142859124"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />

                    {/* Live Check Result Badge */}
                    {bankCheckResult && (
                      <div className={`mt-1.5 p-2 rounded-xl text-[10px] flex items-center justify-between ${
                        bankCheckResult.valid 
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                          : 'bg-red-500/10 border border-red-500/30 text-red-400'
                      }`}>
                        <div className="flex items-center gap-1.5 truncate">
                          {bankCheckResult.valid ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                          <span className="truncate font-semibold">
                            {bankCheckResult.valid 
                              ? `Live Name: ${bankCheckResult.accountName}` 
                              : bankCheckResult.error}
                          </span>
                        </div>
                        {bankCheckResult.valid && (
                          <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-400 text-obsidian-950 font-black uppercase shrink-0">
                            NIBSS Match
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-300 block mb-1">
                      Account Name (Auto-Resolved)
                    </label>
                    <input
                      type="text"
                      required
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-obsidian-900/60 border border-white/5 text-[10px] text-gray-400 space-y-1">
                    <span className="font-bold text-gray-300 block">How Auto-Settlement Works:</span>
                    <p>When Chief sprays USDC on Stellar, Pollar's automated off-ramp triggers an instant NGN transfer directly to this bank account.</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all"
                  >
                    Save Bank Details
                  </button>

                  <div className="pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Clear all local demo data and restart with a clean slate?')) {
                          resetAllStorageToClean();
                          window.location.reload();
                        }
                      }}
                      className="w-full py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-bold text-[10px] transition-all"
                    >
                      Clear All Demo Data & Reset Clean
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* FOOTER NAVBAR (ALWAYS PINNED)                            */}
        {/* ======================================================== */}
        <nav className="shrink-0 h-16 bg-obsidian-950 border-t border-white/10 flex items-center justify-around px-2 z-40">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all ${
              activeTab === 'home' ? 'text-emerald-400 scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab('parties')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all ${
              activeTab === 'parties' ? 'text-emerald-400 scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Building className="w-5 h-5" />
            <span>Parties</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all ${
              activeTab === 'qr' ? 'text-emerald-400 scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>Table QR</span>
          </button>

          <button
            onClick={() => setActiveTab('settlement')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition-all ${
              activeTab === 'settlement' ? 'text-emerald-400 scale-105' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Landmark className="w-5 h-5" />
            <span>My Bank</span>
          </button>
        </nav>
      </div>

      {/* CREATE PARTY MODAL */}
      {showCreatePartyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-obsidian-900 border border-white/10 p-5 shadow-2xl relative">
            <button
              onClick={() => setShowCreatePartyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-base font-bold"
            >
              ✕
            </button>

            <form onSubmit={handleCreateParty} className="space-y-3">
              <h3 className="text-base font-black text-white font-display">
                Create Owambe Celebration
              </h3>

              <div>
                <label className="text-[10px] font-bold text-gray-300 block mb-1">
                  Party Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Adeleke Coronation 2026"
                  value={newPartyName}
                  onChange={(e) => setNewPartyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-300 block mb-1">
                  Celebrant Name(s)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High Chief Adeleke"
                  value={newCelebrantName}
                  onChange={(e) => setNewCelebrantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-300 block mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eko Hotel, Lagos"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-md shadow-gold-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all"
              >
                Create Party & Get QR Code
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
