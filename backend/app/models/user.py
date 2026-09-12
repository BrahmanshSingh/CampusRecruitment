from datetime import datetime, timezone
from app.extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    github_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    role = db.Column(db.String(20), default="student", nullable=False)  # student | admin | recruiter
    
    # Multi-tenant isolation link
    university_id = db.Column(db.Integer, db.ForeignKey("universities.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    verifications = db.relationship("Verification", backref="user", lazy=True)
    ingested_placements = db.relationship("Placement", backref="ingester", lazy=True)

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"
