export const mockAssessment = {
  id: "zero-day-0x7f",
  title: "TASK 0x7F: Real-Time Sybil Fraud Detection Filter",
  securityClearance: "LEVEL-4 BLACK PROTOCOL",
  timeLimitSeconds: 900, // 15 mins
  difficulty: "ELITE TACTICAL",
  language: "javascript",
  prompt: `// MISSION OBJECTIVE:
// You are defending the Auror recruitment gateway against a distributed Sybil attack.
// Malicious agents are submitting synthetically inflated GitHub commits with spoofed timestamps
// to bypass the verified Trust Index threshold.

// SPECIFICATION:
// Implement the function \`detectSybilBursts(commitStream, windowMs, maxBurstThreshold)\`:
//
// 1. \`commitStream\` is an array of commit telemetry objects:
//    { id: string, authorId: string, timestamp: number, entropyScore: number }
//
// 2. Identify all \`authorId\`s who produce strictly MORE than \`maxBurstThreshold\` commits
//    within ANY sliding window of duration \`windowMs\`.
//
// 3. Additionally, filter out false positives: if the author's average \`entropyScore\`
//    during that burst is >= 0.85, they are verified legitimate compiler-level generators.
//
// 4. Return an array of flagged author IDs sorted lexicographically.
//
// COMPLEXITY INVARIANT:
// Must achieve O(N log N) or O(N) runtime. Memory overhead must not exceed O(K).`,
  initialCode: `/**
 * Detects coordinated Sybil commit inflation attacks.
 * 
 * @param {Array<{id: string, authorId: string, timestamp: number, entropyScore: number}>} commitStream 
 * @param {number} windowMs 
 * @param {number} maxBurstThreshold 
 * @returns {string[]} Flagged author IDs
 */
function detectSybilBursts(commitStream, windowMs, maxBurstThreshold) {
  const flagged = new Set();
  
  // Group commits by author
  const authorCommits = new Map();
  for (const commit of commitStream) {
    if (!authorCommits.has(commit.authorId)) {
      authorCommits.set(commit.authorId, []);
    }
    authorCommits.get(commit.authorId).push(commit);
  }

  // Evaluate sliding window per operative
  for (const [authorId, commits] of authorCommits.entries()) {
    commits.sort((a, b) => a.timestamp - b.timestamp);
    
    let left = 0;
    let currentEntropySum = 0;
    
    for (let right = 0; right < commits.length; right++) {
      currentEntropySum += commits[right].entropyScore;
      
      while (commits[right].timestamp - commits[left].timestamp > windowMs) {
        currentEntropySum -= commits[left].entropyScore;
        left++;
      }
      
      const countInWindow = right - left + 1;
      if (countInWindow > maxBurstThreshold) {
        const avgEntropy = currentEntropySum / countInWindow;
        if (avgEntropy < 0.85) {
          flagged.add(authorId);
          break;
        }
      }
    }
  }

  return Array.from(flagged).sort();
}
`,
  testCases: [
    {
      id: "tc-1",
      name: "Standard Sybil Burst Detection",
      input: "commitStream (12 items), windowMs: 5000, threshold: 3",
      expected: '["sybil-bot-01", "sybil-bot-09"]',
      passed: true
    },
    {
      id: "tc-2",
      name: "High-Entropy Exemption (Compiler Generation)",
      input: "commitStream (8 items, entropy > 0.90)",
      expected: '[]',
      passed: true
    },
    {
      id: "tc-3",
      name: "Multi-Author Interleaved Sliding Windows",
      input: "commitStream (250 items, distributed timestamps)",
      expected: '["rogue-injector-44"]',
      passed: true
    }
  ]
};
