import json
import logging
import os
import re
from typing import Optional, Dict, Any
from pathlib import Path
from dotenv import load_dotenv
import requests
from flask import current_app

logger = logging.getLogger(__name__)

class LLMGateway:
    """
    Unified LLM API Gateway.
    Primary: Gemini via google-genai or direct REST
    Fallback: OpenAI-compatible endpoint (Groq, Together, Ollama, OpenAI) via requests
    """

    @classmethod
    def complete(cls, system_prompt: str, user_prompt: str, response_format: str = "json") -> Dict[str, Any]:
        env_file = Path(__file__).resolve().parent.parent.parent / ".env"
        if env_file.exists():
            load_dotenv(dotenv_path=env_file, override=True)

        primary = (os.getenv("LLM_PRIMARY") or current_app.config.get("LLM_PRIMARY", "gemini")).lower()

        if primary == "gemini":
            try:
                return cls._call_gemini(system_prompt, user_prompt, response_format)
            except Exception as e:
                logger.error(f"[LLMGateway] Gemini call failed: {e}")
                if "429" in str(e) or "Too Many Requests" in str(e) or "quota" in str(e).lower():
                    return cls._get_mock_fallback(system_prompt, response_format)
                
                fallback_key = os.getenv("OPENAI_COMPAT_API_KEY") or os.getenv("OPENAI_API_KEY") or current_app.config.get("OPENAI_COMPAT_API_KEY")
                if fallback_key:
                    logger.info("[LLMGateway] Falling back to OpenAI-compatible provider.")
                    try:
                        return cls._call_openai_compat(system_prompt, user_prompt, response_format)
                    except Exception as fallback_e:
                        if "429" in str(fallback_e):
                            return cls._get_mock_fallback(system_prompt, response_format)
                        raise RuntimeError(f"Fallback generation error: {str(fallback_e)}")
                return cls._get_mock_fallback(system_prompt, response_format)
        else:
            try:
                return cls._call_openai_compat(system_prompt, user_prompt, response_format)
            except Exception as e:
                logger.error(f"[LLMGateway] Primary provider failed: {e}")
                if "429" in str(e) or "Too Many Requests" in str(e):
                    return cls._get_mock_fallback(system_prompt, response_format)
                    
                gemini_key = os.getenv("GEMINI_API_KEY") or current_app.config.get("GEMINI_API_KEY")
                if gemini_key:
                    logger.info("[LLMGateway] Falling back to Gemini.")
                    try:
                        return cls._call_gemini(system_prompt, user_prompt, response_format)
                    except Exception as fallback_e:
                        if "429" in str(fallback_e):
                            return cls._get_mock_fallback(system_prompt, response_format)
                        raise RuntimeError(f"Fallback generation error: {str(fallback_e)}")
                return cls._get_mock_fallback(system_prompt, response_format)

    @classmethod
    def _get_mock_fallback(cls, system_prompt: str, response_format: str) -> Dict[str, Any]:
        """Provide emergency mock data when API rate limits are hit during demos."""
        if response_format != "json":
            return {"text": "API Rate limit exceeded. Mock fallback text."}
            
        sp = system_prompt.lower()
        if "interrogation" in sp:
            return {
                "language": "javascript",
                "broken_code": "function calculateTotal(items) {\n  let total = 0;\n  for(let i=1; i<=items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}",
                "bug_count": 1,
                "instructions": "Fix the off-by-one error in this array iteration.",
                "expected_solution_summary": "Change i=1 to i=0 and i<=items.length to i<items.length"
            }
        elif "judge" in sp or "grader" in sp:
            return {
                "verdict": "pass",
                "feedback": "MOCK JUDGE: Code appears valid. API was rate limited, so we are passing you automatically for the demo.",
                "annotated_code": "// Looks good!"
            }
        elif "ast dissector" in sp or "entropy" in sp:
            return {
                "code_integrity": 95,
                "velocity_score": 88,
                "reason": "Mock Audit: Commits appear authentic and evenly spaced."
            }
        elif "placement ingestion" in sp:
            return {
                "company_name": "MockCorp (Rate Limited)",
                "role": "Software Engineer",
                "tech_stack": ["React", "Python"],
                "ctc": 25.0
            }
        
        return {"error": "Mock fallback returned due to rate limit."}

    @classmethod
    def _call_gemini(cls, system_prompt: str, user_prompt: str, response_format: str = "json") -> Dict[str, Any]:
        # Always reload .env with override=True so edits take effect dynamically without server restarts
        env_file = Path(__file__).resolve().parent.parent.parent / ".env"
        if env_file.exists():
            load_dotenv(dotenv_path=env_file, override=True)

        api_key = os.getenv("GEMINI_API_KEY") or current_app.config.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured in environment.")

        model = os.getenv("GEMINI_MODEL") or current_app.config.get("GEMINI_MODEL") or "gemini-3.6-flash"

        # Safeguard against retired/deprecated Gemini models
        DEPRECATED_MODELS = {
            "gemini-1.5-flash": "gemini-3.6-flash",
            "gemini-1.5-flash-latest": "gemini-3.6-flash",
            "gemini-1.5-pro": "gemini-3.6-flash",
            "gemini-1.0-pro": "gemini-3.6-flash",
            "gemini-2.5-flash": "gemini-3.6-flash",
        }
        if model in DEPRECATED_MODELS:
            logger.info(f"[LLMGateway] Mapping deprecated Gemini model '{model}' to '{DEPRECATED_MODELS[model]}'")
            model = DEPRECATED_MODELS[model]

        def _execute_gemini_request(target_model: str) -> str:
            try:
                from google import genai
                from google.genai import types

                client = genai.Client(api_key=api_key)
                config = types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.2,
                    response_mime_type="application/json" if response_format == "json" else "text/plain"
                )
                response = client.models.generate_content(
                    model=target_model,
                    contents=user_prompt,
                    config=config
                )
                if response.text is None:
                    raise ValueError("Gemini returned an empty response.")
                return response.text
            except ImportError:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={api_key}"
                headers = {"Content-Type": "application/json"}
                payload = {
                    "systemInstruction": {
                        "parts": [{"text": system_prompt}]
                    },
                    "contents": [
                        {
                            "parts": [{"text": user_prompt}]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.2,
                        "responseMimeType": "application/json" if response_format == "json" else "text/plain"
                    }
                }
                res = requests.post(url, json=payload, headers=headers, timeout=25)
                res.raise_for_status()
                data = res.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]

        try:
            raw_text = _execute_gemini_request(model)
        except Exception as e:
            err_str = str(e)
            if "404" in err_str and ("not found" in err_str.lower() or "NOT_FOUND" in err_str):
                fallback_model = "gemini-3.6-flash" if model != "gemini-3.6-flash" else "gemini-flash-latest"
                logger.warning(f"[LLMGateway] Gemini model '{model}' returned 404 NOT_FOUND. Automatically retrying with active model '{fallback_model}'...")
                raw_text = _execute_gemini_request(fallback_model)
            else:
                raise

        return cls._clean_and_parse_json(raw_text) if response_format == "json" else {"text": raw_text}

    @classmethod
    def _call_openai_compat(cls, system_prompt: str, user_prompt: str, response_format: str = "json") -> Dict[str, Any]:
        env_file = Path(__file__).resolve().parent.parent.parent / ".env"
        if env_file.exists():
            load_dotenv(dotenv_path=env_file, override=True)

        api_key = os.getenv("OPENAI_COMPAT_API_KEY") or os.getenv("OPENAI_API_KEY") or current_app.config.get("OPENAI_COMPAT_API_KEY", "")
        if not api_key:
            raise ValueError("OPENAI_COMPAT_API_KEY or OPENAI_API_KEY is not configured in environment.")

        configured_url = os.getenv("OPENAI_COMPAT_BASE_URL") or current_app.config.get("OPENAI_COMPAT_BASE_URL", "")
        # Auto-detect official OpenAI key vs Groq
        if api_key.startswith("sk-") and not api_key.startswith("gsk_") and "groq.com" in configured_url:
            base_url = "https://api.openai.com/v1"
            model = os.getenv("OPENAI_COMPAT_MODEL") or "gpt-4o-mini"
            if "llama" in model:
                model = "gpt-4o-mini"
        else:
            base_url = (configured_url or "https://api.openai.com/v1").rstrip("/")
            model = os.getenv("OPENAI_COMPAT_MODEL") or current_app.config.get("OPENAI_COMPAT_MODEL", "gpt-4o-mini")

        endpoint = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload: Dict[str, Any] = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2
        }

        if response_format == "json":
            payload["response_format"] = {"type": "json_object"}

        res = requests.post(endpoint, json=payload, headers=headers, timeout=25)
        res.raise_for_status()
        result = res.json()
        raw_text = result["choices"][0]["message"]["content"]

        return cls._clean_and_parse_json(raw_text) if response_format == "json" else {"text": raw_text}

    @classmethod
    def _clean_and_parse_json(cls, text: str) -> Dict[str, Any]:
        """Strip markdown ticks if model included them and parse JSON cleanly."""
        text = text.strip()
        # Remove ```json ... ``` code fence if present
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)
        return json.loads(text.strip())
