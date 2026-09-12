import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { SkillBadgeGrid } from '../components/SkillBadgeGrid';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Terminal, 
  Target, 
  Radio, 
  Fingerprint, 
  Cpu, 
  ExternalLink,
  ChevronRight,
  GitCommit,
  Activity
} from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#060709] text-slate-100">
      {/* Tactical Sidebar */}
      <Sidebar />

      {/* Main Command Console */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Top Operative Dossier Banner */}
        <div className="bg-[#0C0F17] border border-[#1E2638] p-6 rounded-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#FCE205]/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-4">
              <div className="relative">
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200"}
                  alt="Operative"
                  className="w-16 h-16 rounded-sm border-2 border-[#FCE205] object-cover glow-gold"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00FF9D] rounded-full border-2 border-[#0C0F17] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-display font-black text-2xl text-white tracking-wide">
                    {user?.name || "Puranjay Sharma"}
                  </h1>
                  <span className="px-2 py-0.5 bg-[#14261C] border border-[#00FF9D]/40 text-[#00FF9D] text-[10px] font-mono rounded font-semibold">
                    LEVEL-4 VERIFIED
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                  <span>ID: <strong className="text-white">{user?.id || "1024220072"}</strong></span>
                  <span className="text-slate-600">|</span>
                  <span>TEAM: <strong className="text-[#FCE205]">{user?.team || "Jacked Nerds"}</strong></span>
                  <span className="text-slate-600">|</span>
                  <span>ROLE: <strong className="text-slate-200">{user?.role || "Lead Architect"}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/arena')}
                className="px-4 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-mono font-bold text-xs tracking-wider rounded-sm transition-all flex items-center gap-2"
              >
                <Terminal className="w-4 h-4" />
                ASSESSMENT ARENA
              </button>

              <button
                onClick={() => navigate('/targets')}
                className="px-4 py-2.5 bg-[#121624] hover:bg-[#182033] border border-[#1E273D] text-[#00F0FF] font-mono text-xs tracking-wider rounded-sm transition-all flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                MISSION TARGETS (6)
              </button>
            </div>
          </div>
        </div>

        {/* Section: Trust Radar & Telemetry Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Trust Radar Component (7 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
              <div className="bg-[#0C0F17] border border-[#1E2638] p-6 rounded-sm flex flex-col justify-center items-center text-center">
                <ShieldCheck className="w-8 h-8 text-[#3b82f6] mb-2" />
                <div className="text-3xl font-bold text-white">{user?.trustIndex || 50}</div>
                <div className="text-xs font-mono text-slate-400 mt-1">TRUST SCORE</div>
              </div>
              <div className="bg-[#0C0F17] border border-[#1E2638] p-6 rounded-sm flex flex-col justify-center items-center text-center">
                <GitCommit className="w-8 h-8 text-[#10b981] mb-2" />
                <div className="text-3xl font-bold text-white">{user?.codeIntegrity || 50}</div>
                <div className="text-xs font-mono text-slate-400 mt-1">CODE INTEGRITY</div>
              </div>
              <div className="bg-[#0C0F17] border border-[#1E2638] p-6 rounded-sm flex flex-col justify-center items-center text-center">
                <Activity className="w-8 h-8 text-[#f59e0b] mb-2" />
                <div className="text-3xl font-bold text-white">{user?.velocityScore || 50}</div>
                <div className="text-xs font-mono text-slate-400 mt-1">COMMIT VELOCITY</div>
              </div>
            </div>
          </div>

          {/* Real-time Telemetry Stream (4 cols) */}
          <div className="lg:col-span-4 bg-[#0C0F17] border border-[#1E2638] p-5 rounded-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[#1A2234] pb-2">
                <div className="flex items-center gap-2 text-xs font-mono text-[#3b82f6]">
                  <Activity className="w-4 h-4 text-[#3b82f6]" />
                  <span>ACTIVITY LOG</span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs max-h-64 overflow-y-auto">
                {user?.telemetryStream?.length > 0 ? user.telemetryStream.map((item) => (
                  <div key={item.id} className="p-2.5 bg-[#07090F] border border-[#182030] rounded-sm">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                      <span className="text-[#00FF9D] font-bold">{item.score_delta || item.score}</span>
                    </div>
                    <div className="text-slate-200 text-xs font-medium truncate">
                      {item.event_name || item.event}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <GitCommit className="w-3 h-3 text-[#FCE205]" />
                      <span>TX: {item.tx_hash || item.hash}</span>
                    </div>
                  </div>
                )) : <div className="text-slate-500 text-center py-4">No telemetry logs available.</div>}
              </div>
            </div>


          </div>
        </div>

        {/* Section: Cryptographic Skill Badges */}
        <div className="mb-8">
          <SkillBadgeGrid skills={user?.skills || []} />
        </div>
      </main>
    </div>
  );
}
