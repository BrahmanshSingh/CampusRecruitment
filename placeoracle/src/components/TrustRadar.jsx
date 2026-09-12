import React from 'react';
import { ShieldCheck, Zap, Code2, AlertCircle } from 'lucide-react';

export function TrustRadar({ trustScore = 94, breakdown = { integrity: 97, velocity: 92, grade: 95 } }) {
  // SVG circular arc math
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (trustScore / 100) * circumference;

  return (
    <div className="bg-[#0C0F17] border border-[#1E2638] p-6 rounded-sm relative overflow-hidden">
      {/* Background corner decor */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#FCE205] pointer-events-none opacity-80" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#1E2638] pointer-events-none" />

      <div className="flex items-center justify-between mb-6 border-b border-[#1A2234] pb-3">
        <div>
          <div className="text-[11px] font-mono text-[#00F0FF] tracking-widest uppercase flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-[#00F0FF] rounded-full animate-ping"></span>
            CRYPTOGRAPHIC TRUST INDEX
          </div>
          <h3 className="font-display font-bold text-lg text-white tracking-wide">
            Autonomous Verification Core
          </h3>
        </div>
        <div className="px-2.5 py-1 bg-[#122019] border border-[#00FF9D]/40 text-[#00FF9D] text-[11px] font-mono rounded flex items-center gap-1.5 glow-green">
          <ShieldCheck className="w-3.5 h-3.5" />
          FRAUD RISK: 0.00%
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Animated Circular Radar Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative py-4">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Radar background grid rings */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-[#161D2B]"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-[#FCE205] transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(252, 226, 5, 0.5))',
                }}
              />
            </svg>

            {/* Rotating Radar Sweep Line */}
            <div className="absolute inset-4 rounded-full border border-[#1E2638] overflow-hidden pointer-events-none">
              <div 
                className="w-full h-full animate-radar"
                style={{
                  background: 'conic-gradient(from 0deg at 50% 50%, rgba(252, 226, 5, 0.25) 0deg, transparent 60deg, transparent 360deg)'
                }}
              />
            </div>

            {/* Center Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-mono font-black text-white tracking-tighter text-glow-gold">
                {trustScore}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#FCE205] font-semibold">
                TRUST SCORE
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                MAX 100
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown Telemetry Bars */}
        <div className="md:col-span-7 space-y-4">
          {/* Code Integrity */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#00F0FF]" />
                CODE INTEGRITY & STATIC PROOF
              </span>
              <span className="text-[#00F0FF] font-bold">{breakdown.integrity}%</span>
            </div>
            <div className="w-full bg-[#131826] h-2 rounded-full overflow-hidden border border-[#1B2336]">
              <div 
                className="bg-gradient-to-r from-[#00A8FF] to-[#00F0FF] h-full transition-all duration-700" 
                style={{ width: `${breakdown.integrity}%` }}
              />
            </div>
          </div>

          {/* Commit Velocity */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#FCE205]" />
                COMMIT VELOCITY & REPO ACTIVITY
              </span>
              <span className="text-[#FCE205] font-bold">{breakdown.velocity}%</span>
            </div>
            <div className="w-full bg-[#131826] h-2 rounded-full overflow-hidden border border-[#1B2336]">
              <div 
                className="bg-gradient-to-r from-[#FFB800] to-[#FCE205] h-full transition-all duration-700" 
                style={{ width: `${breakdown.velocity}%` }}
              />
            </div>
          </div>

          {/* Assessment Grade */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-1.5">
              <span className="text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00FF9D]" />
                ZERO-DAY ARENA ASSESSMENT
              </span>
              <span className="text-[#00FF9D] font-bold">{breakdown.grade}%</span>
            </div>
            <div className="w-full bg-[#131826] h-2 rounded-full overflow-hidden border border-[#1B2336]">
              <div 
                className="bg-gradient-to-r from-[#059669] to-[#00FF9D] h-full transition-all duration-700" 
                style={{ width: `${breakdown.grade}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 bg-[#080B12] border border-[#1B2234] rounded text-[11px] font-mono text-slate-400 flex items-center justify-between mt-3">
            <span>PROOF HASH: 0x9f1a...480b</span>
            <span className="text-[#00FF9D]">ECDSA SIGNED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
