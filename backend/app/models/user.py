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
    
    # Trust Metrics
    trust_score = db.Column(db.Integer, default=50, nullable=False)
    code_integrity = db.Column(db.Integer, default=50, nullable=False)
    velocity_score = db.Column(db.Integer, default=50, nullable=False)

    # Multi-tenant isolation link
    university_id = db.Column(db.Integer, db.ForeignKey("universities.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    verifications = db.relationship("Verification", backref="user", lazy=True)
    ingested_placements = db.relationship("Placement", backref="ingester", lazy=True)
    telemetry_events = db.relationship("TelemetryEvent", backref="user", lazy=True, order_by="desc(TelemetryEvent.timestamp)")
    applications = db.relationship("JobApplication", backref="user", lazy=True)
    badges = db.relationship("SkillBadge", backref="user", lazy=True)

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"
