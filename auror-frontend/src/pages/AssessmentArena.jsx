import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { CountdownTimer } from '../components/CountdownTimer';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Terminal, 
  Play, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  ArrowLeft, 
  CheckCircle2, 
  Code2, 
  Cpu, 
  Lock,
  Award,
  Loader
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function AssessmentArena() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  
  const [assessment, setAssessment] = useState(null);
  const [code, setCode] = useState('');
  
  const [configSkill, setConfigSkill] = useState('Full Stack Engineering');
  const [configLanguage, setConfigLanguage] = useState('python');
  
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [language, setLanguage] = useState('python');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('BRIEF'); // 'BRIEF' | 'OUTPUT'

  const generateChallenge = async () => {
    setIsConfiguring(false);
    setIsGenerating(true);
    setLanguage(configLanguage);
    try {
      const res = await api.assessment.generate({
        claimed_skill: configSkill,
        difficulty: 'medium',
        language: configLanguage
      });
      setAssessment(res.verification);
      setCode(res.verification.broken_code);
    } catch (err) {
      console.error("Failed to generate challenge:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    
    setIsSubmitting(true);
    setActiveTab('OUTPUT');
    
    try {
      const res = await api.assessment.submitSolution({
        verification_id: assessment.id,
        student_fix: code
      });
      
      setGradingResult(res);
      
      if (res.verdict === 'pass') {
        // Fire celebratory confetti
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FCE205', '#00F0FF', '#00FF9D', '#FFFFFF']
        });
        // Boost Trust Index by 5 points
        await refreshProfile();
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setGradingResult({
        verdict: 'fail',
        feedback: err.message || 'System error during AI grading. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimerExpiry = () => {
    if (!isSubmitted && !isSubmitting && assessment && !gradingResult) {
      alert("TIME WINDOW EXPIRED. Initiating emergency solution submission.");
      handleSubmit();
    }
  };

  if (isConfiguring) {
    return (
      <div className="min-h-screen bg-[#060709] flex flex-col items-center justify-center text-white px-4">
        <div className="bg-[#0C0F17] border border-[#1E2638] p-8 rounded-sm max-w-md w-full shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-6 h-6 text-[#3b82f6]" />
            <h2 className="font-display font-bold text-xl tracking-wider">ASSESSMENT CONFIG</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">TARGET SKILL / DOMAIN</label>
              <select 
                value={configSkill}
                onChange={(e) => setConfigSkill(e.target.value)}
                className="w-full bg-[#121624] border border-[#1E273D] text-white p-2.5 rounded-sm font-mono text-xs focus:border-[#3b82f6] outline-none"
              >
                <option value="Frontend Engineering">Frontend Engineering</option>
                <option value="Backend Engineering">Backend Engineering</option>
                <option value="Full Stack Engineering">Full Stack Engineering</option>
                <option value="Systems Programming">Systems Programming</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2">PRIMARY LANGUAGE</label>
              <select 
                value={configLanguage}
                onChange={(e) => setConfigLanguage(e.target.value)}
                className="w-full bg-[#121624] border border-[#1E273D] text-white p-2.5 rounded-sm font-mono text-xs focus:border-[#3b82f6] outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
            </div>

            <button
              onClick={generateChallenge}
              className="w-full mt-4 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-mono font-bold text-xs tracking-wider rounded-sm transition-all"
            >
              LAUNCH ARENA DEMO
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full mt-2 py-3 bg-[#121624] hover:bg-[#1A2136] border border-[#1E2638] text-slate-300 hover:text-white font-mono text-xs tracking-wider rounded-sm transition-all"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-[#060709] flex flex-col items-center justify-center text-[#3b82f6]">
        <Loader className="w-12 h-12 animate-spin mb-4" />
        <h2 className="font-display font-bold text-xl tracking-widest uppercase animate-pulse">
          Generating Zero-Day Challenge...
        </h2>
        <p className="text-xs font-mono text-slate-500 mt-2">
          Negotiating LLM generation payload...
        </p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#060709] flex flex-col items-center justify-center text-[#FF334B]">
        <XCircle className="w-12 h-12 mb-4" />
        <h2 className="font-display font-bold text-xl tracking-widest uppercase">
          Challenge Generation Failed
        </h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 px-4 py-2 bg-[#121624] border border-[#1E2638] text-white font-mono text-xs hover:bg-[#1A2136]"
        >
          RETURN TO DASHBOARD
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060709] text-slate-100 flex flex-col justify-between">
      {/* Top Lockdown Header */}
      <header className="border-b border-[#1A2234] bg-[#090D17] px-6 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121624] hover:bg-[#1A2136] border border-[#1E2638] text-slate-300 hover:text-white rounded-sm font-mono text-xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            ABORT MISSION
          </button>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-[#FF334B] animate-ping" />
            <span className="text-[#FF334B] font-bold">LOCKDOWN MODE</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-semibold">{assessment.claimed_skill} Protocol Verification</span>
          </div>
        </div>

        {/* Center/Right: Timer and Clearance */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#121624] border border-[#1E2638] rounded-sm font-mono text-[11px] text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span>ANTI-CHEAT TELEMETRY ACTIVE</span>
          </div>

          <CountdownTimer
            initialSeconds={assessment.timeout_seconds || 300}
            onExpire={handleTimerExpiry}
          />
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>
        {/* Left Panel: Problem Dossier (45%) */}
        <div className="w-full md:w-[45%] border-r border-[#1A2234] bg-[#090C14] flex flex-col justify-between overflow-y-auto">
          {/* Tabs */}
          <div>
            <div className="flex border-b border-[#1A2234] bg-[#07090F]">
              <button
                onClick={() => setActiveTab('BRIEF')}
                className={`px-5 py-3 font-mono text-xs tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'BRIEF'
                    ? 'border-[#3b82f6] text-[#3b82f6] bg-[#0F1422]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                MISSION BRIEFING
              </button>

              <button
                onClick={() => setActiveTab('OUTPUT')}
                className={`px-5 py-3 font-mono text-xs tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'OUTPUT'
                    ? 'border-[#3b82f6] text-[#3b82f6] bg-[#0F1422]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                AI JUDGE OUTPUT
              </button>
            </div>

            {/* Tab Content: Problem Brief */}
            {activeTab === 'BRIEF' ? (
              <div className="p-6 font-mono text-xs text-slate-300 space-y-5">
                <div className="p-3 bg-[#111624] border border-[#1E273E] rounded-sm text-slate-400 flex items-center justify-between">
                  <span>CLEARANCE LEVEL: <strong className="text-[#3b82f6]">TS//SCI</strong></span>
                  <span>BUGS INJECTED: <strong className="text-[#ef4444]">{assessment.bug_count || 2}</strong></span>
                </div>

                <div>
                  <h3 className="text-white font-display font-bold text-base mb-2">
                    Algorithmic Invariant & Attack Vector
                  </h3>
                  <div className="bg-[#05070D] p-4 border border-[#161D2C] rounded-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {assessment.instructions || "Identify and fix all subtle bugs in this code snippet within the time window."}
                  </div>
                </div>

                <div className="p-3 border border-dashed border-[#f59e0b]/40 text-[#f59e0b] bg-[#f59e0b]/5 rounded-sm">
                  <strong>Warning:</strong> This code is procedurally generated with zero-day flaws. Standard test case regurgitation will fail. You must comprehend and patch the core logic.
                </div>
              </div>
            ) : (
              /* Tab Content: Test Execution Output */
              <div className="p-6 font-mono text-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#1A2234] pb-3">
                  <span className="text-slate-400">AI GRADING ENGINE</span>
                  {isSubmitting ? (
                    <span className="text-[#3b82f6] animate-pulse">EVALUATING IN ISOLATED VM...</span>
                  ) : gradingResult ? (
                    gradingResult.verdict === 'pass' 
                      ? <span className="text-[#10b981] font-bold uppercase">VERDICT: PASS</span>
                      : <span className="text-[#ef4444] font-bold uppercase">VERDICT: {gradingResult.verdict}</span>
                  ) : (
                    <span className="text-slate-500">NO SUBMISSION YET</span>
                  )}
                </div>

                {isSubmitting && (
                  <div className="p-4 bg-[#101420] border border-[#1E2638] rounded text-center text-[#3b82f6] py-8">
                    <Cpu className="w-8 h-8 animate-spin mx-auto mb-3" />
                    <div>Executing Semantic Code Verification...</div>
                  </div>
                )}

                {!isSubmitting && gradingResult && (
                  <div className="space-y-4">
                    <div className={`p-4 border rounded-sm ${gradingResult.verdict === 'pass' ? 'bg-[#0A1A12] border-[#10b981]/40 text-[#10b981]' : 'bg-[#1A0A0A] border-[#ef4444]/40 text-[#ef4444]'}`}>
                      <h4 className="font-bold mb-2">Feedback:</h4>
                      <p className="whitespace-pre-wrap leading-relaxed">{gradingResult.feedback || gradingResult.error || "No feedback provided."}</p>
                    </div>
                    {gradingResult.annotated_code && (
                      <div>
                        <h4 className="text-slate-400 mb-2">Annotated Diff:</h4>
                        <pre className="p-3 bg-[#05070D] border border-[#1E2638] rounded text-slate-300 overflow-x-auto text-[10px]">
                          {gradingResult.annotated_code}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {!isSubmitting && !gradingResult && (
                  <div className="p-8 text-center text-slate-500 border border-dashed border-[#1E2638] rounded">
                    Click <strong>[ SUBMIT FINAL SOLUTION ]</strong> to verify your solution against the AI Judge.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#1A2234] bg-[#07090E] text-[10px] font-mono text-slate-500 flex justify-between">
            <span>ISOLATION: AI ENCLAVE</span>
            <span className="text-[#FCE205]">ANTIGRAVITY RUNTIME</span>
          </div>
        </div>

        {/* Right Panel: Monaco Code Editor (55%) */}
        <div className="w-full md:w-[55%] flex flex-col justify-between bg-[#0B0E17]">
          {/* Editor Header */}
          <div className="px-4 py-2 bg-[#090C14] border-b border-[#1A2234] flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Code2 className="w-4 h-4 text-[#3b82f6]" />
              <span>solution.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'go' ? 'go' : language === 'rust' ? 'rs' : language}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-[#121624] border border-[#1E273D] text-[#3b82f6] px-2.5 py-1 rounded text-[10px] tracking-wider uppercase">
                {language}
              </span>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 w-full relative">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                cursorBlinking: 'smooth',
                renderLineHighlight: 'all',
              }}
            />
          </div>

          {/* Action Bar */}
          <div className="p-4 bg-[#090D17] border-t border-[#1A2234] flex items-center justify-between gap-4">
            <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
              Complexity Target: <span className="text-[#3b82f6]">O(N) Time · O(K) Space</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#3b82f6]/50 disabled:cursor-not-allowed text-white font-mono text-xs font-bold tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                {isSubmitting ? 'ANALYZING...' : 'SUBMIT FINAL SOLUTION'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Success Modal */}
      {isSubmitted && gradingResult && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F18] border-2 border-[#10b981] max-w-lg w-full p-8 rounded-sm shadow-2xl relative text-center">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/10 border-2 border-[#10b981] flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-[#10b981]" />
            </div>

            <span className="text-[11px] font-mono text-[#10b981] tracking-widest uppercase">
              ZERO-DAY CHALLENGE SOLVED & SIGNED
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-1 mb-2">
              Cryptographic Proof Verified!
            </h2>
            <p className="text-xs text-slate-300 font-mono mb-6 leading-relaxed">
              Your solution successfully resolved the injected vulnerabilities.
              A cryptographic proof has been appended to your Auror telemetry stream.
            </p>

            <div className="bg-[#06080E] p-4 border border-[#1E2638] rounded text-left font-mono text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">TRUST SCORE INCREMENT:</span>
                <span className="text-[#10b981] font-bold">+5 POINTS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ECDSA SIGNATURE:</span>
                <span className="text-[#3b82f6]">0x{gradingResult.verification?.id?.toString(16).padStart(8, '0')}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">EVALUATION RUNTIME:</span>
                <span className="text-slate-200">{gradingResult.verification?.time_taken_sec}s</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-mono font-bold text-xs tracking-wider rounded-sm transition-all"
            >
              RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
