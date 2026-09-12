from datetime import datetime, timezone
from app.extensions import db

class SkillBadge(db.Model):
    __tablename__ = "skill_badges"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    skill_name = db.Column(db.String(100), nullable=False)
    language = db.Column(db.String(50), nullable=False)
    earned_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<SkillBadge {self.skill_name} ({self.language}) for User:{self.user_id}>"
