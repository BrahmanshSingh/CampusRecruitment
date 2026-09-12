from typing import TYPE_CHECKING
from marshmallow import fields
from app.extensions import ma
from app.models.university import University
from app.models.user import User
from app.models.placement import Placement
from app.models.verification import Verification

if TYPE_CHECKING:
    from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
else:
    SQLAlchemyAutoSchema = ma.SQLAlchemyAutoSchema


class UniversitySchema(SQLAlchemyAutoSchema):
    class Meta:
        model = University
        load_instance = True
        include_relationships = False


from app.models.telemetry import TelemetryEvent

class TelemetryEventSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = TelemetryEvent
        load_instance = True
        include_fk = True

from app.models.skill_badge import SkillBadge

class SkillBadgeSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = SkillBadge
        load_instance = True
        include_fk = True

class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        include_relationships = False
        include_fk = True

    university_name = fields.Method("get_university_name", dump_only=True)
    telemetryStream = fields.Method("get_telemetry_stream", dump_only=True)
    skills = fields.Method("get_skills", dump_only=True)

    def get_university_name(self, obj):
        return obj.university.name if obj.university else None

    def get_telemetry_stream(self, obj):
        schema = TelemetryEventSchema(many=True)
        return schema.dump(obj.telemetry_events)

    def get_skills(self, obj):
        schema = SkillBadgeSchema(many=True)
        return schema.dump(obj.badges)


class PlacementSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Placement
        load_instance = True
        exclude = ("source_raw",)
        include_fk = True

    tech_stack = fields.List(fields.String(), dump_only=True)
    ctc = fields.Float(allow_none=True)


class PlacementIngestRequestSchema(ma.Schema):
    raw_email = fields.String(required=True)
    university_id = fields.Integer(load_default=1)


class VerificationGenerateRequestSchema(ma.Schema):
    claimed_skill = fields.String(required=True)
    difficulty = fields.String(load_default="medium")
    language = fields.String(load_default="python")


class VerificationSubmitRequestSchema(ma.Schema):
    verification_id = fields.Integer(required=True)
    student_fix = fields.String(required=True)


class VerificationSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Verification
        load_instance = True
        include_fk = True

    expires_at = fields.Method("get_expires_at", dump_only=True)

    def get_expires_at(self, obj):
        if obj.issued_at:
            from datetime import timedelta
            return (obj.issued_at + timedelta(seconds=obj.timeout_seconds)).isoformat()
        return None

