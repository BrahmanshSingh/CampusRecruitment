from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.extensions import db
from app.models.verification import Verification
from app.schemas import VerificationSchema, VerificationGenerateRequestSchema
from app.services.interrogation import generate_interrogation_challenge

assessment_bp = Blueprint("assessment", __name__)
verification_schema = VerificationSchema()
gen_req_schema = VerificationGenerateRequestSchema()

@assessment_bp.route("/generate", methods=["POST"])
@jwt_required()
def generate_challenge():
    """
    Generate Anti-Cheat Zero-Day Broken Code Challenge
    ---
    tags:
      - Interrogation Room (Anti-Cheat)
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            claimed_skill:
              type: string
              example: "React"
            difficulty:
              type: string
              example: "medium"
            language:
              type: string
              example: "javascript"
    responses:
      201:
        description: Unique adversarial broken code challenge with 5-min timer
      400:
        description: Validation error
      500:
        description: LLM challenge generation failure
    """
    user_id = int(get_jwt_identity())
    json_data = request.get_json() or {}

    try:
        data = dict(gen_req_schema.load(json_data))
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    claimed_skill = data["claimed_skill"]
    difficulty = data.get("difficulty", "medium")
    language = data.get("language", "python")

    try:
        challenge = generate_interrogation_challenge(
            claimed_skill=claimed_skill,
            difficulty=difficulty,
            language=language
        )
    except Exception as e:
        return jsonify({"error": f"Failed to generate zero-day challenge: {str(e)}"}), 500

    verification = Verification(
        user_id=user_id,
        claimed_skill=claimed_skill,
        broken_code=challenge["broken_code"],
        language=challenge.get("language", language),
        bug_count=challenge.get("bug_count", 2),
        instructions=challenge.get("instructions"),
        timeout_seconds=300 # 5 minutes
    )
    db.session.add(verification)
    db.session.commit()

    return jsonify({
        "message": "Challenge generated. Timer initialized for 5 minutes (300 seconds).",
        "verification": verification_schema.dump(verification)
    }), 201

@assessment_bp.route("/active", methods=["GET"])
@jwt_required()
def get_active_verifications():
    """
    Get All Verifications for Current User
    ---
    tags:
      - Interrogation Room (Anti-Cheat)
    security:
      - Bearer: []
    responses:
      200:
        description: List of user's active and historical skill challenges
    """
    user_id = int(get_jwt_identity())
    records = Verification.query.filter_by(user_id=user_id).order_by(Verification.issued_at.desc()).all()
    return jsonify({
        "verifications": VerificationSchema(many=True).dump(records)
    }), 200
