from datetime import datetime, timezone
from app.extensions import db

class Verification(db.Model):
    __tablename__ = "verifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    
    claimed_skill = db.Column(db.String(100), nullable=False)
    broken_code = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(50), default="python", nullable=False)
    bug_count = db.Column(db.Integer, default=2)
    instructions = db.Column(db.Text, nullable=True)

    # Timing & Verification Status
    issued_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    submitted_at = db.Column(db.DateTime, nullable=True)
    timeout_seconds = db.Column(db.Integer, default=300, nullable=False) # 5-minute hard stop
    
    # Submissions and grading
    student_fix = db.Column(db.Text, nullable=True)
    verdict = db.Column(db.String(20), default="pending", nullable=False) # pending | pass | fail | timeout
    llm_feedback = db.Column(db.Text, nullable=True)
    time_taken_sec = db.Column(db.Integer, nullable=True)

    def is_expired(self) -> bool:
        if not self.issued_at:
            return False
        issued = self.issued_at if self.issued_at.tzinfo else self.issued_at.replace(tzinfo=timezone.utc)
        elapsed = (datetime.now(timezone.utc) - issued).total_seconds()
        return elapsed > self.timeout_seconds

    def __repr__(self):
        return f"<Verification #{self.id} Skill:{self.claimed_skill} Verdict:{self.verdict}>"
