import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { MissionCard } from '../components/MissionCard';
import { mockPlacements } from '../data/mockPlacements';
import { useAuth } from '../context/AuthContext';
import { Target, Search, Filter, CheckCircle2, Shield } from 'lucide-react';

export function TargetsFeed() {
  const { user } = useAuth();
  const [filterTier, setFilterTier] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedTarget, setAppliedTarget] = useState(null);

  const tiers = ['ALL', 'TOP TIER', 'TACTICAL', 'QUANTITATIVE', 'INFRASTRUCTURE'];

  const filteredPlacements = mockPlacements.filter((p) => {
    const matchesTier = filterTier === 'ALL' || p.tier === filterTier;
    const matchesSearch = 
      p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTier && matchesSearch;
  });

  const handleEngage = (placement) => {
    setAppliedTarget(placement);
    setTimeout(() => {
      // Auto dismiss notification after 4s
      setAppliedTarget(null);
    }, 4000);
  };

  return (
    <div className="flex min-h-screen bg-[#060709] text-slate-100">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-[#1A2234] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00F0FF] mb-1">
              <Target className="w-4 h-4" />
              <span>LIVE OPPORTUNITY RECONNAISSANCE</span>
            </div>
            <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-wide">
              Tactical Targets Feed
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Verified high-clearance engineering placements requesting cryptographic proof.
            </p>
          </div>

          {/* Trust status badge */}
          <div className="px-4 py-2 bg-[#0C101A] border border-[#1E273E] rounded-sm font-mono text-xs flex items-center gap-3">
            <span className="text-slate-400">OPERATIVE TRUST INDEX:</span>
            <span className="text-lg font-black text-[#FCE205] text-glow-gold">
              {user?.trustIndex || 94} / 100
            </span>
            <span className="px-2 py-0.5 bg-[#00FF9D]/10 text-[#00FF9D] text-[10px] rounded border border-[#00FF9D]/30">
              ALL CLEARANCES UNLOCKED
            </span>
          </div>
        </div>

        {/* Search & Tier Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search target company, role, or stack (e.g. LLM, Rust, CUDA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0C0F17] border border-[#1E2638] focus:border-[#FCE205] text-white text-xs font-mono rounded-sm outline-none transition-colors"
            />
          </div>

          {/* Tier buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {tiers.map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={`px-3 py-1.5 font-mono text-xs tracking-wider rounded-sm transition-all whitespace-nowrap ${
                  filterTier === tier
                    ? 'bg-[#FCE205] text-black font-bold shadow-[0_0_10px_rgba(252,226,5,0.25)]'
                    : 'bg-[#0E121B] hover:bg-[#141A27] text-slate-400 border border-[#1C2436]'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Applied Notification Banner */}
        {appliedTarget && (
          <div className="mb-6 p-4 bg-[#10241A] border-2 border-[#00FF9D] rounded-sm text-xs font-mono text-white flex items-center justify-between glow-green animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#00FF9D]" />
              <div>
                <strong className="text-[#00FF9D]">TRANSMISSION SUCCESSFUL:</strong> Application & Cryptographic Trust Token dispatched to {appliedTarget.company} ({appliedTarget.role}).
              </div>
            </div>
            <span className="text-[10px] text-slate-400">TX HASH: 0x93b7...d28e</span>
          </div>
        )}

        {/* Grid of Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlacements.map((placement) => (
            <MissionCard
              key={placement.id}
              placement={placement}
              userTrustScore={user?.trustIndex || 94}
              onEngage={handleEngage}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
