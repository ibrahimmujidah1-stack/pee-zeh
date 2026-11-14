import { Spray, SyncMessage } from '../types';
import { addConfirmedSpray } from './storage';
import { subscribeToSupabaseSprays } from './supabase';

const CHANNEL_NAME = 'p-zeh-live';
const STORAGE_SYNC_KEY = 'p_zeh_latest_sync';

let activeChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!activeChannel && 'BroadcastChannel' in window) {
    try {
      activeChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch (err) {
      console.warn('BroadcastChannel error:', err);
    }
  }
  return activeChannel;
}

/**
 * Broadcast ONLY confirmed sprays after payment verification
 */
export function broadcastConfirmedSpray(spray: Spray): void {
  // 1. Add to local storage & update party balance
  addConfirmedSpray(spray);

  const payload: SyncMessage = {
    type: 'NEW_SPRAY',
    data: spray,
  };

  // 2. BroadcastChannel
  const channel = getBroadcastChannel();
  if (channel) {
    try {
      channel.postMessage(payload);
    } catch (e) {
      console.warn('Channel post error:', e);
    }
  }

  // 3. LocalStorage event fallback
  try {
    localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify({ ...payload, _t: Date.now() }));
  } catch {}
}

/**
 * Listen for live sprays for a specific party
 */
export function subscribeToPartyLiveSync(
  partyId: string,
  onSprayReceived: (spray: Spray) => void
): () => void {
  const channel = getBroadcastChannel();

  const handleMessage = (event: MessageEvent) => {
    const msg = event.data as SyncMessage;
    if (!msg || !msg.type) return;

    if (msg.type === 'NEW_SPRAY') {
      const spray = msg.data as Spray;
      if (spray.partyId === partyId) {
        onSprayReceived(spray);
      }
    }
  };

  if (channel) {
    channel.addEventListener('message', handleMessage);
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_SYNC_KEY && event.newValue) {
      try {
        const msg = JSON.parse(event.newValue) as SyncMessage;
        if (msg.type === 'NEW_SPRAY') {
          const spray = msg.data as Spray;
          if (spray.partyId === partyId) {
            onSprayReceived(spray);
          }
        }
      } catch {}
    }
  };

  window.addEventListener('storage', handleStorage);

  const unsubscribeSupabase = subscribeToSupabaseSprays(partyId, (sprayAny) => {
    const s: Spray = {
      ...sprayAny,
      partyId: sprayAny.partyId || (sprayAny as any).eventId || partyId,
      status: 'confirmed',
    };
    onSprayReceived(s);
  });

  return () => {
    if (channel) {
      channel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('storage', handleStorage);
    if (unsubscribeSupabase) {
      unsubscribeSupabase();
    }
  };
}
