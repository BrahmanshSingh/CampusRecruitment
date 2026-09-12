from datetime import datetime, timezone
from app.extensions import db

class TelemetryEvent(db.Model):
    __tablename__ = "telemetry_events"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    event_name = db.Column(db.String(255), nullable=False)
    score_delta = db.Column(db.String(50), nullable=False)
    tx_hash = db.Column(db.String(66), nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<TelemetryEvent {self.event_name} ({self.score_delta})>"
