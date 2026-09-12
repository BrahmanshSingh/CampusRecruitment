import React, { useState } from 'react';
import { Award, CheckCircle, ExternalLink, Shield, Cpu, Lock } from 'lucide-react';

export function SkillBadgeGrid({ skills = [] }) {
  const [selectedSkill, setSelectedSkill] = useState(null);

  return (
    <div className="bg-[#0C0F17] border border-[#1E2638] p-6 rounded-sm">
      <div className="flex items-center justify-between mb-5 border-b border-[#1A2234] pb-3">
        <div>
          <div className="text-[11px] font-mono text-[#FCE205] tracking-widest uppercase">
            IMMUTABLE LEDGER
          </div>
          <h3 className="font-display font-bold text-lg text-white tracking-wide">
            Verified Skill Cryptographic Badges
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400">
          {skills.length} VERIFIED CREDENTIALS
        </div>
      </div>

      {/* Grid of badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div
            key={skill.id}
            onClick={() => setSelectedSkill(skill)}
            className="group cursor-pointer bg-[#0F131D] hover:bg-[#151B29] border border-[#1E2638] hover:border-[#FCE205]/60 p-4 rounded-sm transition-all duration-200 relative overflow-hidden"
          >
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-slate-700 group-hover:border-[#FCE205] transition-colors" />

            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded bg-[#161D2C] border border-[#242F46] flex items-center justify-center text-[#FCE205] group-hover:text-white group-hover:bg-[#FCE205] group-hover:text-black transition-all">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="px-2 py-0.5 bg-[#00FF9D]/10 text-[#00FF9D] text-[10px] font-mono rounded border border-[#00FF9D]/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                VERIFIED
              </span>
            </div>

            <h4 className="font-display font-bold text-sm text-slate-100 group-hover:text-[#FCE205] transition-colors">
              {skill.name}
            </h4>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              CATEGORY: {skill.category}
            </div>

            <div className="mt-3 pt-3 border-t border-[#182030] flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span className="truncate max-w-[140px] text-slate-400">
                {skill.hash}
              </span>
              <span className="text-[#00F0FF] group-hover:underline flex items-center gap-1">
                INSPECT <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Inspector Dialog */}
      {selectedSkill && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D111A] border-2 border-[#FCE205] max-w-md w-full p-6 rounded-sm shadow-2xl relative">
            <button
              onClick={() => setSelectedSkill(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-sm"
            >
              [ ESC / CLOSE ]
            </button>

            <div className="flex items-center gap-2 text-[#FCE205] font-mono text-xs mb-3">
              <Lock className="w-4 h-4" />
              CRYPTOGRAPHIC CERTIFICATE
            </div>

            <h3 className="font-display font-bold text-xl text-white mb-1">
              {selectedSkill.name}
            </h3>
            <div className="text-xs font-mono text-[#00F0FF] mb-4">
              DOMAIN: {selectedSkill.category}
            </div>

            <div className="space-y-3 bg-[#06080E] p-4 border border-[#1E2638] rounded-sm font-mono text-xs">
              <div>
                <div className="text-slate-500 text-[10px]">ISSUER IDENTITY:</div>
                <div className="text-slate-200">{selectedSkill.issuer}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">VERIFICATION TIMESTAMP:</div>
                <div className="text-slate-200">{selectedSkill.date}T19:30:00Z</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">SHA-256 REPOSITORY PROOF HASH:</div>
                <div className="text-[#FCE205] break-all font-semibold">
                  {selectedSkill.hash}99ef01a8b244d5c7
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px]">ASSESSMENT CONFIDENCE SCORE:</div>
                <div className="text-[#00FF9D] font-bold text-sm">
                  {selectedSkill.score}% (VERIFIED GROUND TRUTH)
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setSelectedSkill(null)}
                className="w-full py-2.5 bg-[#FCE205] hover:bg-[#ffe600] text-black font-mono font-bold text-xs tracking-wider rounded-sm transition-all"
              >
                CLOSE CERTIFICATE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
