import uuid
from typing import Dict, Any
from app.services.llm_gateway import LLMGateway

SYSTEM_PROMPT = """You are PlaceOracle Interrogation Room - an adversarial zero-day code challenge generator.
Your objective: Prevent resume fraud by testing if a candidate who claims a specific tech skill actually knows how to debug realistic, production-like broken code.

Rules:
1. Generate an authentic, realistic code snippet in the target language implementing a small realistic feature or algorithm.
2. Inject exactly 2 to 3 SUBTLE, ZERO-DAY BUGS into the code (e.g. state mutation, off-by-one error, race condition, closure capture mistake, null reference, unhandled edge-case).
3. Do NOT provide comments or hints pointing directly to where the bugs are.
4. Output valid JSON ONLY with this exact structure:
{
  "language": string,
  "broken_code": string,
  "bug_count": integer,
  "instructions": string,
  "expected_solution_summary": string
}
Never include Markdown backticks outside the JSON.
"""

def generate_interrogation_challenge(claimed_skill: str, difficulty: str = "medium", language: str = "python") -> Dict[str, Any]:
    # Pass a cryptographic / unique seed to guarantee zero-day freshness and avoid duplicates
    challenge_seed = uuid.uuid4().hex[:8]
    user_prompt = f"""
Candidate claimed skill: {claimed_skill}
Language: {language}
Difficulty: {difficulty}
Entropy Seed: {challenge_seed}

Generate a concise, self-contained realistic broken code snippet.
"""
    result = LLMGateway.complete(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_format="json"
    )
    
    return {
        "language": result.get("language", language),
        "broken_code": result.get("broken_code", ""),
        "bug_count": int(result.get("bug_count", 2)),
        "instructions": result.get("instructions", "Identify and fix all subtle bugs in this code snippet within 5 minutes."),
        "expected_solution_summary": result.get("expected_solution_summary", "")
    }
