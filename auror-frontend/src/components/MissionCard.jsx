import React, { useState } from 'react';
import { Target, Shield, Clock, MapPin, DollarSign, ChevronRight, CheckCircle2 } from 'lucide-react';

export function MissionCard({ placement, userTrustScore = 94, onEngage }) {
  const [showBrief, setShowBrief] = useState(false);
  const [isEngaging, setIsEngaging] = useState(false);
  const isCleared = userTrustScore >= placement.minTrust;

  const handleEngageClick = async () => {
    setIsEngaging(true);
    await onEngage(placement);
    setIsEngaging(false);
    setShowBrief(false);
  };

  return (
    <div className="bg-[#0C0F17] hover:bg-[#101420] border border-[#1E2638] hover:border-[#FCE205]/50 transition-all duration-200 p-5 rounded-sm relative flex flex-col justify-between group">
      {/* Top Bar: Match Score & Clearance */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-[#1A2234] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-[#121E2C] border border-[#00F0FF]/40 text-[#00F0FF] text-[10px] font-mono rounded">
              {placement.tier}
            </div>
            <span className="text-slate-400 text-xs font-mono flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              {placement.sector}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141A10] border border-[#10b981]/40 text-[#10b981] font-mono text-xs font-bold rounded">
            <span>MATCH: {placement.matchScore}%</span>
          </div>
        </div>

        {/* Company & Role */}
        <h3 className="text-lg font-display font-bold text-white group-hover:text-[#3b82f6] transition-colors">
          {placement.role}
        </h3>
        <div className="text-sm font-mono text-slate-300 font-semibold mb-3">
          COMPANY: {placement.company}
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 mb-4 font-sans leading-relaxed">
          {placement.description}
        </p>

        {/* Tech Stack Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {placement.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono px-2 py-0.5 bg-[#121724] border border-[#1E273D] text-slate-300 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Metadata & CTA */}
      <div className="pt-3 border-t border-[#1A2234]">
        <div className="flex items-center justify-between text-xs font-mono mb-3">
          <div className="text-slate-400">
            SALARY: <span className="text-[#10b981] font-semibold">{placement.bounty}</span>
          </div>
          <div className={`flex items-center gap-1 ${isCleared ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            <Shield className="w-3.5 h-3.5" />
            <span>REQ: ≥{placement.minTrust} TRUST</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBrief(true)}
            className="flex-1 py-2 px-3 bg-[#121624] hover:bg-[#182033] border border-[#1E273E] text-slate-300 hover:text-white font-mono text-[11px] tracking-wider rounded-sm transition-all"
          >
            DETAILS
          </button>
          
          <button
            onClick={handleEngageClick}
            disabled={!isCleared || isEngaging}
            className={`flex-1 py-2 px-3 font-mono text-[11px] font-bold tracking-wider rounded-sm transition-all flex items-center justify-center gap-1.5 ${
              isCleared && !isEngaging
                ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'
                : 'bg-[#181C26] text-slate-500 cursor-not-allowed border border-[#232A3B]'
            }`}
          >
            {!isCleared ? 'LOCKED (LOW TRUST)' : isEngaging ? 'APPLYING...' : 'APPLY NOW'}
            {isCleared && !isEngaging && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Intel Briefing Modal */}
      {showBrief && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F18] border-2 border-[#3b82f6] max-w-lg w-full p-6 rounded-sm shadow-2xl relative">
            <button
              onClick={() => setShowBrief(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-sm"
            >
              [ ESC ]
            </button>

            <div className="flex items-center gap-2 text-[#3b82f6] font-mono text-xs mb-2">
              <Target className="w-4 h-4" />
              JOB DETAILS
            </div>

            <h3 className="font-display font-bold text-xl text-white mb-1">
              {placement.role}
            </h3>
            <div className="text-sm font-mono text-[#3b82f6] mb-4">
              COMPANY: {placement.company} // {placement.sector}
            </div>

            <div className="bg-[#06080E] p-4 border border-[#1E2638] rounded font-mono text-xs space-y-3 mb-5">
              <div>
                <div className="text-slate-500 text-[10px]">DESCRIPTION:</div>
                <div className="text-slate-200 mt-0.5 leading-relaxed">{placement.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#161D2B]">
                <div>
                  <div className="text-slate-500 text-[10px]">SALARY:</div>
                  <div className="text-[#10b981] font-semibold">{placement.bounty}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">MIN TRUST SCORE:</div>
                  <div className="text-[#10b981] font-semibold">≥ {placement.minTrust} Index</div>
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">APPLICATION DEADLINE:</div>
                <div className="text-slate-300">{placement.deadline}T23:59:59Z</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleEngageClick}
                disabled={isEngaging}
                className="w-full py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#3b82f6]/50 disabled:cursor-not-allowed text-white font-mono font-bold text-xs tracking-wider rounded-sm transition-all"
              >
                {isEngaging ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
