from typing import Dict, Any
from app.services.llm_gateway import LLMGateway

SYSTEM_PROMPT = """You are PlaceOracle Strict Code Judge.
Your objective: Rigorously evaluate a student's fix against an original broken code challenge.

Rules:
1. Verify if the student successfully resolved the subtle zero-day bugs without introducing new syntax, logical, or runtime errors.
2. A verdict of "pass" is awarded ONLY if all intentional bugs are fixed cleanly and the logic is sound.
3. If partial or incomplete, verdict must be "fail".
4. Output valid JSON ONLY with this exact format:
{
  "verdict": "pass" | "fail",
  "bugs_fixed": integer,
  "total_bugs": integer,
  "feedback": string (2-3 sentences explaining exactly what was fixed or what was missed),
  "annotated_code": string (the student's code with concise inline comments explaining corrections or remaining flaws)
}
No Markdown backticks around the JSON.
"""

def grade_submission(broken_code: str, student_fix: str, bug_count: int, language: str = "python") -> Dict[str, Any]:
    user_prompt = f"""
Language: {language}
Expected Bug Count: {bug_count}

Original Broken Code:
\"\"\"
{broken_code}
\"\"\"

Student's Submitted Fix:
\"\"\"
{student_fix}
\"\"\"

Grade this submission thoroughly.
"""
    result = LLMGateway.complete(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_format="json"
    )

    verdict = result.get("verdict", "fail").lower()
    if verdict not in ["pass", "fail"]:
        verdict = "fail"

    return {
        "verdict": verdict,
        "bugs_fixed": int(result.get("bugs_fixed", 0)),
        "total_bugs": int(result.get("total_bugs", bug_count)),
        "feedback": result.get("feedback", "No feedback generated."),
        "annotated_code": result.get("annotated_code", student_fix)
    }
