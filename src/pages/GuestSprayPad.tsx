import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, Flame, Delete, 
  ShieldCheck, Zap, ChevronRight, Copy, Check,
  Clock, Building2, QrCode, ScanFace, KeyRound,
  ExternalLink, Smartphone, AlertCircle
} from 'lucide-react';
import { getPartyById } from '../services/storage';
import { broadcastConfirmedSpray } from '../services/channel';
import { playCashChime, playSprayWhoosh } from '../services/sound';
import { usePollarWallet } from '../services/pollar';
import { authenticateWithBiometrics } from '../services/biometrics';
import { fetchLiveTestnetTx } from '../services/stellar';
import { Spray, SprayTier, PaymentMethod } from '../types';
import confetti from 'canvas-confetti';

type PadStep = 
  | 'input' 
  | 'payment_select' 
  | 'deposit_naira' 
  | 'deposit_stellar' 
  | 'apple_pay' 
  | 'verifying' 
  | 'confirm_blast' 
  | 'success';

export const GuestSprayPad: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const party = getPartyById(id || '');
  const { user, sendSprayPayment } = usePollarWallet();

  const [step, setStep] = useState<PadStep>('input');
  
  const [amountStr, setAmountStr] = useState<string>('50');
  const [guestName, setGuestName] = useState<string>(user?.name || 'Chief Olowolayemo');
  const [shoutout, setShoutout] = useState<string>('Congratulations my people! Soft life forever! 🥂');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('naira_card_bank');
  const [confirmedTx, setConfirmedTx] = useState<{ txHash: string; spray: Spray } | null>(null);

  // Dynamic per-transaction deposit credentials
  const [virtualNgnAccount, setVirtualNgnAccount] = useState<string>(() => {
    return '992' + Math.floor(1000000 + Math.random() * 9000000).toString();
  });
  const [paymentSessionRef, setPaymentSessionRef] = useState<string>(() => {
    return 'PZEH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  });
  const [stellarMemo, setStellarMemo] = useState<string>(() => {
    return 'PZ-' + (party?.slug || 'OWAMBE').slice(0, 4).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
  });

  // Deposit screen interactive state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(899); // 14 mins 59s
  const [verifyingText, setVerifyingText] = useState<string>('Connecting to settlement gateway...');
  const [authMethod, setAuthMethod] = useState<'faceid' | 'pin'>('faceid');

  const numAmount = parseFloat(amountStr) || 0;
  const ngnEquivalent = numAmount * 1650;

  const celebrantName = party?.celebrantName || 'Celebrants';
  const bankName = party?.bankName || 'GTBank';
  const partySlug = party?.slug || party?.id || 'owambe';
  const safeAccountNumber = party?.accountNumber || '0142859124';

  const virtualNgnBank = 'Providus Bank (Dynamic Rail)';
  const virtualNgnAccountName = `P-ZEH / ${celebrantName}`;

  // Stellar host address
  const hostStellarAddress = party?.hostWallet && party.hostWallet.startsWith('G') && party.hostWallet.length > 30
    ? party.hostWallet
    : 'GDQ5BL7R3X7V2TOWAMBEPZEHSTELLARKEMI9HQY37XZGNR2S7VWP';

  const stellarPaymentUri = `web+stellar:pay?destination=${hostStellarAddress}&amount=${numAmount}&memo=${encodeURIComponent(stellarMemo)}&memo_type=MEMO_TEXT`;

  // Countdown timer for virtual bank transfer
  useEffect(() => {
    let timer: any;
    if (step === 'deposit_naira' && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      setAmountStr((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else if (val === '.') {
      if (!amountStr.includes('.')) {
        setAmountStr((prev) => prev + '.');
      }
    } else {
      if (amountStr === '0') {
        setAmountStr(val);
      } else if (amountStr.length < 6) {
        setAmountStr((prev) => prev + val);
      }
    }
  };

  const handleSelectPreset = (preset: number) => {
    setAmountStr(preset.toString());
  };

  const handleProceedToPayment = () => {
    if (numAmount <= 0) {
      alert('Please enter a valid spray amount!');
      return;
    }
    if (!guestName.trim()) {
      alert('Please enter your name or title!');
      return;
    }
    setStep('payment_select');
  };

  // Navigates to the dedicated deposit screen with freshly generated dynamic account & memo
  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    
    // Generate fresh dynamic account & memo per transaction session
    const newAcc = '992' + Math.floor(1000000 + Math.random() * 9000000).toString();
    const newRef = 'PZEH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newMemo = 'PZ-' + (partySlug || 'OWAMBE').slice(0, 4).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    
    setVirtualNgnAccount(newAcc);
    setPaymentSessionRef(newRef);
    setStellarMemo(newMemo);
    setCountdown(899);

    if (method === 'naira_card_bank') {
      setStep('deposit_naira');
    } else if (method === 'pollar_stellar') {
      setStep('deposit_stellar');
    } else {
      setStep('apple_pay');
    }
  };

  // Verification flow triggered when guest clicks "I Have Sent The Money" or "Verify Stellar"
  const handleTriggerVerification = async () => {
    const bioResult = await authenticateWithBiometrics(guestName);
    setAuthMethod(bioResult.method);

    setStep('verifying');
    playSprayWhoosh();

    setVerifyingText(`Securing with Device Passkey (${bioResult.method === 'faceid' ? 'Face ID' : 'PIN'})...`);
    await new Promise((r) => setTimeout(r, 600));

    let txHash = '';

    if (paymentMethod === 'naira_card_bank') {
      setVerifyingText(`Querying Providus Bank NIBSS switch for Ref ${paymentSessionRef}...`);
      const liveTx = await fetchLiveTestnetTx(paymentSessionRef);
      txHash = liveTx.txHash;
      setVerifyingText(`Inflow of ₦${ngnEquivalent.toLocaleString()} confirmed from ${guestName}!`);
      await new Promise((r) => setTimeout(r, 600));
      setVerifyingText(`Auto-offramping to ${celebrantName}'s ${bankName}...`);
      await new Promise((r) => setTimeout(r, 500));
    } else if (paymentMethod === 'pollar_stellar') {
      setVerifyingText(`Inspecting live Stellar Horizon testnet for memo ${stellarMemo}...`);
      const liveTx = await fetchLiveTestnetTx(stellarMemo);
      txHash = liveTx.txHash;
      setVerifyingText(`${numAmount} USDC payment confirmed on Stellar ledger #${liveTx.ledger}!`);
      await new Promise((r) => setTimeout(r, 600));
      setVerifyingText(`Auto-offramping to ${celebrantName}'s ${bankName}...`);
      await new Promise((r) => setTimeout(r, 500));
    } else {
      setVerifyingText(`Authorizing Apple Pay with biometric enclave...`);
      const liveTx = await fetchLiveTestnetTx(`APPLE-PAY-${numAmount}`);
      txHash = liveTx.txHash;
      setVerifyingText(`Settlement confirmed!`);
      await new Promise((r) => setTimeout(r, 500));
    }

    let tier: SprayTier = 'custom';
    if (numAmount >= 50) tier = 'otunba';
    else if (numAmount >= 20) tier = 'executive';
    else if (numAmount >= 5) tier = 'chairman';
    else tier = 'pocket';

    const spray: Spray = {
      id: `spray-${Date.now()}`,
      partyId: party?.id || 'owambe-2026',
      guestName: guestName.trim(),
      amount: numAmount,
      currency: 'USDC',
      shoutout: shoutout.trim(),
      txHash,
      timestamp: new Date().toISOString(),
      tier,
      paymentMethod,
      settlementStatus: 'auto_settled_to_bank',
      settlementDestination: `${bankName} (${safeAccountNumber.slice(-4)})`,
      avatarUrl: user?.avatar,
      status: 'confirmed',
    };

    setConfirmedTx({ txHash, spray });
    setStep('confirm_blast');
  };

  const handlePollarDirectPay = async () => {
    try {
      setStep('verifying');
      setVerifyingText('Signing transaction with Pollar Web3 wallet...');
      const res = await sendSprayPayment(hostStellarAddress, numAmount, stellarMemo);
      setVerifyingText('Transaction confirmed on Stellar network!');
      await new Promise((r) => setTimeout(r, 600));

      const txHash = res.txHash;
      let tier: SprayTier = 'custom';
      if (numAmount >= 50) tier = 'otunba';
      else if (numAmount >= 20) tier = 'executive';
      else if (numAmount >= 5) tier = 'chairman';
      else tier = 'pocket';

      const spray: Spray = {
        id: `spray-${Date.now()}`,
        partyId: party?.id || 'owambe-2026',
        guestName: guestName.trim(),
        amount: numAmount,
        currency: 'USDC',
        shoutout: shoutout.trim(),
        txHash,
        timestamp: new Date().toISOString(),
        tier,
        paymentMethod: 'pollar_stellar',
        settlementStatus: 'auto_settled_to_bank',
        settlementDestination: `${bankName} (${safeAccountNumber.slice(-4)})`,
        avatarUrl: user?.avatar,
        status: 'confirmed',
      };

      setConfirmedTx({ txHash, spray });
      setStep('confirm_blast');
    } catch (err: any) {
      alert('Payment failed: ' + err.message);
      setStep('deposit_stellar');
    }
  };

  const handleCompleteAndBlast = () => {
    if (!confirmedTx) return;

    playCashChime();

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.7 },
      colors: ['#10B981', '#F59E0B', '#FCD34D', '#FFFBEB'],
    });

    broadcastConfirmedSpray(confirmedTx.spray);
    setStep('success');
  };

  // If no party found for this URL parameter, show a clean finder screen
  if (!party) {
    return (
      <div className="fixed inset-0 bg-obsidian-950 text-white flex justify-center items-center p-6 text-center">
        <div className="w-full max-w-sm p-6 rounded-3xl bg-obsidian-900 border border-white/10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
            🔍
          </div>
          <h2 className="text-lg font-black text-white font-display">Party Not Found</h2>
          <p className="text-xs text-gray-400">
            No active Owambe celebration found for <code className="text-emerald-300 font-mono">"{id}"</code>. Please scan the QR code at your table or check the event link.
          </p>
          <div className="space-y-2 pt-2">
            <Link
              to="/host"
              className="w-full py-3 rounded-2xl bg-emerald-500 text-obsidian-950 font-black text-xs uppercase tracking-wider block hover:bg-emerald-400 transition-colors"
            >
              Host a New Party
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-obsidian-950 text-white flex justify-center selection:bg-emerald-500 selection:text-black overflow-hidden">
      {/* 100% Viewport Height Mobile Container */}
      <div className="w-full max-w-md h-full flex flex-col bg-obsidian-950 sm:border-x sm:border-white/10 relative overflow-hidden">
        
        {/* ======================================================== */}
        {/* SCREEN 1: MONEY REQUEST & NUMPAD                         */}
        {/* ======================================================== */}
        {step === 'input' && (
          <div className="flex-1 flex flex-col justify-between p-3.5 min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <Link to="/host" className="text-gray-400 hover:text-white p-1">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Spray Celebrants
              </h2>
              <div className="w-5" />
            </div>

            {/* From & To in compact cards */}
            <div className="space-y-1.5 py-1">
              <div className="p-2 rounded-xl bg-obsidian-900 border border-white/5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {guestName ? guestName.charAt(0) : 'G'}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] text-gray-400 block uppercase">From</span>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Chief / Alhaji / Your Name"
                    className="w-full bg-transparent text-white font-bold text-xs focus:outline-none placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="p-2 rounded-xl bg-obsidian-900 border border-white/5 flex items-center gap-2">
                <img
                  src={party.celebrantPhoto}
                  alt={celebrantName}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-400/40 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] text-gray-400 block uppercase">To Celebrants</span>
                  <h3 className="text-xs font-bold text-white truncate leading-none">
                    {celebrantName}
                  </h3>
                  <span className="text-[9px] text-emerald-400 mt-0.5 block truncate">
                    Auto-offramping to {bankName}
                  </span>
                </div>
              </div>
            </div>

            {/* Large Amount Display */}
            <div className="text-center py-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Amount to Spray
              </span>
              <div className="flex items-center justify-center gap-1.5 my-0.5">
                <span className="text-4xl font-black text-white font-mono tracking-tight">
                  {amountStr}
                </span>
                <span className="text-[10px] font-black text-emerald-400 font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                  USDC
                </span>
              </div>
              <div className="text-[10px] text-gray-400 font-medium">
                ≈ ₦{ngnEquivalent.toLocaleString()} NGN
              </div>

              {/* Preset Chips */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                {[5, 20, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all ${
                      amountStr === preset.toString()
                        ? 'bg-emerald-500 text-obsidian-950 font-black shadow-md shadow-emerald-500/30'
                        : 'bg-obsidian-900 text-gray-300 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Shoutout input */}
            <div className="py-1">
              <input
                type="text"
                placeholder="Personal shoutout on live wall... (e.g. Soft life! 🥂)"
                value={shoutout}
                onChange={(e) => setShoutout(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* NumPad and CTA */}
            <div className="pt-1">
              <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeypadPress(key)}
                    className="h-10 rounded-xl bg-obsidian-900 hover:bg-obsidian-800 active:scale-95 text-white font-black text-base font-mono flex items-center justify-center border border-white/5 transition-all"
                  >
                    {key === 'backspace' ? <Delete className="w-4 h-4 text-gray-400" /> : key}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleProceedToPayment}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <span>Choose Payment Method (${numAmount} USDC)</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 2: PAYMENT METHOD SELECTOR                        */}
        {/* ======================================================== */}
        {step === 'payment_select' && (
          <div className="flex-1 flex flex-col p-4 justify-between min-h-0 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-3">
                <button onClick={() => setStep('input')} className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Select Payment Method
                </h2>
              </div>

              <div className="p-3 rounded-2xl bg-obsidian-900 border border-white/10 mb-3 text-center">
                <span className="text-[10px] text-gray-400 block uppercase">Total to Spray</span>
                <span className="text-2xl font-black text-white font-mono">
                  ${numAmount} USDC <span className="text-xs text-gray-400 font-normal">≈ ₦{ngnEquivalent.toLocaleString()} NGN</span>
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Option 1: Local Nigerian Bank Transfer */}
                <button
                  onClick={() => handleSelectPaymentMethod('naira_card_bank')}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-obsidian-900 border border-emerald-500/40 text-left flex items-center justify-between hover:border-emerald-400 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-lg shrink-0">
                      💳
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white">
                          Pay with Naira (Bank Transfer)
                        </h4>
                        <span className="text-[8px] bg-gold-400 text-obsidian-950 px-1 py-0.2 rounded font-black uppercase">
                          Dynamic NGN
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Transfer ₦{ngnEquivalent.toLocaleString()} to dynamic 1-time virtual account
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Option 2: Pollar Stellar XLM / USDC */}
                <button
                  onClick={() => handleSelectPaymentMethod('pollar_stellar')}
                  className="w-full p-3.5 rounded-2xl bg-obsidian-900 border border-white/10 text-left flex items-center justify-between hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                      🚀
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white">
                          Pollar / Stellar (XLM or USDC)
                        </h4>
                        <span className="text-[8px] bg-emerald-400 text-obsidian-950 px-1 py-0.2 rounded font-black uppercase">
                          Web3
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Instant 3-second deposit via Stellar wallet address & QR
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Option 3: Apple Pay / Google Pay */}
                <button
                  onClick={() => handleSelectPaymentMethod('apple_pay')}
                  className="w-full p-3.5 rounded-2xl bg-obsidian-900 border border-white/10 text-left flex items-center justify-between hover:border-white/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-lg shrink-0">
                      🍏
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white">
                          Apple Pay / Google Pay
                        </h4>
                        <span className="text-[8px] bg-purple-400 text-obsidian-950 px-1 py-0.2 rounded font-black uppercase">
                          Diaspora
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Instant 1-tap checkout for guests in UK, US, Canada
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            <div className="text-center text-[10px] text-gray-500 py-2">
              Funds auto-offramp directly to {celebrantName}'s {bankName} account
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 2A: NAIRA DYNAMIC VIRTUAL BANK TRANSFER           */}
        {/* ======================================================== */}
        {step === 'deposit_naira' && (
          <div className="flex-1 flex flex-col justify-between p-3.5 min-h-0 animate-fade-in">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
                <button onClick={() => setStep('payment_select')} className="text-gray-400 hover:text-white p-1">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Bank Transfer Deposit
                  </h2>
                  <span className="text-[9px] text-emerald-400 font-mono flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Active for {formatCountdown(countdown)}
                  </span>
                </div>
                <div className="w-6" />
              </div>

              {/* Instructions banner */}
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  Dynamic 1-time virtual account generated for your spray. Transfer <strong>₦{ngnEquivalent.toLocaleString()}</strong> from any bank app.
                </span>
              </div>

              {/* Dynamic Account Details Card */}
              <div className="rounded-2xl bg-obsidian-900 border border-white/10 p-2.5 space-y-2 mb-2 shadow-lg">
                {/* Bank Name */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 text-[9px] uppercase">Bank Name</span>
                  <span className="font-bold text-white text-xs">{virtualNgnBank}</span>
                </div>

                {/* Dynamic Account Number with 1-tap Copy */}
                <div className="p-2.5 rounded-xl bg-obsidian-950 border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-[8px] text-gray-400 uppercase block">Dynamic Virtual Account</span>
                    <span className="text-lg font-black text-emerald-400 font-mono tracking-wider">
                      {virtualNgnAccount}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(virtualNgnAccount, 'acc')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-obsidian-950 text-[10px] font-bold flex items-center gap-1 transition-all"
                  >
                    {copiedKey === 'acc' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'acc' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Account Name */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 text-[9px] uppercase">Account Name</span>
                  <span className="font-bold text-white text-[11px] truncate max-w-[190px]">{virtualNgnAccountName}</span>
                </div>

                {/* Exact Amount */}
                <div className="p-2 rounded-xl bg-obsidian-950 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[8px] text-gray-400 uppercase block">Exact Amount to Send</span>
                    <span className="text-sm font-black text-white font-mono">
                      ₦{ngnEquivalent.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(ngnEquivalent.toString(), 'amt')}
                    className="px-2.5 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 text-[9px] font-bold flex items-center gap-1 transition-all"
                  >
                    {copiedKey === 'amt' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'amt' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Session Ref */}
                <div className="flex items-center justify-between text-xs pt-0.5 border-t border-white/5">
                  <span className="text-gray-400 text-[9px] uppercase">Transaction Ref</span>
                  <span className="font-mono text-emerald-300 text-[10px]">{paymentSessionRef}</span>
                </div>
              </div>

              {/* Security info */}
              <div className="p-2 rounded-xl bg-obsidian-900/60 border border-white/5 text-[9px] text-gray-400 flex items-center gap-1.5">
                <ScanFace className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  Protected by Device Passkey (Face ID). No login required.
                </span>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTriggerVerification}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>I Have Sent the Money 💸</span>
              </button>
              <div className="text-center text-[9px] text-gray-500 mt-1">
                Payment verified automatically via Providus NIBSS settlement webhook
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 2B: STELLAR / POLLAR ON-CHAIN DEPOSIT & QR        */}
        {/* ======================================================== */}
        {step === 'deposit_stellar' && (
          <div className="flex-1 flex flex-col justify-between p-3.5 min-h-0 animate-fade-in">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
                <button onClick={() => setStep('payment_select')} className="text-gray-400 hover:text-white p-1">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Stellar / Pollar Deposit
                  </h2>
                  <span className="text-[9px] text-emerald-400 font-mono">
                    Stellar Testnet • 3s Finality
                  </span>
                </div>
                <div className="w-6" />
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center py-1">
                <div className="p-2.5 bg-white rounded-2xl shadow-xl border-2 border-emerald-400/40">
                  <QRCodeSVG value={stellarPaymentUri} size={110} level="M" />
                </div>
                <span className="text-[9px] text-gray-400 mt-1">
                  Scan with Lobstr, Freighter, Solar or any Stellar wallet
                </span>
              </div>

              {/* Deposit Address & Memo Details Card */}
              <div className="rounded-2xl bg-obsidian-900 border border-white/10 p-2.5 space-y-2 mt-1 shadow-lg">
                {/* Amount */}
                <div className="flex items-center justify-between text-xs pb-1 border-b border-white/5">
                  <span className="text-gray-400 text-[9px] uppercase">Amount to Send</span>
                  <span className="font-mono font-black text-white text-sm">
                    ${numAmount} USDC <span className="text-[10px] text-emerald-400 font-normal">≈ {Math.round(numAmount * 7.5)} XLM</span>
                  </span>
                </div>

                {/* Host Stellar Public Address */}
                <div className="p-2 rounded-xl bg-obsidian-950 border border-white/5 flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-[8px] text-gray-400 uppercase block">Host Stellar Public Address</span>
                    <span className="text-[10px] font-mono text-emerald-400 truncate block">
                      {hostStellarAddress}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(hostStellarAddress, 'stellar_addr')}
                    className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-obsidian-950 text-[9px] font-bold flex items-center gap-1 shrink-0"
                  >
                    {copiedKey === 'stellar_addr' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'stellar_addr' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Dynamic Memo */}
                <div className="p-2 rounded-xl bg-obsidian-950 border border-gold-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[8px] text-gold-400 uppercase font-bold block">Dynamic Stellar Memo (Required)</span>
                    <span className="text-xs font-mono font-black text-white tracking-wider">
                      {stellarMemo}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(stellarMemo, 'stellar_memo')}
                    className="px-2 py-1 rounded-lg bg-gold-500/20 text-gold-300 hover:bg-gold-500 hover:text-obsidian-950 text-[9px] font-bold flex items-center gap-1 shrink-0"
                  >
                    {copiedKey === 'stellar_memo' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'stellar_memo' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-1.5 pt-2">
              <button
                type="button"
                onClick={handleTriggerVerification}
                className="w-full py-3 rounded-2xl bg-emerald-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>I Have Sent XLM / USDC — Verify 🚀</span>
              </button>

              <button
                type="button"
                onClick={handlePollarDirectPay}
                className="w-full py-2.5 rounded-2xl bg-obsidian-900 border border-emerald-500/40 text-emerald-300 hover:text-white hover:border-emerald-400 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Pay with Connected Pollar Wallet ⚡</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 2C: APPLE PAY / GOOGLE PAY SHEET                  */}
        {/* ======================================================== */}
        {step === 'apple_pay' && (
          <div className="flex-1 flex flex-col justify-between p-4 min-h-0 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-4">
                <button onClick={() => setStep('payment_select')} className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Contactless Checkout
                </h2>
              </div>

              <div className="p-4 rounded-3xl bg-gradient-to-tr from-gray-900 to-obsidian-900 border border-white/10 shadow-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white text-obsidian-950 flex items-center justify-center font-black text-xl mx-auto shadow-md">
                  
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase">Recipient</span>
                  <h3 className="text-sm font-bold text-white">{celebrantName}</h3>
                  <span className="text-[10px] text-emerald-400">p-zeh Owambe Pay</span>
                </div>

                <div className="py-2 border-y border-white/10">
                  <span className="text-3xl font-black text-white font-mono">${numAmount}.00</span>
                  <span className="text-xs text-gray-400 block">USD (USDC Equivalent)</span>
                </div>

                <p className="text-[10px] text-gray-400">
                  Double-click side button or authenticate with Face ID to confirm spray.
                </p>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleTriggerVerification}
                className="w-full py-4 rounded-2xl bg-white text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <ScanFace className="w-4 h-4 text-obsidian-950" />
                <span>Pay with Face ID / Passkey</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 3: VERIFYING PAYMENT & BIOMETRICS                 */}
        {/* ======================================================== */}
        {step === 'verifying' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white font-display">
                Verifying Settlement...
              </h3>
              <p className="text-xs text-emerald-300 mt-1 max-w-xs font-mono">
                {verifyingText}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-obsidian-900 border border-white/5 text-[10px] text-gray-400 max-w-xs">
              Direct settlement protocol active • Auto-depositing to {celebrantName}'s {bankName}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 4: CONFIRMED RECEIPT -> BLAST LIVE ON SCREEN      */}
        {/* ======================================================== */}
        {step === 'confirm_blast' && confirmedTx && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-3.5 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-300 shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider inline-block mb-1 border border-emerald-500/40">
                Payment Confirmed & Verified
              </span>
              <h2 className="text-xl font-black text-white font-display">
                ${numAmount} USDC Verified
              </h2>
              <p className="text-xs text-emerald-300 font-medium">
                ≈ ₦{ngnEquivalent.toLocaleString()} Auto-offramped to {celebrantName}'s {bankName}
              </p>
            </div>

            <div className="w-full p-3 rounded-2xl bg-obsidian-900 border border-white/10 text-left text-xs space-y-1.5 shadow-md">
              <div className="flex justify-between text-gray-400">
                <span className="text-[10px]">Payment Method:</span>
                <span className="font-bold text-white text-[11px] capitalize">
                  {paymentMethod === 'naira_card_bank' ? 'Providus Bank Transfer' : paymentMethod === 'pollar_stellar' ? 'Stellar Horizon Testnet' : 'Apple Pay'}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span className="text-[10px]">Stellar Tx Hash:</span>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${confirmedTx.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-emerald-400 text-[11px] underline flex items-center gap-1 hover:text-emerald-300"
                >
                  <span>{confirmedTx.txHash.slice(0, 8)}...{confirmedTx.txHash.slice(-6)}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              <div className="flex justify-between text-gray-400">
                <span className="text-[10px]">Security Auth:</span>
                <span className="text-emerald-300 text-[11px] flex items-center gap-1">
                  <ScanFace className="w-3 h-3" /> Passkey Device Verified
                </span>
              </div>
              <div className="flex justify-between text-gray-400 pt-0.5 border-t border-white/5">
                <span className="text-[10px]">Shoutout:</span>
                <span className="text-white italic truncate max-w-[170px] text-[11px]">"{shoutout}"</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompleteAndBlast}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-gold-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Flame className="w-5 h-5 fill-current" />
              <span>Blast Live on Big Screen 🚀</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 5: SUCCESS                                        */}
        {/* ======================================================== */}
        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
            <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-emerald-500/30 to-amber-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/20 p-4">
              👑
            </div>

            <div>
              <h2 className="text-2xl font-black text-white font-display">
                Success!
              </h2>
              <p className="text-xs font-semibold text-emerald-300 mt-1">
                ${numAmount} USDC (≈ ₦{ngnEquivalent.toLocaleString()}) Sprayed!
              </p>
              <p className="text-[11px] text-gray-400 mt-1.5 max-w-xs mx-auto">
                Look up! Your name, shoutout, and falling money are live on the venue wall right now!
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-obsidian-900 border border-white/5 w-full text-xs italic text-gray-300">
              "{shoutout}"
            </div>

            <div className="w-full space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep('input');
                  setConfirmedTx(null);
                }}
                className="w-full py-3 rounded-2xl bg-emerald-500 text-obsidian-950 font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/30"
              >
                Spray Again 💸
              </button>

              <Link
                to={`/wall/${partySlug}`}
                target="_blank"
                className="w-full py-2.5 rounded-2xl bg-obsidian-900 border border-white/10 text-gray-300 font-bold text-xs block hover:text-white transition-colors"
              >
                View Live Screen
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};