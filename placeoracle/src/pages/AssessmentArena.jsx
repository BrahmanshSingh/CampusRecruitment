import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { CountdownTimer } from '../components/CountdownTimer';
import { mockAssessment } from '../data/mockAssessments';
import { useAuth } from '../context/AuthContext';
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
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function AssessmentArena() {
  const navigate = useNavigate();
  const { updateTrustIndex } = useAuth();
  const [code, setCode] = useState(mockAssessment.initialCode);
  const [language, setLanguage] = useState(mockAssessment.language);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('BRIEF'); // 'BRIEF' | 'OUTPUT'

  const handleRunTests = async () => {
    setIsRunningTests(true);
    setActiveTab('OUTPUT');
    // Simulate test execution against sandbox
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setTestResults(mockAssessment.testCases);
    setIsRunningTests(false);
  };

  const handleSubmit = async () => {
    // Run tests if not already run
    if (!testResults) {
      await handleRunTests();
    }
    // Fire celebratory confetti for winning hackathon demo
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FCE205', '#00F0FF', '#00FF9D', '#FFFFFF']
    });
    // Boost Trust Index by 5 points
    updateTrustIndex(5);
    setIsSubmitted(true);
  };

  const handleTimerExpiry = () => {
    alert("TIME WINDOW EXPIRED. Initiating emergency solution submission.");
    handleSubmit();
  };

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
            <span className="text-slate-300 font-semibold">{mockAssessment.title}</span>
          </div>
        </div>

        {/* Center/Right: Timer and Clearance */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#121624] border border-[#1E2638] rounded-sm font-mono text-[11px] text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>ANTI-CHEAT TELEMETRY ACTIVE</span>
          </div>

          <CountdownTimer
            initialSeconds={mockAssessment.timeLimitSeconds}
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
                    ? 'border-[#FCE205] text-[#FCE205] bg-[#0F1422]'
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
                    ? 'border-[#00F0FF] text-[#00F0FF] bg-[#0F1422]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                TEST OUTPUT {testResults && '(3/3 PASS)'}
              </button>
            </div>

            {/* Tab Content: Problem Brief */}
            {activeTab === 'BRIEF' ? (
              <div className="p-6 font-mono text-xs text-slate-300 space-y-5">
                <div className="p-3 bg-[#111624] border border-[#1E273E] rounded-sm text-slate-400 flex items-center justify-between">
                  <span>CLEARANCE: <strong className="text-[#FCE205]">{mockAssessment.securityClearance}</strong></span>
                  <span>DIFFICULTY: <strong className="text-[#FF334B]">{mockAssessment.difficulty}</strong></span>
                </div>

                <div>
                  <h3 className="text-white font-display font-bold text-base mb-2">
                    Algorithmic Invariant & Attack Vector
                  </h3>
                  <div className="bg-[#05070D] p-4 border border-[#161D2C] rounded-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {mockAssessment.prompt}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-bold mb-2">Expected Input Telemetry Sample:</h4>
                  <pre className="bg-[#05070D] p-3 border border-[#161D2C] rounded text-[11px] text-[#00F0FF] overflow-x-auto">
{`[
  { "id": "c-01", "authorId": "sybil-bot-01", "timestamp": 1000, "entropyScore": 0.2 },
  { "id": "c-02", "authorId": "sybil-bot-01", "timestamp": 1200, "entropyScore": 0.3 },
  { "id": "c-03", "authorId": "sybil-bot-01", "timestamp": 1400, "entropyScore": 0.2 },
  { "id": "c-04", "authorId": "sybil-bot-01", "timestamp": 1600, "entropyScore": 0.25 }
]`}
                  </pre>
                </div>
              </div>
            ) : (
              /* Tab Content: Test Execution Output */
              <div className="p-6 font-mono text-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#1A2234] pb-3">
                  <span className="text-slate-400">SANDBOX TEST CASES EXECUTION</span>
                  {isRunningTests ? (
                    <span className="text-[#FCE205] animate-pulse">RUNNING IN ISOLATED VM...</span>
                  ) : testResults ? (
                    <span className="text-[#00FF9D] font-bold">3 OF 3 PASSED (100%)</span>
                  ) : (
                    <span className="text-slate-500">NO TESTS RUN YET</span>
                  )}
                </div>

                {isRunningTests && (
                  <div className="p-4 bg-[#101420] border border-[#1E2638] rounded text-center text-[#FCE205] py-8">
                    <Cpu className="w-8 h-8 animate-spin mx-auto mb-3" />
                    <div>Executing Bytecode Verification Suite...</div>
                  </div>
                )}

                {!isRunningTests && testResults && (
                  <div className="space-y-3">
                    {testResults.map((tc) => (
                      <div key={tc.id} className="p-3 bg-[#0B1017] border border-[#1B2536] rounded-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white">{tc.name}</span>
                          <span className="px-2 py-0.5 bg-[#00FF9D]/20 text-[#00FF9D] text-[10px] rounded border border-[#00FF9D]/40 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            PASSED
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">Input: {tc.input}</div>
                        <div className="text-[11px] text-[#00FF9D] mt-0.5">Output matched: {tc.expected}</div>
                      </div>
                    ))}
                  </div>
                )}

                {!isRunningTests && !testResults && (
                  <div className="p-8 text-center text-slate-500 border border-dashed border-[#1E2638] rounded">
                    Click <strong>[ RUN TEST CASES ]</strong> to verify your solution against the algorithmic test harness.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#1A2234] bg-[#07090E] text-[10px] font-mono text-slate-500 flex justify-between">
            <span>ISOLATION: WASM ENCLAVE</span>
            <span className="text-[#FCE205]">ANTIGRAVITY RUNTIME</span>
          </div>
        </div>

        {/* Right Panel: Monaco Code Editor (55%) */}
        <div className="w-full md:w-[55%] flex flex-col justify-between bg-[#0B0E17]">
          {/* Editor Header */}
          <div className="px-4 py-2 bg-[#090C14] border-b border-[#1A2234] flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Code2 className="w-4 h-4 text-[#FCE205]" />
              <span>solution.js</span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#121624] border border-[#1E273D] text-slate-200 px-2.5 py-1 rounded text-xs outline-none"
              >
                <option value="javascript">JavaScript (ES2024)</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python 3.12</option>
              </select>
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
              Complexity Target: <span className="text-[#00F0FF]">O(N) Time · O(K) Space</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-[#121726] hover:bg-[#1A2236] border border-[#1E283F] text-slate-200 hover:text-white font-mono text-xs font-semibold tracking-wider rounded-sm transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 text-[#00F0FF]" />
                RUN TEST CASES
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#FCE205] hover:bg-[#ffe600] text-black font-mono text-xs font-bold tracking-wider rounded-sm shadow-[0_0_20px_rgba(252,226,5,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                SUBMIT FINAL SOLUTION
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Success Modal */}
      {isSubmitted && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F18] border-2 border-[#FCE205] max-w-lg w-full p-8 rounded-sm shadow-2xl relative text-center">
            <div className="w-16 h-16 rounded-full bg-[#FCE205]/10 border-2 border-[#FCE205] flex items-center justify-center mx-auto mb-4 glow-gold">
              <Award className="w-8 h-8 text-[#FCE205]" />
            </div>

            <span className="text-[11px] font-mono text-[#00FF9D] tracking-widest uppercase">
              ZERO-DAY CHALLENGE SOLVED & SIGNED
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-1 mb-2">
              Cryptographic Proof Verified!
            </h2>
            <p className="text-xs text-slate-300 font-mono mb-6 leading-relaxed">
              Your solution passed all automated test vectors with optimal algorithmic invariants.
              A cryptographic proof has been appended to your PlaceOracle telemetry stream.
            </p>

            <div className="bg-[#06080E] p-4 border border-[#1E2638] rounded text-left font-mono text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">TRUST SCORE INCREMENT:</span>
                <span className="text-[#00FF9D] font-bold">+5 POINTS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ECDSA SIGNATURE:</span>
                <span className="text-[#FCE205]">0x8e42...990d</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">EXECUTION RUNTIME:</span>
                <span className="text-slate-200">12ms (Optimal)</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-[#FCE205] hover:bg-[#ffe600] text-black font-mono font-bold text-xs tracking-wider rounded-sm shadow-[0_0_20px_rgba(252,226,5,0.4)] transition-all"
            >
              RETURN TO ORACLE DASHBOARD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
