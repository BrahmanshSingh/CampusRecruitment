from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.extensions import db
from app.models.verification import Verification
from app.schemas import VerificationSchema, VerificationSubmitRequestSchema
from app.services.grader import grade_submission

submit_bp = Blueprint("submit", __name__)
verification_schema = VerificationSchema()
submit_req_schema = VerificationSubmitRequestSchema()

@submit_bp.route("/solution", methods=["POST"])
@jwt_required()
def submit_solution():
    """
    Submit Fixed Code for Anti-Cheat Verification & Real-time AI Grading
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
            verification_id:
              type: integer
              example: 1
            student_fix:
              type: string
              example: "def calculate_ctc(base, bonus):\n    return base + bonus"
    responses:
      200:
        description: Graded assessment result with pass/fail verdict
      400:
        description: Validation error or timeout exceeded
      403:
        description: Ownership error (cannot submit for another candidate)
      404:
        description: Verification record not found
    """
    user_id = int(get_jwt_identity())
    json_data = request.get_json() or {}

    try:
        data = dict(submit_req_schema.load(json_data))
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    verification_id = data["verification_id"]
    student_fix = data["student_fix"]

    verification = db.session.get(Verification, verification_id)
    if not verification:
        return jsonify({"error": "Verification session not found"}), 404

    # SECURITY CHECK: Ownership validation
    if verification.user_id != user_id:
        return jsonify({"error": "Unauthorized: Verification does not belong to your identity"}), 403

    now = datetime.now(timezone.utc)
    verification.submitted_at = now

    issued_at = verification.issued_at
    if issued_at and issued_at.tzinfo is None:
        issued_at = issued_at.replace(tzinfo=timezone.utc)

    elapsed_seconds = int((now - issued_at).total_seconds()) if issued_at else 0
    verification.time_taken_sec = max(0, elapsed_seconds)
    verification.student_fix = student_fix

    # HARD SERVER-SIDE TIMEOUT CHECK: Never trust client-reported time
    if elapsed_seconds > verification.timeout_seconds:
        verification.verdict = "timeout"
        verification.llm_feedback = f"Verification expired! Submitted in {elapsed_seconds}s, exceeding 300s threshold."
        db.session.commit()
        return jsonify({
            "message": "Submission rejected: 5-minute timeout exceeded.",
            "verification": verification_schema.dump(verification)
        }), 400

    try:
        # LLM Strict Judge grades the fix
        grade_result = grade_submission(
            broken_code=verification.broken_code,
            student_fix=student_fix,
            bug_count=verification.bug_count,
            language=verification.language
        )
    except Exception as e:
        return jsonify({"error": f"LLM Grading engine error: {str(e)}"}), 500

    verification.verdict = grade_result["verdict"]
    verification.llm_feedback = grade_result["feedback"]
    
    # Increment Trust Score and Telemetry if pass
    if verification.verdict == "pass":
        from app.models.telemetry import TelemetryEvent
        from app.models.user import User
        from app.models.skill_badge import SkillBadge
        import hashlib
        
        user = db.session.get(User, user_id)
        if user:
            user.trust_score = min(100, user.trust_score + 5)
            
            tx_hash = "0x" + hashlib.sha256(f"submit-{verification.id}-{user.trust_score}".encode()).hexdigest()[:16]
            telemetry = TelemetryEvent(
                user_id=user.id,
                event_name="Zero-Day Challenge Solved & Validated",
                score_delta="+5 pts",
                tx_hash=tx_hash
            )
            db.session.add(telemetry)

            # Mint Skill Badge
            badge = SkillBadge(
                user_id=user.id,
                skill_name=verification.claimed_skill,
                language=verification.language
            )
            db.session.add(badge)

    db.session.commit()

    return jsonify({
        "message": f"Verification completed with verdict: {verification.verdict.upper()}",
        "verdict": verification.verdict,
        "feedback": grade_result["feedback"],
        "annotated_code": grade_result.get("annotated_code"),
        "verification": verification_schema.dump(verification)
    }), 200
