import { createClient } from '@supabase/supabase-js';
import { Event, Spray } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Save spray to Supabase (if configured)
 */
export async function saveSprayToSupabase(spray: Spray): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('sprays').insert([
      {
        id: spray.id,
        event_id: spray.partyId || (spray as any).eventId || 'owambe-2026',
        guest_name: spray.guestName,
        amount: spray.amount,
        currency: spray.currency,
        shoutout: spray.shoutout,
        tx_hash: spray.txHash,
        tier: spray.tier,
        avatar_url: spray.avatarUrl,
        created_at: spray.timestamp,
      },
    ]);
    if (error) {
      console.warn('Supabase insert warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase sync error:', err);
    return false;
  }
}

/**
 * Fetch sprays for an event from Supabase
 */
export async function fetchSpraysFromSupabase(partyId: string): Promise<Spray[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('sprays')
      .select('*')
      .eq('event_id', partyId)
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      partyId: row.event_id,
      guestName: row.guest_name,
      amount: Number(row.amount),
      currency: row.currency || 'USDC',
      shoutout: row.shoutout || '',
      txHash: row.tx_hash || '',
      timestamp: row.created_at,
      tier: row.tier || 'custom',
      paymentMethod: 'pollar_stellar',
      settlementStatus: 'auto_settled_to_bank',
      settlementDestination: 'Host Bank Account',
      avatarUrl: row.avatar_url,
      status: 'confirmed',
    }));
  } catch {
    return null;
  }
}

/**
 * Listen to real-time sprays from Supabase
 */
export function subscribeToSupabaseSprays(
  eventId: string, 
  onNewSpray: (spray: Spray) => void
): (() => void) | null {
  if (!supabase) return null;

  const channel = supabase
    .channel(`event-sprays-${eventId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'sprays',
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        const row = payload.new as any;
        const spray: Spray = {
          id: row.id,
          partyId: row.event_id,
          guestName: row.guest_name,
          amount: Number(row.amount),
          currency: row.currency || 'USDC',
          shoutout: row.shoutout || '',
          txHash: row.tx_hash || '',
          timestamp: row.created_at,
          tier: row.tier || 'custom',
          paymentMethod: 'pollar_stellar',
          settlementStatus: 'auto_settled_to_bank',
          settlementDestination: 'Host Bank Account',
          avatarUrl: row.avatar_url,
          status: 'confirmed',
        };
        onNewSpray(spray);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

