from datetime import datetime, timezone
from app.extensions import db

class JobApplication(db.Model):
    __tablename__ = "job_applications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    placement_id = db.Column(db.Integer, db.ForeignKey("placements.id"), nullable=False)
    status = db.Column(db.String(50), default="applied", nullable=False) # applied, under_review, accepted, rejected
    applied_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    placement = db.relationship("Placement", backref="applications")

    def __repr__(self):
        return f"<JobApplication {self.id} User:{self.user_id} Placement:{self.placement_id}>"
