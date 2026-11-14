import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, Unlock, ScanFace, CheckCircle, AlertCircle, 
  ArrowLeft, Landmark, KeyRound, Wallet, Building, QrCode, ShieldCheck 
} from 'lucide-react';
import { 
  getHostUser, getParties, getPartyById, saveParty, 
  resetAllStorageToClean, INITIAL_PARTIES, Party 
} from '../services/storage';
import { 
  verifyHostPin, setHostSecurityPin, authenticateWithBiometrics, 
  hasCustomHostPin, getHostSecurityPin 
} from '../services/biometrics';
import { 
  resolveNigerianBankAccount, PRIMARY_NIGERIAN_BANKS, BankResolveResult 
} from '../services/bankVerification';

export const HostBankSettlement: React.FC = () => {
  const navigate = useNavigate();
  const host = getHostUser();
  const parties = getParties();

  const [activePartyId, setActivePartyId] = useState<string>(host?.activePartyId || parties[0]?.id || 'owambe-2026');
  const [party, setParty] = useState<Party>(() => getPartyById(activePartyId) || parties[0] || INITIAL_PARTIES[0]);

  // Form states
  const [bankName, setBankName] = useState<string>(party?.bankName || 'OPay Digital Bank (PayCom)');
  const [accountNumber, setAccountNumber] = useState<string>(party?.accountNumber || '9136447931');
  const [accountName, setAccountName] = useState<string>(party?.accountName || host?.name || 'IBRAHIM MUJIDAH');
  const [settlementUpdated, setSettlementUpdated] = useState<boolean>(false);

  // Live Bank Resolution State
  const [isCheckingBank, setIsCheckingBank] = useState<boolean>(false);
  const [bankCheckResult, setBankCheckResult] = useState<BankResolveResult | null>(null);

  // Security Vault Lock State
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(false);
  const [vaultPinInput, setVaultPinInput] = useState<string>('');
  const [vaultPinError, setVaultPinError] = useState<string | null>(null);

  // Changing PIN state
  const [showChangePin, setShowChangePin] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>('');
  const [confirmNewPin, setConfirmNewPin] = useState<string>('');
  const [changePinSuccess, setChangePinSuccess] = useState<boolean>(false);

  useEffect(() => {
    const current = getPartyById(activePartyId) || parties[0] || INITIAL_PARTIES[0];
    if (current) {
      setParty(current);
      setBankName(current.bankName || 'OPay Digital Bank (PayCom)');
      setAccountNumber(current.accountNumber || '9136447931');
      setAccountName(current.accountName || host?.name || 'IBRAHIM MUJIDAH');
    }
  }, [activePartyId]);

  // Auto-resolve bank account when 10 digits are typed or bank name changes
  useEffect(() => {
    const clean = accountNumber.trim().replace(/\D/g, '');
    if (clean.length === 10) {
      setIsCheckingBank(true);
      resolveNigerianBankAccount(clean, bankName, host?.name).then((res) => {
        setIsCheckingBank(false);
        setBankCheckResult(res);
        if (res.valid && res.accountName) {
          setAccountName(res.accountName);
        }
      });
    } else {
      setBankCheckResult(null);
    }
  }, [accountNumber, bankName, host?.name]);

  const handleUnlockWithPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (verifyHostPin(vaultPinInput)) {
      setIsVaultUnlocked(true);
      setVaultPinError(null);
    } else {
      setVaultPinError('Incorrect PIN. Please enter your 4-digit Host PIN.');
    }
  };

  const handleUnlockWithBiometrics = async () => {
    try {
      const res = await authenticateWithBiometrics(host?.name || 'Host');
      if (res.success) {
        setIsVaultUnlocked(true);
        setVaultPinError(null);
      }
    } catch {
      setVaultPinError('Biometric authentication failed. Please enter your PIN.');
    }
  };

  const handleUpdateSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAcc = accountNumber.trim().replace(/\D/g, '') || '9136447931';
    const cleanAccName = accountName.trim() || host?.name?.toUpperCase() || 'IBRAHIM MUJIDAH';

    const updated: Party = {
      ...party,
      bankName,
      accountNumber: cleanAcc,
      accountName: cleanAccName,
    };
    saveParty(updated);
    setParty(updated);
    setSettlementUpdated(true);
    setTimeout(() => setSettlementUpdated(false), 2500);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      alert('PIN must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmNewPin) {
      alert('New PINs do not match.');
      return;
    }
    setHostSecurityPin(newPin);
    setChangePinSuccess(true);
    setNewPin('');
    setConfirmNewPin('');
    setTimeout(() => {
      setChangePinSuccess(false);
      setShowChangePin(false);
    }, 2000);
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
            Bank Settlement Vault
          </span>

          {isVaultUnlocked ? (
            <button
              onClick={() => {
                setIsVaultUnlocked(false);
                setVaultPinInput('');
              }}
              className="text-[10px] px-2 py-1 rounded-lg bg-obsidian-950 border border-white/10 text-gray-300 hover:text-white font-bold flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Lock</span>
            </button>
          ) : (
            <div className="w-6" />
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-4 min-h-0 overflow-y-auto">
          {!isVaultUnlocked ? (
            /* ======================================================== */
            /* LOCKED VAULT VIEW                                        */
            /* ======================================================== */
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4 animate-fade-in my-auto">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider inline-block mb-1 border border-emerald-500/30">
                  Host Vault Protected
                </span>
                <h2 className="text-lg font-black text-white font-display">
                  Unlock Bank Settlement
                </h2>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Enter your 4-digit Host PIN to access and update your Nigerian bank payout account.
                </p>
              </div>

              {/* 4-digit PIN form */}
              <form onSubmit={handleUnlockWithPin} className="w-full max-w-xs space-y-3 pt-2">
                <div>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    autoFocus
                    value={vaultPinInput}
                    onChange={(e) => {
                      setVaultPinInput(e.target.value.replace(/\D/g, ''));
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
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-emerald-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Vault with PIN</span>
                </button>

                <button
                  type="button"
                  onClick={handleUnlockWithBiometrics}
                  className="w-full py-2.5 rounded-2xl bg-obsidian-900 border border-white/10 text-white hover:border-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <ScanFace className="w-4 h-4 text-emerald-400" />
                  <span>Unlock with Face ID / Passkey</span>
                </button>
              </form>
            </div>
          ) : (
            /* ======================================================== */
            /* UNLOCKED SETTLEMENT BANK FORM                            */
            /* ======================================================== */
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider inline-block mb-1">
                    Vault Unlocked ✓
                  </span>
                  <h2 className="text-base font-black text-white font-display">
                    Settlement Bank Account
                  </h2>
                </div>

                <button
                  onClick={() => setShowChangePin(!showChangePin)}
                  className="text-[10px] px-2.5 py-1 rounded-xl bg-obsidian-900 border border-white/10 text-emerald-300 hover:text-white font-bold flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Change PIN</span>
                </button>
              </div>

              {/* Change PIN Accordion */}
              {showChangePin && (
                <form onSubmit={handleChangePin} className="p-3.5 rounded-2xl bg-obsidian-900 border border-emerald-500/30 space-y-2.5">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Set New 4-Digit Security PIN</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="New PIN"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      className="px-3 py-2 rounded-xl bg-obsidian-950 border border-white/15 text-white font-mono text-center text-sm focus:outline-none focus:border-emerald-400"
                    />
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="Confirm PIN"
                      value={confirmNewPin}
                      onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                      className="px-3 py-2 rounded-xl bg-obsidian-950 border border-white/15 text-white font-mono text-center text-sm focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  {changePinSuccess ? (
                    <div className="text-[10px] text-emerald-400 font-bold">
                      ✓ Host PIN updated successfully!
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-emerald-500 text-obsidian-950 font-black text-[10px] uppercase tracking-wider"
                    >
                      Update PIN
                    </button>
                  )}
                </form>
              )}

              <p className="text-[11px] text-gray-400">
                All guest sprays are automatically converted and deposited here in real time.
              </p>

              <form onSubmit={handleUpdateSettlement} className="space-y-3.5">
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
                    className="w-full px-3 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
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
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" /> Resolving NIBSS...
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={10}
                    required
                    placeholder="e.g. 9136447931"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-white font-mono text-sm tracking-wider focus:outline-none focus:border-emerald-500"
                  />

                  {/* Auto-resolved live check badge */}
                  {bankCheckResult && (
                    <div className="mt-1.5 p-2 rounded-xl text-[10px] flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                      <div className="flex items-center gap-1.5 truncate">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate font-semibold">
                          Live Name: {bankCheckResult.accountName}
                        </span>
                      </div>
                      <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-400 text-obsidian-950 font-black uppercase shrink-0">
                        NIBSS MATCH
                      </span>
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
                    className="w-full px-3 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-emerald-300 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div className="p-3 rounded-xl bg-obsidian-900/60 border border-white/5 text-[10px] text-gray-400 space-y-1">
                  <span className="font-bold text-gray-300 block">How Auto-Settlement Works:</span>
                  <p>When guests spray USDC on Stellar, Pollar's automated off-ramp triggers an instant NGN transfer directly to this bank account.</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all"
                >
                  Save Bank Details
                </button>

                <div className="pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Clear all local demo data and restart with a clean slate?')) {
                        resetAllStorageToClean();
                        window.location.href = '/onboarding';
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
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-gray-400 hover:text-white transition-all"
          >
            <QrCode className="w-5 h-5" />
            <span>Table QR</span>
          </button>

          <button
            onClick={() => navigate('/bank')}
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-emerald-400 scale-105 transition-all"
          >
            <Landmark className="w-5 h-5" />
            <span>My Bank</span>
          </button>
        </nav>

      </div>
    </div>
  );
};
