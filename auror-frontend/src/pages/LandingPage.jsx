import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Terminal, 
  AlertTriangle, 
  Cpu, 
  Fingerprint
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function GithubIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const { loginWithGitHub, isAuthenticating } = useAuth();
  const [activeFraudIndex, setActiveFraudIndex] = useState(0);

  // Canvas Video Scroll Refs
  const canvasRef = useRef(null);
  const [frameIndex, setFrameIndex] = useState(1);
  const imagesRef = useRef([]);
  const totalFrames = 240;

  // Preload images
  useEffect(() => {
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = `/frames/frame_${String(i).padStart(4, '0')}.jpg`;
      imagesRef.current.push(img);
    }
  }, []);

  // Handle Scroll to map scrollY to frameIndex
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      // Calculate scroll fraction (0 to 1)
      const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));
      
      // Map to frame index (1 to 240)
      const frame = Math.floor(scrollFraction * (totalFrames - 1)) + 1;
      
      requestAnimationFrame(() => {
        setFrameIndex(frame);
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Draw to canvas when frameIndex changes
  useEffect(() => {
    if (canvasRef.current && imagesRef.current.length > 0) {
      const context = canvasRef.current.getContext('2d');
      const img = imagesRef.current[frameIndex - 1];
      
      const draw = () => {
        context.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      };

      if (img.complete) {
        draw();
      } else {
        img.onload = draw;
      }
    }
  }, [frameIndex]);

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
    <div className="min-h-screen text-slate-100 flex flex-col justify-between selection:bg-[#FCE205] selection:text-black font-sans relative">
      
      {/* Background Canvas (Video Sequence) */}
      <canvas 
        ref={canvasRef} 
        width={1920} 
        height={1080} 
        className="canvas-bg"
      />

      {/* Dark Gradient Overlay to ensure text readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 pointer-events-none z-0"></div>

      {/* Top Tactical Navigation */}
      <header className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#050914] border border-[#fce205] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#fce205]" />
          </div>
          <div>
            <span className="font-cinzel font-bold text-lg tracking-widest text-white uppercase">
              Auror
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 hover:text-[#fce205] text-white text-xs tracking-[2px] uppercase transition-colors"
          >
            Dashboard
          </button>
          
          <button
            onClick={handleAuth}
            disabled={isAuthenticating}
            className="px-4 py-2 border border-white hover:bg-white hover:text-black text-white text-xs font-bold tracking-wider rounded-full transition-all flex items-center gap-2 backdrop-blur-md"
          >
            <GithubIcon className="w-4 h-4" />
            {isAuthenticating ? 'LOGGING IN...' : 'LOGIN WITH GITHUB'}
          </button>
        </div>
      </header>

      {/* Parallax Hero Area */}
      <div className="relative h-[150vh] flex flex-col items-center z-10 w-full">
        <div className="sticky top-[35vh] flex flex-col items-center text-center px-5">
          <h1 className="font-cinzel text-5xl md:text-7xl mb-5 drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)] tracking-widest text-white uppercase">
            Auror
          </h1>
          <p className="text-lg text-slate-200 max-w-2xl mb-8 font-sans drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            The city sleeps, but the Dark Knight never rests. Step into a world crafted for heroes and villains alike.
          </p>
          <button 
            onClick={handleAuth}
            disabled={isAuthenticating}
            className="px-8 py-3.5 border border-[#fce205] text-[#fce205] bg-black/50 hover:bg-[#fce205] hover:text-black hover:shadow-[0_0_20px_rgba(252,226,5,0.5)] uppercase tracking-[2px] rounded-full transition-all backdrop-blur-sm text-sm font-bold"
          >
            {isAuthenticating ? 'AUTHENTICATING...' : 'Join The Patrol'}
          </button>
        </div>
      </div>

      {/* Static City Section */}
      <div className="city-section pb-24 z-10">
        
        {/* City header text */}
        <div className="w-full flex flex-col items-center text-center py-24 relative px-6">
          <h1 className="font-cinzel text-3xl md:text-4xl text-white uppercase tracking-widest leading-relaxed text-center drop-shadow-xl">
            Our Showcase,<br/>Your Adventure!
          </h1>
        </div>

        {/* Live Threat Interception Simulator */}
        <section className="px-6 py-16 max-w-5xl mx-auto relative">
          <div className="text-center mb-12">
            <span className="text-xs font-sans text-[#fce205] tracking-[4px] uppercase font-bold">
              Threat Simulator
            </span>
            <h2 className="font-cinzel font-bold text-2xl sm:text-3xl text-white mt-3 tracking-wider">
              How Auror Intercepts Synthetic Resumes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Left: Fraud claim selector */}
            <div className="md:col-span-6 space-y-3">
              <div className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider drop-shadow-md">
                Select Candidate Resume Claim:
              </div>
              {fraudLies.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveFraudIndex(idx)}
                  className={`p-4 border rounded-sm cursor-pointer transition-all backdrop-blur-xl ${
                    activeFraudIndex === idx
                      ? 'bg-black/80 border-[#FCE205] text-white shadow-[0_0_15px_rgba(252,226,5,0.15)]'
                      : 'bg-black/50 border-white/20 text-slate-300 hover:text-white hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-500">CLAIM #{idx + 1}</span>
                    <span className="text-[#FCE205] flex items-center gap-1 font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      RISK: {item.risk}
                    </span>
                  </div>
                  <div className="font-sans text-sm font-semibold">
                    "{item.lie}"
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Auror Real-time Deconstruction */}
            <div className="md:col-span-6 bg-black/80 backdrop-blur-2xl border-2 border-white/10 rounded-sm p-5 flex flex-col justify-between relative overflow-hidden text-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2 text-[#fce205] font-cinzel font-bold tracking-widest text-xs">
                  <Cpu className="w-4 h-4" />
                  <span>ORACLE AST DISSECTOR</span>
                </div>
                <span className="px-2 py-0.5 bg-[#FF334B]/20 text-[#FF334B] border border-[#FF334B]/40 rounded text-[10px] font-bold font-mono">
                  FRAUD CONFIRMED
                </span>
              </div>

              <div className="space-y-4 font-sans">
                <div>
                  <div className="text-slate-400 text-xs font-bold tracking-wider uppercase mb-1">Evaluated Payload:</div>
                  <div className="text-white font-semibold italic text-base drop-shadow-md">
                    "{fraudLies[activeFraudIndex].lie}"
                  </div>
                </div>

                <div className="p-4 bg-red-950/40 border border-[#FF334B]/40 rounded-sm">
                  <div className="text-[#FF334B] text-[11px] font-bold tracking-[2px] uppercase drop-shadow-md">
                    [ ORACLE TELEMETRY VERDICT ]:
                  </div>
                  <div className="text-[#FF334B] font-black text-lg mt-1 tracking-wider uppercase drop-shadow-[0_0_15px_rgba(255,51,75,0.8)]">
                    {fraudLies[activeFraudIndex].verdict}
                  </div>
                </div>

                <div className="bg-black/60 p-4 border border-white/10 rounded space-y-2 text-xs font-mono">
                  <div className="text-slate-300">
                    &gt; GitHub Author Entropy: <span className="text-[#FF334B] font-bold">0.12 (Synthetic Copy)</span>
                  </div>
                  <div className="text-slate-300">
                    &gt; Git Tree Timestamp Delta: <span className="text-[#FF334B] font-bold">Anomaly Detected</span>
                  </div>
                  <div className="text-slate-300">
                    &gt; Zero-Day Arena Score: <span className="text-[#fce205] font-bold">Awaiting Live Code Test</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="px-6 py-16 max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <span className="text-xs font-sans text-[#fce205] tracking-[4px] uppercase font-bold">
              The Three Pillars
            </span>
            <h2 className="font-cinzel font-bold text-3xl text-white mt-3 tracking-wider">
              Engineered for Ground-Truth Recruitment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/70 backdrop-blur-xl border border-white/10 p-8 rounded-sm hover:border-[#fce205]/60 transition-colors">
              <div className="w-12 h-12 rounded-full bg-black border border-[#fce205] text-[#fce205] flex items-center justify-center mb-6">
                <GithubIcon className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel font-bold text-xl text-white mb-3 tracking-widest drop-shadow-md">
                Deep Git Codebase Auditing
              </h3>
              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                Connect your GitHub repository. Our engine parses commit frequency, code authorship diffs, AST entropy, and commit timestamp distributions to weed out cloned or bought repos.
              </p>
            </div>

            <div className="bg-black/70 backdrop-blur-xl border border-white/10 p-8 rounded-sm hover:border-[#fce205]/60 transition-colors">
              <div className="w-12 h-12 rounded-full bg-black border border-[#fce205] text-[#fce205] flex items-center justify-center mb-6">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel font-bold text-xl text-white mb-3 tracking-widest drop-shadow-md">
                Zero-Day LLM Assessments
              </h3>
              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                LeetCode problems are leaked and memorized. Auror crafts real-time dynamic algorithmic challenges with zero public search footprint, solved in a lockdown browser sandbox.
              </p>
            </div>

            <div className="bg-black/70 backdrop-blur-xl border border-white/10 p-8 rounded-sm hover:border-[#fce205]/60 transition-colors">
              <div className="w-12 h-12 rounded-full bg-black border border-[#fce205] text-[#fce205] flex items-center justify-center mb-6">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel font-bold text-xl text-white mb-3 tracking-widest drop-shadow-md">
                Cryptographic Trust Index
              </h3>
              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                Operatives receive an immutable, ECDSA-signed Trust Index and cryptographic skill badges that enterprises can immediately verify without conducting repetitive rounds.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
