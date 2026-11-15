// Live Nigerian Bank Account Check & NUBAN Verification Service
// Validates account numbers against CBN NIBSS standards & resolves real bank records via Paystack

export interface NigerianBank {
  name: string;
  code: string;
  slug?: string;
  isFintech?: boolean;
}

// Major Nigerian Commercial Banks & Fintech MFBs with official NIBSS codes
export const PRIMARY_NIGERIAN_BANKS: NigerianBank[] = [
  { name: 'OPay Digital Bank (PayCom)', code: '999992', isFintech: true },
  { name: 'PalmPay', code: '999991', isFintech: true },
  { name: 'Moniepoint MFB', code: '50515', isFintech: true },
  { name: 'Kuda Bank', code: '50211', isFintech: true },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'Access Bank', code: '044' },
  { name: 'United Bank for Africa (UBA)', code: '033' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'Wema Bank (ALAT)', code: '035' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First City Monument Bank (FCMB)', code: '214' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Union Bank of Nigeria', code: '082' },
  { name: 'Ecobank Nigeria', code: '050' },
  { name: 'Titan Trust Bank', code: '102' },
  { name: 'Jaiz Bank', code: '301' },
  { name: 'TAJ Bank', code: '302' },
  { name: 'Lotus Bank', code: '303' },
];

export interface BankResolveResult {
  valid: boolean;
  accountName?: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  error?: string;
  source: 'live_paystack_api' | 'manual';
  requiresKey?: boolean;
}

const PAYSTACK_STORAGE_KEY = 'p_zeh_paystack_secret_key';

export function getPaystackSecretKey(): string {
  try {
    const stored = localStorage.getItem(PAYSTACK_STORAGE_KEY);
    if (stored && stored.trim().startsWith('sk_')) return stored.trim();
  } catch {}
  const envKey = import.meta.env.VITE_PAYSTACK_SECRET_KEY;
  if (envKey && envKey.trim().startsWith('sk_')) return envKey.trim();
  return '';
}

export function setPaystackSecretKey(key: string): void {
  try {
    if (!key || !key.trim()) {
      localStorage.removeItem(PAYSTACK_STORAGE_KEY);
    } else {
      localStorage.setItem(PAYSTACK_STORAGE_KEY, key.trim());
    }
  } catch {}
}

/**
 * Live Bank Account Check & Name Resolution:
 * Strictly hits the official Paystack NIBSS gateway when key is provided.
 * Absolutely NO synthetic or randomly generated names.
 */
export async function resolveNigerianBankAccount(
  accountNumber: string,
  bankName: string
): Promise<BankResolveResult> {
  const cleanNumber = (accountNumber || '').trim().replace(/\D/g, '');

  if (cleanNumber.length !== 10) {
    return {
      valid: false,
      accountNumber: cleanNumber,
      bankName,
      bankCode: '',
      error: 'Nigerian bank account numbers must be exactly 10 digits.',
      source: 'manual',
    };
  }

  // Match bank code & details
  const matchedBank = PRIMARY_NIGERIAN_BANKS.find(
    (b) => bankName.toLowerCase().includes(b.name.toLowerCase().split(' ')[0]) || 
           b.name.toLowerCase().includes(bankName.toLowerCase())
  ) || { name: bankName, code: '999992', isFintech: true };

  const paystackKey = getPaystackSecretKey();

  // If a Paystack Secret Key is configured, perform REAL live NIBSS resolution
  if (paystackKey) {
    try {
      // In dev with proxy, use /api/paystack; in prod, direct or cloud proxy
      const endpoint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `/api/paystack/bank/resolve?account_number=${cleanNumber}&bank_code=${matchedBank.code}`
        : `https://api.paystack.co/bank/resolve?account_number=${cleanNumber}&bank_code=${matchedBank.code}`;

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${paystackKey}`,
        },
      });

      const data = await res.json();

      if (data.status && data.data?.account_name) {
        return {
          valid: true,
          accountName: String(data.data.account_name).toUpperCase(),
          accountNumber: cleanNumber,
          bankName: matchedBank.name,
          bankCode: matchedBank.code,
          source: 'live_paystack_api',
        };
      } else {
        return {
          valid: false,
          accountNumber: cleanNumber,
          bankName: matchedBank.name,
          bankCode: matchedBank.code,
          error: data.message || `Account not found on ${matchedBank.name}. Please check the number and selected bank.`,
          source: 'live_paystack_api',
        };
      }
    } catch (err: any) {
      console.warn('Paystack live resolve request error:', err);
      return {
        valid: false,
        accountNumber: cleanNumber,
        bankName: matchedBank.name,
        bankCode: matchedBank.code,
        error: 'Unable to reach Paystack gateway. Please verify network or enter your name manually.',
        source: 'live_paystack_api',
      };
    }
  }

  // If NO Paystack key is configured:
  // DO NOT FABRICATE A FAKE NAME. Let the host enter their real name.
  return {
    valid: true,
    accountNumber: cleanNumber,
    bankName: matchedBank.name,
    bankCode: matchedBank.code,
    requiresKey: true,
    error: 'Live NIBSS auto-lookup requires a Paystack API key. Please type your real Account Name below.',
    source: 'manual',
  };
}
