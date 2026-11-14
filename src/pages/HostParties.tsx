import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Building, ArrowLeft, Wallet, QrCode, Landmark, 
  CheckCircle, ArrowRight 
} from 'lucide-react';
import { 
  getHostUser, getParties, getPartyById, saveParty, 
  Party 
} from '../services/storage';

export const HostParties: React.FC = () => {
  const navigate = useNavigate();
  const host = getHostUser();
  const [parties, setParties] = useState<Party[]>(() => getParties());
  const [activePartyId, setActivePartyId] = useState<string>(host?.activePartyId || parties[0]?.id || 'owambe-2026');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newPartyName, setNewPartyName] = useState<string>('');
  const [newCelebrantName, setNewCelebrantName] = useState<string>('');
  const [newVenue, setNewVenue] = useState<string>('');

  const handleSelectParty = (pId: string) => {
    setActivePartyId(pId);
    if (host) {
      host.activePartyId = pId;
    }
    navigate('/host');
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
      hostId: host?.id || 'host-user',
      hostName: host?.name || 'Ibrahim Mujidah',
      hostWallet: 'GDQ5BL7R3X7V2TOWAMBEPZEHSTELLARKEMI9HQY37XZGNR2S7VWP',
      settlementType: 'bank',
      bankName: 'OPay Digital Bank (PayCom)',
      accountNumber: '9136447931',
      accountName: host?.name ? host.name.toUpperCase() : 'IBRAHIM MUJIDAH',
      currency: 'USDC',
      targetAmount: 10000,
      totalSettled: 0,
      totalSprayers: 0,
      eventDate: 'Upcoming Celebration',
      venue: newVenue.trim() || 'Lagos, Nigeria',
      createdAt: new Date().toISOString(),
    };

    saveParty(newParty);
    setParties(getParties());
    setActivePartyId(newParty.id);
    setShowCreateModal(false);
    setNewPartyName('');
    setNewCelebrantName('');
    setNewVenue('');
    navigate('/host');
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
            My Owambe Parties
          </span>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-2.5 py-1 rounded-xl bg-emerald-500 text-obsidian-950 font-black text-[11px] flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 min-h-0 overflow-y-auto">
          <div className="mb-3">
            <h2 className="text-sm font-black text-white font-display">
              All Celebrations
            </h2>
            <p className="text-[11px] text-gray-400">
              Select a party to view real-time sprays and projector wall
            </p>
          </div>

          <div className="space-y-2.5">
            {parties.map((p) => {
              const isSelected = p.id === activePartyId;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectParty(p.id)}
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
                      className="w-11 h-11 rounded-xl object-cover border border-emerald-400/40"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">
                          {p.name}
                        </h4>
                        {isSelected && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-400 text-obsidian-950 font-black">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        {p.celebrantName} • Auto-settles to {p.bankName || 'OPay'}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                          Total: ${(p.totalSettled ?? 0).toLocaleString()} USDC
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          Open <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-emerald-400 scale-105 transition-all"
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
            className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-gray-400 hover:text-white transition-all"
          >
            <Landmark className="w-5 h-5" />
            <span>My Bank</span>
          </button>
        </nav>

        {/* Modal: Create Owambe Celebration */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-3xl bg-obsidian-900 border border-white/10 p-5 shadow-2xl relative">
              <button
                onClick={() => setShowCreateModal(false)}
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
                  Create Party & Set QR
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
