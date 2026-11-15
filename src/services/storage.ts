import { Party, Spray, LeaderboardEntry, HostUser } from '../types';
import { saveSprayToSupabase } from './supabase';

export const DEFAULT_HOST: HostUser = {
  id: 'host-user',
  name: 'Owambe Host',
  email: 'host@p-zeh.xyz',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  activePartyId: 'owambe-2026',
};

// Clean real production party initial template (0 sprays, $0 settled)
export const INITIAL_PARTIES: Party[] = [
  {
    id: 'owambe-2026',
    slug: 'owambe-2026',
    name: 'Owambe Live Celebration',
    celebrantName: 'The Celebrants',
    celebrantPhoto: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    hostId: 'host-user',
    hostName: 'Owambe Host',
    hostWallet: 'GDQ5BL7R3X7V2TOWAMBEPZEHSTELLARKEMI9HQY37XZGNR2S7VWP',
    settlementType: 'bank',
    bankName: 'Guaranty Trust Bank (GTBank)',
    accountNumber: '0142859124',
    accountName: 'Owambe Event Settlement',
    currency: 'USDC',
    targetAmount: 10000,
    totalSettled: 0,
    totalSprayers: 0,
    eventDate: 'Tonight • Lagos, Nigeria',
    venue: 'Grand Ballroom, Lagos',
    createdAt: new Date().toISOString(),
  },
];

// Production starts clean with 0 fake sprays
const INITIAL_SPRAYS: Spray[] = [];

const HOST_KEY = 'p_zeh_host_user_v3';
const PARTIES_KEY = 'p_zeh_parties_v3';
const SPRAYS_KEY_PREFIX = 'p_zeh_party_sprays_v3_';
const ONBOARDING_KEY = 'p_zeh_onboarding_completed_v3';

export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setOnboardingCompleted(completed: boolean = true): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, completed ? 'true' : 'false');
  } catch {}
}

function sanitizeParty(p: any): Party {
  const slug = p?.slug || p?.id || 'owambe-2026';
  const partyCode = p?.partyCode || slug.toUpperCase();
  return {
    id: p?.id || 'owambe-2026',
    slug,
    partyCode,
    name: p?.name || 'Owambe Celebration',
    celebrantName: p?.celebrantName || 'The Celebrants',
    celebrantPhoto: p?.celebrantPhoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    hostId: p?.hostId || 'host-user',
    hostName: p?.hostName || 'Owambe Host',
    hostWallet: p?.hostWallet || 'GDQ5BL7R3X7V2TOWAMBEPZEHSTELLARKEMI9HQY37XZGNR2S7VWP',
    settlementType: p?.settlementType || 'bank',
    bankName: p?.bankName || 'Guaranty Trust Bank (GTBank)',
    accountNumber: String(p?.accountNumber || '0142859124'),
    accountName: p?.accountName || 'Owambe Event Settlement',
    currency: p?.currency || 'USDC',
    targetAmount: p?.targetAmount || 10000,
    totalSettled: typeof p?.totalSettled === 'number' ? p.totalSettled : 0,
    totalSprayers: typeof p?.totalSprayers === 'number' ? p.totalSprayers : 0,
    eventDate: p?.eventDate || 'Tonight • Lagos, Nigeria',
    venue: p?.venue || 'Grand Ballroom, Lagos',
    createdAt: p?.createdAt || new Date().toISOString(),
  };
}

export function getHostUser(): HostUser {
  try {
    const raw = localStorage.getItem(HOST_KEY);
    if (!raw) {
      localStorage.setItem(HOST_KEY, JSON.stringify(DEFAULT_HOST));
      return DEFAULT_HOST;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_HOST;
  }
}

export function saveHostUser(host: HostUser): void {
  localStorage.setItem(HOST_KEY, JSON.stringify(host));
}

export function getParties(): Party[] {
  try {
    const raw = localStorage.getItem(PARTIES_KEY);
    if (!raw) {
      localStorage.setItem(PARTIES_KEY, JSON.stringify(INITIAL_PARTIES));
      return INITIAL_PARTIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(sanitizeParty);
    }
    return INITIAL_PARTIES;
  } catch {
    return INITIAL_PARTIES;
  }
}

export function getPartyById(idOrSlugOrCode: string): Party | null {
  if (!idOrSlugOrCode) return null;
  const parties = getParties();
  const search = idOrSlugOrCode.trim().toLowerCase();
  const found = parties.find(
    (p) =>
      p.id.toLowerCase() === search ||
      p.slug.toLowerCase() === search ||
      (p.partyCode && p.partyCode.toLowerCase() === search)
  );
  return found ? sanitizeParty(found) : null;
}

export function saveParty(party: Party): void {
  const parties = getParties();
  const sanitized = sanitizeParty(party);
  const existingIdx = parties.findIndex((p) => p.id === sanitized.id);
  if (existingIdx >= 0) {
    parties[existingIdx] = sanitized;
  } else {
    parties.unshift(sanitized);
  }
  localStorage.setItem(PARTIES_KEY, JSON.stringify(parties));
}

export function deleteParty(partyId: string): void {
  const parties = getParties().filter((p) => p.id !== partyId);
  localStorage.setItem(PARTIES_KEY, JSON.stringify(parties));
  try {
    localStorage.removeItem(`${SPRAYS_KEY_PREFIX}${partyId}`);
  } catch {}
}

export function getPartySprays(partyId: string): Spray[] {
  try {
    const raw = localStorage.getItem(`${SPRAYS_KEY_PREFIX}${partyId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addConfirmedSpray(spray: Spray): void {
  const current = getPartySprays(spray.partyId);
  const updated = [spray, ...current.filter((s) => s.id !== spray.id)];
  localStorage.setItem(`${SPRAYS_KEY_PREFIX}${spray.partyId}`, JSON.stringify(updated));

  const party = getPartyById(spray.partyId);
  if (party) {
    party.totalSettled += spray.amount;
    party.totalSprayers = new Set(updated.map((s) => s.guestName.trim())).size;
    saveParty(party);
  }

  saveSprayToSupabase({
    ...spray,
    eventId: spray.partyId,
  } as any).catch(() => {});
}

export function calculateLeaderboard(sprays: Spray[]): LeaderboardEntry[] {
  const map = new Map<string, { total: number; count: number; shoutout: string; timestamp: string }>();

  sprays
    .filter((s) => s.status === 'confirmed')
    .forEach((spray) => {
      const key = spray.guestName.trim();
      if (!map.has(key)) {
        map.set(key, {
          total: spray.amount,
          count: 1,
          shoutout: spray.shoutout,
          timestamp: spray.timestamp,
        });
      } else {
        const entry = map.get(key)!;
        entry.total += spray.amount;
        entry.count += 1;
        if (new Date(spray.timestamp) > new Date(entry.timestamp)) {
          entry.shoutout = spray.shoutout;
          entry.timestamp = spray.timestamp;
        }
      }
    });

  const sorted = Array.from(map.entries())
    .map(([guestName, stats]) => ({
      guestName,
      totalAmount: stats.total,
      sprayCount: stats.count,
      latestShoutout: stats.shoutout,
      latestTimestamp: stats.timestamp,
      rank: 0,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  sorted.forEach((item, index) => {
    item.rank = index + 1;
  });

  return sorted;
}

export function resetAllStorageToClean(): void {
  try {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('p_zeh_')) {
        localStorage.removeItem(k);
      }
    });
  } catch {}
}