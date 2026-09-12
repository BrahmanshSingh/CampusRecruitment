import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Terminal, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Cpu, 
  Fingerprint, 
  Lock, 
  Activity,
  Award
} from 'lucide-react';

function GithubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { loginWithGitHub, isAuthenticating } = useAuth();
  const [activeFraudIndex, setActiveFraudIndex] = useState(0);

  const fraudLies = [
    { lie: "5+ Years Prompt Engineering Experience (Since 2018)", verdict: "CHRONOLOGICALLY IMPOSSIBLE", risk: "CRITICAL" },
    { lie: "Architected Scalable Multi-Region Kubernetes for 10M DAU", verdict: "ZERO COMMIT FOOTPRINT DETECTED", risk: "HIGH" },
    { lie: "Contributed Core Features to Linux Kernel & React", verdict: "CRYPTOGRAPHIC REPO AUDIT FAILED", risk: "HIGH" },
    { lie: "Full-Stack AI Lead & Distributed Blockchain Expert", verdict: "COPIED TUTORIAL REPO WITH SPOOFED COMMITS", risk: "CRITICAL" },
  ];

  const handleAuth = async () => {
    await loginWithGitHub();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#060709] text-slate-100 flex flex-col justify-between selection:bg-[#FCE205] selection:text-black">
      {/* Top Tactical Navigation */}
      <header className="border-b border-[#1A2234] bg-[#080B12]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#0C0F18] border border-[#FCE205] flex items-center justify-center glow-gold">
            <Shield className="w-5 h-5 text-[#FCE205]" />
          </div>
          <div>
            <span className="font-display font-black text-lg tracking-wider text-white">
              PLACE<span className="text-[#FCE205]">ORACLE</span>
            </span>
            <span className="text-[10px] font-mono text-[#00F0FF] ml-2 px-1.5 py-0.5 border border-[#00F0FF]/30 rounded">
              HACKATHON PROTOCOL
            </span>
          </div>
        </div>

        {/* Hackathon Identity Callout */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          <div className="text-slate-400">
            TEAM: <span className="text-white font-semibold">JACKED NERDS</span>
          </div>
          <div className="w-1 h-3 bg-slate-700"></div>
          <div className="text-slate-400">
            ARCHITECT: <span className="text-[#FCE205]">PURANJAY SHARMA (1024220072)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-[#1E273E] hover:border-[#FCE205] text-xs font-mono tracking-wider rounded-sm transition-all"
          >
            OPERATIVE PORTAL
          </button>
          
          <button
            onClick={handleAuth}
            disabled={isAuthenticating}
            className="px-4 py-2 bg-[#FCE205] hover:bg-[#ffe600] text-black text-xs font-mono font-bold tracking-wider rounded-sm shadow-[0_0_15px_rgba(252,226,5,0.3)] transition-all flex items-center gap-2"
          >
            <GithubIcon className="w-4 h-4" />
            {isAuthenticating ? 'INITIATING HANDSHAKE...' : 'GITHUB HANDSHAKE'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <section className="relative px-6 pt-20 pb-24 max-w-6xl mx-auto text-center">
          {/* Subtle radar background ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#1E2638]/40 pointer-events-none -z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[#FCE205]/10 pointer-events-none -z-10" />

          {/* Alert Tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121624] border border-[#FCE205]/40 text-xs font-mono text-[#FCE205] mb-6 glow-gold"
          >
            <span className="w-2 h-2 rounded-full bg-[#FCE205] animate-ping" />
            TACTICAL ANTI-FRAUD VERIFICATION SYSTEM // ENTERPRISE SAAS
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-tight leading-none mb-6"
          >
            ELIMINATE RESUME FRAUD.<br />
            <span className="text-[#FCE205] text-glow-gold">PROVE REAL CODE.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto text-slate-300 text-base sm:text-lg font-sans leading-relaxed mb-10"
          >
            Traditional resumes are saturated with AI-generated exaggerations and stolen repositories.
            <strong className="text-white"> PlaceOracle</strong> establishes an immutable cryptographic trust barrier
            using automated GitHub OAuth AST analysis and zero-day LLM coding challenges.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={handleAuth}
              disabled={isAuthenticating}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#FCE205] hover:bg-[#ffe600] text-black font-mono font-bold text-sm tracking-wider rounded-sm shadow-[0_0_25px_rgba(252,226,5,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <GithubIcon className="w-5 h-5" />
              {isAuthenticating ? 'VERIFYING CREDENTIALS...' : '[ INITIATE GITHUB HANDSHAKE ]'}
            </button>

            <button
              onClick={() => navigate('/arena')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#101420] hover:bg-[#161C2C] border border-[#1E2638] hover:border-[#00F0FF] text-[#00F0FF] font-mono text-sm tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4" />
              LAUNCH ZERO-DAY ARENA DEMO
            </button>
          </motion.div>
        </section>

        {/* Live Threat Interception Simulator */}
        <section className="px-6 py-16 max-w-5xl mx-auto border-t border-[#182030]">
          <div className="text-center mb-8">
            <span className="text-[11px] font-mono text-[#FF334B] tracking-widest uppercase">
              THREAT SIMULATOR // LIVE DECOMPILATION
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
              How PlaceOracle Intercepts Synthetic Resumes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Left: Fraud claim selector */}
            <div className="md:col-span-6 space-y-3">
              <div className="text-xs font-mono text-slate-400 mb-2">
                SELECT CANDIDATE RESUME CLAIM:
              </div>
              {fraudLies.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveFraudIndex(idx)}
                  className={`p-4 border rounded-sm cursor-pointer transition-all ${
                    activeFraudIndex === idx
                      ? 'bg-[#151A26] border-[#FCE205] text-white shadow-[0_0_15px_rgba(252,226,5,0.15)]'
                      : 'bg-[#0B0E17] border-[#1A2234] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-500">CLAIM #{idx + 1}</span>
                    <span className="text-[#FF334B] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      RISK: {item.risk}
                    </span>
                  </div>
                  <div className="font-mono text-xs font-semibold">
                    "{item.lie}"
                  </div>
                </div>
              ))}
            </div>

            {/* Right: PlaceOracle Real-time Deconstruction */}
            <div className="md:col-span-6 bg-[#080B12] border-2 border-[#1E2638] rounded-sm p-5 flex flex-col justify-between relative overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#1A2234] pb-3 mb-4">
                <div className="flex items-center gap-2 text-[#00F0FF]">
                  <Cpu className="w-4 h-4" />
                  <span>ORACLE AST DISSECTOR</span>
                </div>
                <span className="px-2 py-0.5 bg-[#FF334B]/20 text-[#FF334B] border border-[#FF334B]/40 rounded text-[10px]">
                  FRAUD CONFIRMED
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-slate-500 text-[10px]">EVALUATED PAYLOAD:</div>
                  <div className="text-slate-300 font-semibold mt-0.5">
                    "{fraudLies[activeFraudIndex].lie}"
                  </div>
                </div>

                <div className="p-3 bg-[#180A0E] border border-[#FF334B]/40 rounded-sm">
                  <div className="text-[#FF334B] text-[10px] font-bold tracking-wider">
                    [ ORACLE TELEMETRY VERDICT ]:
                  </div>
                  <div className="text-white font-bold text-sm mt-1 text-glow-red">
                    {fraudLies[activeFraudIndex].verdict}
                  </div>
                </div>

                <div className="bg-[#05070D] p-3 border border-[#161D2C] rounded space-y-1 text-[11px]">
                  <div className="text-slate-400">
                    &gt; GitHub Author Entropy: <span className="text-[#FF334B]">0.12 (Synthetic Copy)</span>
                  </div>
                  <div className="text-slate-400">
                    &gt; Git Tree Timestamp Delta: <span className="text-[#FF334B]">Anomaly Detected</span>
                  </div>
                  <div className="text-slate-400">
                    &gt; Zero-Day Arena Score: <span className="text-[#00FF9D]">Awaiting Live Code Test</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#182030] flex items-center justify-between text-[10px] text-slate-500">
                <span>PROTOCOL: SHA-256 VERIFIED</span>
                <span className="text-[#FCE205]">PLACEORACLE CORE</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="px-6 py-16 max-w-6xl mx-auto border-t border-[#182030]">
          <div className="text-center mb-12">
            <span className="text-[11px] font-mono text-[#FCE205] tracking-widest uppercase">
              THE THREE PILLARS
            </span>
            <h2 className="font-display font-bold text-3xl text-white mt-1">
              Engineered for Ground-Truth Recruitment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0C0F17] border border-[#1E2638] p-6 rounded-sm">
              <div className="w-10 h-10 rounded bg-[#131826] border border-[#00F0FF]/40 text-[#00F0FF] flex items-center justify-center mb-4">
                <GithubIcon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">
                Deep Git Codebase Auditing
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Connect your GitHub repository. Our engine parses commit frequency, code authorship diffs, AST entropy, and commit timestamp distributions to weed out cloned or bought repos.
              </p>
            </div>

            <div className="bg-[#0C0F17] border border-[#1E2638] p-6 rounded-sm">
              <div className="w-10 h-10 rounded bg-[#131826] border border-[#FCE205]/40 text-[#FCE205] flex items-center justify-center mb-4">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">
                Zero-Day LLM Assessments
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                LeetCode problems are leaked and memorized. PlaceOracle crafts real-time dynamic algorithmic challenges with zero public search footprint, solved in a lockdown browser sandbox.
              </p>
            </div>

            <div className="bg-[#0C0F17] border border-[#1E2638] p-6 rounded-sm">
              <div className="w-10 h-10 rounded bg-[#131826] border border-[#00FF9D]/40 text-[#00FF9D] flex items-center justify-center mb-4">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">
                Cryptographic Trust Index
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Operatives receive an immutable, ECDSA-signed Trust Index and cryptographic skill badges that enterprises can immediately verify without conducting repetitive rounds.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Tactical Footer */}
      <footer className="border-t border-[#182030] bg-[#07090F] px-6 py-6 text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          PLACEORACLE // JACKED NERDS HACKATHON PROTOCOL · LEAD ARCHITECT: PURANJAY SHARMA (1024220072)
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-[#00FF9D]">● SYSTEM DEPLOYED</span>
          <span className="text-slate-600">|</span>
          <span className="text-[#FCE205]">REACT 19 + VITE + TAILWIND V4</span>
        </div>
      </footer>
    </div>
  );
}
