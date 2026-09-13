from typing import Dict, Any
from app.services.llm_gateway import LLMGateway

SYSTEM_PROMPT = """You are PlaceOracle Ingestion Intelligence.
You extract structured placement records from unstructured college placement emails, announcements, or messages.
You MUST output valid JSON ONLY with the following exact keys:
{
  "company_name": string (e.g. "Google", "Goldman Sachs"),
  "role": string or null (e.g. "Software Development Engineer - 1", "Data Analyst"),
  "ctc": float or null (Annual CTC in LPA, e.g. 18.5, 42.0. If given as monthly or per-year dollar, convert sensibly to LPA or null),
  "tech_stack": array of strings (e.g. ["Python", "Docker", "PostgreSQL", "React"]),
  "apply_url": string or null (The external application link/URL if present, e.g. "https://careers.google.com/...", else null)
}
Do NOT include markdown formatting or explanations. Output pure JSON only.
"""

def parse_placement_email(raw_email: str) -> Dict[str, Any]:
    user_prompt = f"Extract placement details from this raw email text:\n\n{raw_email}"
    extracted = LLMGateway.complete(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_format="json"
    )
    
    # Sanitize and ensure structure
    company = extracted.get("company_name") or "Unknown Company"
    role = extracted.get("role")
    apply_url = extracted.get("apply_url")
    
    ctc = extracted.get("ctc")
    if ctc is not None:
        try:
            ctc = float(ctc)
        except (ValueError, TypeError):
            ctc = None
            
    tech_stack = extracted.get("tech_stack")
    if not isinstance(tech_stack, list):
        tech_stack = []

    return {
        "company_name": company,
        "role": role,
        "ctc": ctc,
        "tech_stack": tech_stack,
        "apply_url": apply_url
    }
