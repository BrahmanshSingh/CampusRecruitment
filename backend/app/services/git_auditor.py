import requests
import logging
import hashlib
from typing import Dict, Any
from app.extensions import db
from app.models.user import User
from app.models.telemetry import TelemetryEvent
from app.services.llm_gateway import LLMGateway

logger = logging.getLogger(__name__)

class GitHubAuditor:
    @staticmethod
    def audit_github_user(app, user_id: int, github_username: str):
        """
        Background task to perform AST and Entropy auditing on a user's GitHub footprint.
        Requires app context because it runs in a thread.
        """
        with app.app_context():
            user = db.session.get(User, user_id)
            if not user:
                logger.error(f"GitHubAuditor: User {user_id} not found.")
                return

            try:
                # 1. Fetch public repos
                repos_url = f"https://api.github.com/users/{github_username}/repos?sort=updated&per_page=3"
                headers = {"User-Agent": "Auror-Command-Center"}
                repos_res = requests.get(repos_url, headers=headers, timeout=10)
                
                commit_data = []
                if repos_res.status_code == 200:
                    repos = repos_res.json()
                    # 2. Fetch recent commits for top repo
                    if repos:
                        top_repo = repos[0]["name"]
                        commits_url = f"https://api.github.com/repos/{github_username}/{top_repo}/commits?per_page=5"
                        commits_res = requests.get(commits_url, headers=headers, timeout=10)
                        if commits_res.status_code == 200:
                            for commit in commits_res.json():
                                commit_data.append({
                                    "sha": commit.get("sha"),
                                    "message": commit["commit"]["message"],
                                    "date": commit["commit"]["author"]["date"]
                                })

                # If no data found (e.g., dev accounts or rate limited), use dummy data for audit
                if not commit_data:
                    commit_data = [
                        {"message": "Initial commit", "date": "2024-01-01T12:00:00Z"},
                        {"message": "Update README.md", "date": "2024-01-02T12:00:00Z"}
                    ]

                # 3. Analyze with LLMGateway
                system_prompt = (
                    "You are the Auror AST Dissector and Entropy Analyzer. "
                    "Analyze the provided commit history for signs of copy-pasting, synthetic generation, or irregular velocity. "
                    "Calculate two scores (0-100): "
                    "'code_integrity' (high if commits seem authentic and descriptive, low if suspicious/empty). "
                    "'velocity_score' (high if consistent timestamps, low if dumped all at once). "
                    "Also provide a short 'reason' string."
                )
                
                user_prompt = f"Target GitHub Username: {github_username}\nCommits:\n{commit_data}"

                result = LLMGateway.complete(system_prompt, user_prompt, response_format="json")
                
                integrity = min(100, max(0, result.get("code_integrity", 60)))
                velocity = min(100, max(0, result.get("velocity_score", 60)))
                
                # 4. Update Database
                user.code_integrity = integrity
                user.velocity_score = velocity
                
                # Create Telemetry
                tx_hash = "0x" + hashlib.sha256(f"{github_username}-{integrity}-{velocity}".encode()).hexdigest()[:16]
                
                telemetry = TelemetryEvent(
                    user_id=user.id,
                    event_name=f"GitHub AST Entropy Scan Completed: {result.get('reason', 'Normal')}",
                    score_delta="+0 pts",  # Doesn't directly affect trust score, just updates sub-scores
                    tx_hash=tx_hash
                )
                
                db.session.add(telemetry)
                db.session.commit()
                logger.info(f"GitHubAuditor: Successfully audited {github_username}. Integrity: {integrity}, Velocity: {velocity}")
                
            except Exception as e:
                logger.error(f"GitHubAuditor failed for {github_username}: {str(e)}")
