import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ShieldCheck, Lock, Landmark, CheckCircle, 
  ArrowRight, ScanFace, ChevronRight, PartyPopper, Check, AlertCircle 
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
  const existingParties = getParties();

  // Step 1: Welcome, Step 2: Host & Event, Step 3: PIN Setup, Step 4: Bank Account, Step 5: Complete
  const [currentStep, setCurrentStep] = useState<number>(1);

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
  const [accountNumber, setAccountNumber] = useState<string>('9136447931');
  const [accountName, setAccountName] = useState<string>('IBRAHIM MUJIDAH');
  const [isCheckingBank, setIsCheckingBank] = useState<boolean>(false);
  const [bankResult, setBankResult] = useState<BankResolveResult | null>(null);

  // Auto-resolve account name whenever 10 digits are present
  useEffect(() => {
    const clean = accountNumber.trim().replace(/\D/g, '');
    if (clean.length === 10) {
      setIsCheckingBank(true);
      resolveNigerianBankAccount(clean, bankName, hostName).then((res) => {
        setIsCheckingBank(false);
        setBankResult(res);
        if (res.valid && res.accountName) {
          setAccountName(res.accountName);
        }
      });
    } else {
      setBankResult(null);
    }
  }, [accountNumber, bankName, hostName]);

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
    // 1. Save Host User
    const updatedHost: HostUser = {
      id: 'host-' + Date.now().toString(36),
      name: hostName.trim() || 'Ibrahim Mujidah',
      email: `${(hostName.trim() || 'host').toLowerCase().replace(/\s+/g, '.')}@p-zeh.xyz`,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      activePartyId: 'owambe-2026',
    };
    saveHostUser(updatedHost);

    // 2. Ensure Host Security PIN is stored
    if (pin && pin.length === 4) {
      setHostSecurityPin(pin);
    }

    // 3. Save Initial / Active Party
    const cleanAcc = accountNumber.trim().replace(/\D/g, '') || '9136447931';
    const cleanName = accountName.trim() || hostName.toUpperCase();
    const updatedParty: Party = {
      id: 'owambe-2026',
      slug: 'owambe-2026',
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

    // 4. Mark Onboarding as Completed
    setOnboardingCompleted(true);

    // 5. Navigate to Host Dashboard
    navigate('/host', { replace: true });
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-white flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-black">
      <div className="w-full max-w-md bg-obsidian-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col min-h-[580px]">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-yellow-400 to-emerald-500" />

        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍾</span>
            <span className="text-xs font-black tracking-wider uppercase text-emerald-400 font-display">
              p-zeh Owambe
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((step) => (
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

        {/* ======================================================== */}
        {/* STEP 1: WELCOME INTRO                                     */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="flex-1 flex flex-col justify-between animate-fade-in">
            <div className="space-y-4 text-center my-auto">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 border-2 border-emerald-400/40 flex items-center justify-center mx-auto text-4xl shadow-xl shadow-emerald-500/10">
                🎉
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider inline-block mb-2 border border-emerald-500/30">
                  Welcome Host
                </span>
                <h1 className="text-2xl font-black text-white font-display">
                  Digital Money-Spraying For Your Owambe
                </h1>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed max-w-xs mx-auto">
                  Guests scan your table QR code, spray USDC on Stellar rails frictionlessly, and <strong className="text-emerald-400 font-semibold">100% of funds settle directly into your Nigerian bank account</strong> in real time.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-white/10 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero cash theft, zero counting torn dirty notes</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Diaspora family sprays live from London, US & Canada</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time Afrobeats TV Wall celebration</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: HOST IDENTITY & PARTY SETUP                      */}
        {/* ======================================================== */}
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

        {/* ======================================================== */}
        {/* STEP 3: SET HOST SECURITY PIN & BIOMETRICS               */}
        {/* ======================================================== */}
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

        {/* ======================================================== */}
        {/* STEP 4: SETTLEMENT NIGERIAN BANK (AUTO-RESOLVES NAME)     */}
        {/* ======================================================== */}
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
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" /> Resolving NIBSS...
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={10}
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9136447931"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/15 text-white font-mono text-sm tracking-wider focus:outline-none focus:border-emerald-400"
                  />

                  {/* Auto-resolved status banner */}
                  {bankResult && (
                    <div className="mt-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate font-bold">
                          ✓ Verified: {bankResult.accountName}
                        </span>
                      </div>
                      <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-400 text-obsidian-950 font-black shrink-0">
                        NIBSS MATCH
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-300 block mb-1">
                    Account Name (Auto-Generated)
                  </label>
                  <input
                    type="text"
                    required
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
    </div>
  );
};
