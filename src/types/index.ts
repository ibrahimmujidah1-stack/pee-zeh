export interface Party {
  id: string;
  slug: string;
  partyCode?: string;
  name: string;
  celebrantName: string;
  celebrantPhoto: string;
  hostId: string;
  hostName: string;
  hostWallet: string;
  settlementType: 'bank' | 'wallet';
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: 'USDC' | 'NGN';
  targetAmount: number;
  totalSettled: number;
  totalSprayers: number;
  eventDate: string;
  venue: string;
  createdAt: string;
}

export type SprayTier = 'pocket' | 'chairman' | 'executive' | 'otunba' | 'custom';
export type PaymentMethod = 'pollar_stellar' | 'naira_card_bank' | 'apple_pay';
export type BallerTitle = 'Odogwu' | 'Chief' | 'Chairman' | 'Otunba' | 'Yeye Oge' | 'Omo Olope';

export interface Spray {
  id: string;
  partyId: string;
  guestName: string;
  ballerTitle?: BallerTitle;
  isOdogwu?: boolean;
  amount: number;
  currency: 'USDC' | 'NGN';
  shoutout: string;
  txHash: string;
  timestamp: string;
  tier: SprayTier;
  paymentMethod: PaymentMethod;
  settlementStatus: 'auto_settled_to_bank' | 'auto_settled_to_wallet';
  settlementDestination: string;
  avatarUrl?: string;
  status: 'confirmed';
}

export interface LeaderboardEntry {
  guestName: string;
  totalAmount: number;
  sprayCount: number;
  rank: number;
  latestShoutout: string;
  latestTimestamp: string;
}

export interface HostUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  activePartyId: string;
}

export interface SyncMessage {
  type: 'NEW_SPRAY' | 'UPDATE_PARTY';
  data: any;
}
