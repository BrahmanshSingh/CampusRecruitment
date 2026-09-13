import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { MissionCard } from '../components/MissionCard';
import { mockPlacements } from '../data/mockPlacements';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Target, Search, Filter, CheckCircle2, Shield, Loader } from 'lucide-react';

export function TargetsFeed() {
  const { user } = useAuth();
  const [filterTier, setFilterTier] = useState('ALL');
  const [filterDomain, setFilterDomain] = useState('in-campus');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedTarget, setAppliedTarget] = useState(null);
  
  const [placements, setPlacements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchPlacements = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (searchQuery.trim()) params.query = searchQuery;
        if (filterTier !== 'ALL') params.tier = filterTier;
        if (filterDomain) params.domain = filterDomain;

        const res = await api.placements.list(params);
        if (mounted) {
          if (res.placements && res.placements.length > 0) {
            const mapped = res.placements.map(p => ({
              id: p.id,
              company: p.company_name,
              role: p.role,
              tier: p.ctc >= 30 ? 'TOP TIER' : (p.ctc >= 20 ? 'QUANTITATIVE' : 'TACTICAL'),
              salary: `${p.ctc} LPA`,
              requiredScore: 85,
              tags: p.tech_stack || [],
              desc: `High-clearance ${p.role} operative requested at ${p.company_name}. Cryptographic skill verification mandatory.`,
              apply_url: p.apply_url,
            }));
            setPlacements(mapped);
          } else {
            setPlacements([]); // Return empty if real filtering returns nothing
          }
        }
      } catch (err) {
        console.error("Failed to fetch placements:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchPlacements();
    }, 300);

    return () => { 
      mounted = false; 
      clearTimeout(debounceTimer);
    };
  }, [searchQuery, filterTier, filterDomain]);

  const tiers = ['ALL', 'TOP TIER', 'TACTICAL', 'QUANTITATIVE', 'INFRASTRUCTURE'];

  const filteredPlacements = placements; // Filtering is now done by backend

  const handleEngage = async (placement) => {
    try {
      await api.placements.apply(placement.id);
      setAppliedTarget(placement);
      setTimeout(() => {
        setAppliedTarget(null);
      }, 4000);
    } catch (err) {
      alert(err.message || 'Failed to apply to target');
    }
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

        {/* Domain Toggle (In-Campus vs Off-Campus) */}
        <div className="flex bg-[#0C0F17] p-1 rounded-sm border border-[#1E2638] w-fit mb-4">
          <button
            onClick={() => setFilterDomain('in-campus')}
            className={`px-4 py-1.5 font-mono text-xs tracking-wider transition-all ${
              filterDomain === 'in-campus' 
                ? 'bg-[#00FF9D] text-black font-bold shadow-[0_0_10px_rgba(0,255,157,0.3)]' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            IN-CAMPUS (RESTRICTED)
          </button>
          <button
            onClick={() => setFilterDomain('off-campus')}
            className={`px-4 py-1.5 font-mono text-xs tracking-wider transition-all ${
              filterDomain === 'off-campus' 
                ? 'bg-[#00F0FF] text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            OFF-CAMPUS (GLOBAL)
          </button>
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#00F0FF]">
            <Loader className="w-8 h-8 animate-spin mb-4" />
            <div className="font-mono text-xs animate-pulse">ESTABLISHING SECURE CONNECTION TO PLACEMENT GRID...</div>
          </div>
        ) : (
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
        )}
      </main>
    </div>
  );
}
