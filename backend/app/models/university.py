from datetime import datetime, timezone
from app.extensions import db

class University(db.Model):
    __tablename__ = "universities"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    domain = db.Column(db.String(100), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    users = db.relationship("User", backref="university", lazy=True)
    placements = db.relationship("Placement", backref="university", lazy=True)

    def __repr__(self):
        return f"<University {self.name}>"
