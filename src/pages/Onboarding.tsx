import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ShieldCheck, Lock, Landmark, CheckCircle, 
  ArrowRight, ScanFace, ChevronRight, PartyPopper, Check, AlertCircle,
  Coins, Smartphone, CreditCard, X, Users
} from 'lucide-react';
import { 
  saveHostUser, getHostUser, saveParty, setOnboardingCompleted, 
  getParties, HostUser, Party 
} from '../services/storage';
import { setHostSecurityPin, authenticateWithBiometrics } from '../services/biometrics';
import { resolveNigerianBankAccount, PRIMARY_NIGERIAN_BANKS, BankResolveResult } from '../services/bankVerification';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const existingHost = getHostUser();

  // Step 1: Image 2-style Lime Hero, Step 2: Party Details, Step 3: PIN Setup, Step 4: Bank Account
  const [currentStep, setCurrentStep] = useState<number>(1);
  const parties = getParties();

  // Join Existing Party Modal
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [joinPartyCode, setJoinPartyCode] = useState<string>('OWAMBE-2026');
  const [joinError, setJoinError] = useState<string | null>(null);

  // Form State
  const [hostName, setHostName] = useState<string>(existingHost?.name && existingHost.name !== 'Owambe Host' ? existingHost.name : 'Ibrahim Mujidah');
  const [partyName, setPartyName] = useState<string>('Coronation & Owambe Celebration 2026');
  const [celebrantName, setCelebrantName] = useState<string>('High Chief Adeleke');
  const [venue, setVenue] = useState<string>('Grand Ballroom, Lagos');

  // Security PIN
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(false);

  // Settlement Bank
  const [bankName, setBankName] = useState<string>('OPay Digital Bank (PayCom)');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [isCheckingBank, setIsCheckingBank] = useState<boolean>(false);
  const [bankResult, setBankResult] = useState<BankResolveResult | null>(null);

  // Auto-resolve account name whenever 10 digits are typed
  useEffect(() => {
    const clean = accountNumber.trim().replace(/\D/g, '');
    if (clean.length === 10) {
      setIsCheckingBank(true);
      resolveNigerianBankAccount(clean, bankName).then((res) => {
        setIsCheckingBank(false);
        setBankResult(res);
        if (res.valid && res.accountName) {
          setAccountName(res.accountName);
        }
      });
    } else {
      setBankResult(null);
    }
  }, [accountNumber, bankName]);

  const handleSetPinSubmit = () => {
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setPinError('PIN must be exactly 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setPinError('PINs do not match. Please verify.');
      return;
    }
    setHostSecurityPin(pin);
    setPinError(null);
    setCurrentStep(4);
  };

  const handleFinishOnboarding = () => {
    const updatedHost: HostUser = {
      id: 'host-' + Date.now().toString(36),
      name: hostName.trim() || 'Ibrahim Mujidah',
      email: `${(hostName.trim() || 'host').toLowerCase().replace(/\s+/g, '.')}@p-zeh.xyz`,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      activePartyId: 'owambe-2026',
    };
    saveHostUser(updatedHost);

    if (pin && pin.length === 4) {
      setHostSecurityPin(pin);
    }

    const cleanAcc = accountNumber.trim().replace(/\D/g, '');
    if (cleanAcc.length !== 10) {
      alert('Please enter a valid 10-digit Nigerian bank account number.');
      return;
    }

    const cleanName = accountName.trim() || hostName.trim().toUpperCase() || 'HOST SETTLEMENT';

    const updatedParty: Party = {
      id: 'owambe-2026',
      slug: 'owambe-2026',
      partyCode: 'OWAMBE-2026',
      name: partyName.trim() || 'Coronation & Owambe Celebration 2026',
      celebrantName: celebrantName.trim() || 'High Chief Adeleke',
      celebrantPhoto: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      hostId: updatedHost.id,
      hostName: updatedHost.name,
      hostWallet: 'GDQ5BL7R3X7V2TOWAMBEPZEHSTELLARKEMI9HQY37XZGNR2S7VWP',
      settlementType: 'bank',
      bankName: bankName || 'OPay Digital Bank (PayCom)',
      accountNumber: cleanAcc,
      accountName: cleanName,
      currency: 'USDC',
      targetAmount: 10000,
      totalSettled: 0,
      totalSprayers: 0,
      eventDate: 'Tonight • Lagos, Nigeria',
      venue: venue.trim() || 'Grand Ballroom, Lagos',
      createdAt: new Date().toISOString(),
    };
    saveParty(updatedParty);

    setOnboardingCompleted(true);
    navigate('/host', { replace: true });
  };

  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col justify-center items-center p-3 sm:p-4 select-none">
      
      {/* ======================================================== */}
      {/* STEP 1: VIBRANT LIME-GREEN HERO SCREEN (MODELED AFTER IMG 2) */}
      {/* ======================================================== */}
      {currentStep === 1 && (
        <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#a3e635] via-[#84cc16] to-[#65a30d] text-obsidian-950 rounded-[44px] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[680px] border-4 border-[#bef264]/40 animate-fade-in">
          
          {/* Top Brand Header */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-obsidian-950 text-white flex items-center justify-center font-black text-base shadow-md">
                🍾
              </div>
              <span className="text-xl font-black tracking-tight text-obsidian-950 font-display">
                p-zeh
              </span>
            </div>

            <span className="px-3 py-1 rounded-full bg-obsidian-950/15 border border-obsidian-950/20 text-obsidian-950 font-black text-[10px] uppercase tracking-wider backdrop-blur-sm">
              Owambe Live Pay
            </span>
          </div>

          {/* Floating Coins & 3D Cards Centerpiece */}
          <div className="relative my-auto py-8 flex flex-col items-center justify-center">
            
            {/* Floating Currency Badges */}
            <div className="absolute top-2 left-6 w-9 h-9 rounded-full bg-yellow-400 text-yellow-950 font-black text-sm flex items-center justify-center shadow-lg shadow-yellow-500/40 animate-bounce">
              $
            </div>
            <div className="absolute top-6 right-6 w-9 h-9 rounded-full bg-emerald-950 text-emerald-300 font-black text-sm flex items-center justify-center shadow-lg shadow-black/30">
              ₦
            </div>
            <div className="absolute bottom-4 left-8 w-8 h-8 rounded-full bg-amber-500 text-amber-950 font-black text-xs flex items-center justify-center shadow-md">
              €
            </div>
            <div className="absolute bottom-6 right-10 w-8 h-8 rounded-full bg-emerald-800 text-emerald-100 font-black text-xs flex items-center justify-center shadow-md">
              £
            </div>

            {/* Overlapping 3D Credit Cards */}
            <div className="relative w-64 h-40">
              
              {/* Back Card (Royal Blue) */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-900 shadow-xl transform -rotate-12 translate-y-3 -translate-x-2 border border-blue-400/30 opacity-90" />
              
              {/* Middle Card (Purple / Magenta) */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-800 shadow-xl transform rotate-6 translate-y-1 translate-x-2 border border-purple-400/30 opacity-90" />

              {/* Front Card (Radiant Cyan / Emerald with Gold Chip) */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 p-4 shadow-2xl border border-white/40 flex flex-col justify-between text-white">
                <div className="flex items-center justify-between">
                  {/* Metallic Gold Chip */}
                  <div className="w-8 h-6 rounded-md bg-yellow-300 border border-yellow-500 flex items-center justify-center shadow-sm">
                    <div className="w-5 h-3 border border-yellow-600/40 rounded-sm" />
                  </div>
                  <span className="text-[11px] font-mono tracking-widest font-bold text-white/90">
                    •••• 2026
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-100 block">
                    ZERO-CASH DANCE FLOOR
                  </span>
                  <span className="text-sm font-black tracking-tight text-white block font-display">
                    100% Instant NGN Settle
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/20">
                  <span className="text-[9px] font-mono font-bold text-emerald-100">
                    STELLAR RAILS
                  </span>
                  <div className="flex -space-x-1.5">
                    <div className="w-4 h-4 rounded-full bg-yellow-400/90" />
                    <div className="w-4 h-4 rounded-full bg-red-500/90" />
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Hero Typography & Value Prop */}
          <div className="space-y-2 text-center mt-2 z-10">
            <h1 className="text-2xl sm:text-3xl font-black text-obsidian-950 font-display tracking-tight leading-tight">
              The Smartest Way to Spray & Settle Bills
            </h1>
            <p className="text-xs text-obsidian-950/80 max-w-xs mx-auto font-medium leading-relaxed">
              Create a celebration in seconds. Guests spray frictionless USDC on Stellar, zero cash theft, and automated NIBSS rails credit your Nigerian bank in real time.
            </p>
          </div>

          {/* Action Buttons (Modeled after Image 2) */}
          <div className="space-y-2.5 mt-5 z-10">
            <button
              onClick={() => setCurrentStep(2)}
              className="w-full py-4 rounded-full bg-obsidian-950 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-black/25 hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              <span>Create Owambe Room</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full py-3.5 rounded-full bg-white text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-md hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>→] Join Existing Spray / Enter Code</span>
            </button>

            <p className="text-[10px] text-obsidian-950/70 text-center font-medium pt-1">
              No sign-up or credit card required • Instant multiplayer link
            </p>
          </div>

          {/* Join with Unique Code Modal */}
          {showJoinModal && (
            <div className="absolute inset-0 bg-obsidian-950/95 backdrop-blur-xl z-30 rounded-[44px] p-6 flex flex-col justify-between animate-fade-in text-white border-2 border-emerald-500/30">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🍾</span>
                    <h3 className="text-sm font-black text-white font-display">Join Owambe Dance Floor</h3>
                  </div>
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="w-7 h-7 rounded-full bg-white/10 text-gray-300 hover:text-white flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                  Enter the unique party code provided by your host or printed on your table QR tent card.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                      Party Unique Code
                    </label>
                    <input
                      type="text"
                      value={joinPartyCode}
                      onChange={(e) => {
                        setJoinPartyCode(e.target.value.toUpperCase().replace(/\s+/g, '-'));
                        setJoinError(null);
                      }}
                      placeholder="e.g. OWAMBE-2026"
                      className="w-full text-center tracking-widest text-lg font-mono font-bold px-4 py-3 rounded-2xl bg-obsidian-900 border border-emerald-500/40 text-emerald-300 focus:outline-none focus:border-emerald-400"
                    />
                    {joinError && (
                      <p className="text-[11px] text-red-400 font-semibold mt-1.5 text-center">
                        {joinError}
                      </p>
                    )}
                  </div>

                  {/* Active Celebrations List */}
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-1.5">
                      Or select an active celebration:
                    </span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {parties.map((p) => {
                        const code = p.partyCode || p.slug.toUpperCase();
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setJoinPartyCode(code);
                              setJoinError(null);
                            }}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                              joinPartyCode === code
                                ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold'
                                : 'bg-obsidian-900 border-white/10 text-gray-300 hover:border-white/30'
                            }`}
                          >
                            <span className="truncate max-w-[180px]">{p.name}</span>
                            <span className="font-mono text-[10px] text-emerald-400 font-bold shrink-0">{code}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    const clean = joinPartyCode.trim().toLowerCase();
                    if (!clean) {
                      setJoinError('Please enter a party code.');
                      return;
                    }
                    const matched = getPartyById(clean);
                    const targetSlug = matched ? matched.slug : clean;
                    navigate(`/spray/${targetSlug}`);
                  }}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Enter Dance Floor 💃</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="w-full py-2 text-center text-gray-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* STEPS 2, 3, 4: EVENT DETAILS, PIN, REAL BANK RESOLUTION   */}
      {/* ======================================================== */}
      {currentStep > 1 && (
        <div className="w-full max-w-md bg-obsidian-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col min-h-[580px] text-white">
          
          {/* Header & Step Dots */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-lg">🍾</span>
              <span className="text-xs font-black tracking-wider uppercase text-emerald-400 font-display">
                p-zeh Owambe
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[2, 3, 4].map((step) => (
                <div 
                  key={step}
                  className={`h-1.5 rounded-full transition-all ${
                    step === currentStep 
                      ? 'w-6 bg-emerald-400' 
                      : step < currentStep 
                        ? 'w-3 bg-emerald-700' 
                        : 'w-2 bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 2: CELEBRATION DETAILS */}
          {currentStep === 2 && (
            <div className="flex-1 flex flex-col justify-between animate-fade-in">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    Step 2 of 4
                  </span>
                  <h2 className="text-xl font-black text-white font-display">
                    Celebration Details
                  </h2>
                  <p className="text-xs text-gray-400">
                    Tell us who you are and what you are celebrating tonight.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-300 block mb-1">
                      Your Full Name (Host)
                    </label>
                    <input
                      type="text"
                      required
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      placeholder="e.g. Ibrahim Mujidah"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-300 block mb-1">
                      Owambe Party Title
                    </label>
                    <input
                      type="text"
                      required
                      value={partyName}
                      onChange={(e) => setPartyName(e.target.value)}
                      placeholder="e.g. Chief Adeleke Coronation & 50th Birthday"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-300 block mb-1">
                      Celebrant Name(s)
                    </label>
                    <input
                      type="text"
                      required
                      value={celebrantName}
                      onChange={(e) => setCelebrantName(e.target.value)}
                      placeholder="e.g. High Chief & Yeye Adeleke"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-300 block mb-1">
                      Venue
                    </label>
                    <input
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="e.g. Eko Hotel Grand Ballroom, Victoria Island"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="py-3 px-4 rounded-xl bg-obsidian-950 border border-white/10 text-gray-300 hover:text-white text-xs font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Continue to Security</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CUSTOM 4-DIGIT HOST PIN */}
          {currentStep === 3 && (
            <div className="flex-1 flex flex-col justify-between animate-fade-in">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    Step 3 of 4: Production Security
                  </span>
                  <h2 className="text-xl font-black text-white font-display">
                    Set Your Host Security PIN
                  </h2>
                  <p className="text-xs text-gray-400">
                    Protect your payout vault. You will use this PIN to lock and update your bank account.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-300 block mb-1">
                      Enter New 4-Digit Host PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => {
                        setPin(e.target.value.replace(/\D/g, ''));
                        setPinError(null);
                      }}
                      className="w-full text-center tracking-[0.6em] text-2xl font-mono px-4 py-3 rounded-2xl bg-obsidian-950 border border-white/15 text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-300 block mb-1">
                      Confirm 4-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={confirmPin}
                      onChange={(e) => {
                        setConfirmPin(e.target.value.replace(/\D/g, ''));
                        setPinError(null);
                      }}
                      className="w-full text-center tracking-[0.6em] text-2xl font-mono px-4 py-3 rounded-2xl bg-obsidian-950 border border-white/15 text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {pinError && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{pinError}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await authenticateWithBiometrics(hostName || 'Host');
                        if (res.success) {
                          setBiometricsEnabled(true);
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        biometricsEnabled
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-obsidian-950 border-white/10 text-gray-300 hover:border-emerald-400'
                      }`}
                    >
                      <ScanFace className="w-4 h-4 text-emerald-400" />
                      <span>{biometricsEnabled ? '✓ Face ID / Passkey Enabled' : 'Enable Face ID / Device Passkey'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="py-3 px-4 rounded-xl bg-obsidian-950 border border-white/10 text-gray-300 hover:text-white text-xs font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSetPinSubmit}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Save PIN & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REAL NIBSS BANK ACCOUNT RESOLUTION */}
          {currentStep === 4 && (
            <div className="flex-1 flex flex-col justify-between animate-fade-in">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    Step 4 of 4: Direct Auto-Offramp
                  </span>
                  <h2 className="text-xl font-black text-white font-display">
                    Settlement Bank Account
                  </h2>
                  <p className="text-xs text-gray-400">
                    Enter where all cash sprayed on the dance floor will be deposited.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-gray-300 block mb-1">
                      Select Nigerian Bank
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
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
                        10-Digit Account / Phone Number
                      </label>
                      {isCheckingBank && (
                        <span className="text-[9px] text-amber-400 flex items-center gap-1 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" /> Querying NIBSS Switch...
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={10}
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit account or phone number"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/15 text-white font-mono text-sm tracking-wider focus:outline-none focus:border-emerald-400"
                    />

                    {/* Live NIBSS Check Status Banner */}
                    {bankResult && (
                      <div className="mt-1.5 animate-fade-in">
                        {bankResult.source === 'live_paystack_api' && bankResult.valid && bankResult.accountName ? (
                          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] flex items-center justify-between">
                            <div className="flex items-center gap-1.5 truncate">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="truncate font-bold">
                                ✓ NIBSS Live Name: {bankResult.accountName}
                              </span>
                            </div>
                            <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-400 text-obsidian-950 font-black shrink-0">
                              PAYSTACK LIVE
                            </span>
                          </div>
                        ) : bankResult.source === 'live_paystack_api' && !bankResult.valid ? (
                          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] flex items-center gap-1.5 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{bankResult.error || 'Account not found for this bank.'}</span>
                          </div>
                        ) : bankResult.requiresKey ? (
                          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Live NIBSS auto-lookup requires Paystack Key. Enter your real name below.</span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-300 block mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter full name as registered on bank app"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/15 text-emerald-300 text-xs font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[10px] text-emerald-200">
                    ⚡ <strong>Instant Settlement:</strong> When guests spray USDC on Stellar, Pollar's automated off-ramp converts and deposits NGN into this account with zero waiting.
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="py-3 px-4 rounded-xl bg-obsidian-950 border border-white/10 text-gray-300 hover:text-white text-xs font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-gold-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Launch Host Dashboard</span>
                  <PartyPopper className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
