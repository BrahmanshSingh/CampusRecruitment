from typing import Dict, Any, Optional
import requests
from flask import current_app

class GitHubOAuthService:
    @classmethod
    def get_authorization_url(cls, state: Optional[str] = None) -> str:
        client_id = current_app.config.get("GITHUB_CLIENT_ID")
        redirect_uri = current_app.config.get("GITHUB_CALLBACK_URL")
        scope = "read:user user:email"
        url = f"https://github.com/login/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&scope={scope}"
        if state:
            url += f"&state={state}"
        return url

    @classmethod
    def exchange_code_for_token(cls, code: str) -> str:
        client_id = current_app.config.get("GITHUB_CLIENT_ID")
        client_secret = current_app.config.get("GITHUB_CLIENT_SECRET")
        redirect_uri = current_app.config.get("GITHUB_CALLBACK_URL")

        url = "https://github.com/login/oauth/access_token"
        headers = {"Accept": "application/json"}
        payload = {
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "redirect_uri": redirect_uri
        }

        res = requests.post(url, json=payload, headers=headers, timeout=15)
        res.raise_for_status()
        data = res.json()

        access_token = data.get("access_token")
        if not access_token:
            error_desc = data.get("error_description", "Failed to retrieve GitHub access token.")
            raise ValueError(error_desc)

        return access_token

    @classmethod
    def fetch_github_user(cls, access_token: str) -> Dict[str, Any]:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        res = requests.get("https://api.github.com/user", headers=headers, timeout=15)
        res.raise_for_status()
        user_data = res.json()

        # Try to get primary email if private
        email = user_data.get("email")
        if not email:
            try:
                emails_res = requests.get("https://api.github.com/user/emails", headers=headers, timeout=10)
                if emails_res.status_code == 200:
                    emails = emails_res.json()
                    for entry in emails:
                        if entry.get("primary") and entry.get("verified"):
                            email = entry.get("email")
                            break
            except Exception:
                pass

        return {
            "github_id": str(user_data.get("id")),
            "username": user_data.get("login"),
            "name": user_data.get("name") or user_data.get("login"),
            "email": email,
            "avatar_url": user_data.get("avatar_url")
        }
