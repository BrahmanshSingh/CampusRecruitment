import json
from datetime import datetime, timezone
from app.extensions import db

class Placement(db.Model):
    __tablename__ = "placements"

    id = db.Column(db.Integer, primary_key=True)
    
    # HARD DATA ISOLATION PER UNIVERSITY
    university_id = db.Column(db.Integer, db.ForeignKey("universities.id"), nullable=False, index=True)
    
    company_name = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(255), nullable=True)
    ctc = db.Column(db.Float, nullable=True)  # in LPA
    _tech_stack = db.Column("tech_stack", db.Text, nullable=True) # JSON serialized string
    
    # Audit trail
    source_raw = db.Column(db.Text, nullable=True)
    ingested_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    ingested_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    @property
    def tech_stack(self):
        if not self._tech_stack:
            return []
        try:
            return json.loads(self._tech_stack)
        except Exception:
            return []

    @tech_stack.setter
    def tech_stack(self, val):
        if isinstance(val, list):
            self._tech_stack = json.dumps(val)
        elif isinstance(val, str):
            self._tech_stack = val
        else:
            self._tech_stack = json.dumps([])

    def __repr__(self):
        return f"<Placement {self.company_name} - {self.role} ({self.ctc} LPA)>"
