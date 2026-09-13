from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt
from marshmallow import ValidationError
from app.extensions import db
from app.models.placement import Placement
from app.models.application import JobApplication
from app.schemas import PlacementSchema, PlacementIngestRequestSchema
from app.services.ingest_parser import parse_placement_email

ingest_bp = Blueprint("ingest", __name__)
placement_schema = PlacementSchema()
placements_schema = PlacementSchema(many=True)
ingest_req_schema = PlacementIngestRequestSchema()

@ingest_bp.route("/webhook", methods=["POST"])
def email_webhook():
    """
    Ingest Raw Placement Email via Webhook (Unstructured Email -> LLM -> DB)
    ---
    tags:
      - Ingestion Engine
    parameters:
      - in: header
        name: X-Webhook-Secret
        type: string
        required: false
        description: Shared secret key for incoming email webhooks
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            raw_email:
              type: string
              example: "Campus Placement Update: Google visited Thapar Institute offering SDE-1 roles with 32 LPA CTC. Required stack: Go, Kubernetes, C++, Distributed Systems."
            university_id:
              type: integer
              example: 1
    responses:
      201:
        description: Extracted and structured placement record successfully stored
      400:
        description: Invalid request payload
      403:
        description: Webhook secret verification failed
    """
    secret = request.headers.get("X-Webhook-Secret")
    expected_secret = current_app.config.get("WEBHOOK_SECRET")
    if expected_secret and secret and secret != expected_secret:
        return jsonify({"error": "Unauthorized webhook signature"}), 403

    json_data = request.get_json() or {}
    try:
        validated_data = dict(ingest_req_schema.load(json_data))
    except ValidationError as err:
        return jsonify({"errors": err.messages}), 400

    raw_email = validated_data["raw_email"]
    is_off_campus = json_data.get("is_off_campus", False)
    if is_off_campus:
        university_id = None
    else:
        university_id = json_data.get("university_id", 1) # Default to tenant 1 if not specified

    try:
        # LLM Gateway extracts structured parameters
        extracted = parse_placement_email(raw_email)
    except Exception as e:
        return jsonify({"error": f"LLM Ingestion extraction failed: {str(e)}"}), 500

    placement = Placement(
        university_id=university_id,
        is_off_campus=is_off_campus,
        company_name=extracted["company_name"],
        role=extracted["role"],
        ctc=extracted["ctc"],
        apply_url=extracted["apply_url"],
        source_raw=raw_email
    )
    placement.tech_stack = extracted["tech_stack"]

    db.session.add(placement)
    db.session.commit()

    return jsonify({
        "message": "Placement email successfully ingested and parsed",
        "placement": placement_schema.dump(placement)
    }), 201

@ingest_bp.route("/placements", methods=["GET"])
@jwt_required()
def list_placements():
    """
    List Placements Strictly Scoped to Tenant University
    ---
    tags:
      - Ingestion Engine
    security:
      - Bearer: []
    responses:
      200:
        description: Array of placements belonging to the caller's university
    """
    claims = get_jwt()
    uni_id = claims.get("university_id")
    if not uni_id:
        return jsonify({"error": "No university_id associated with this identity"}), 403

    query_str = request.args.get("query", "").strip().lower()
    tier_str = request.args.get("tier", "").strip()
    domain_str = request.args.get("domain", "in-campus").strip().lower()

    if domain_str == "off-campus":
        base_query = Placement.query.filter_by(is_off_campus=True)
    else:
        # MULTI-TENANT ISOLATION: Never return records from outside caller's university
        base_query = Placement.query.filter_by(university_id=uni_id)

    if query_str:
        # Search by company name or role
        base_query = base_query.filter(
            db.or_(
                db.func.lower(Placement.company_name).contains(query_str),
                db.func.lower(Placement.role).contains(query_str)
            )
        )

    records = base_query.order_by(Placement.ingested_at.desc()).all()

    # Note: tech_stack is stored as JSON, so exact substring on list isn't trivial in SQLite without json1, but company/role is covered.
    # tier filtering (tier logic was dynamically on frontend based on ctc)
    # We apply tier filtering in memory or add Tier column to DB. Since we don't have Tier in DB, we'll do memory filter for tier.
    filtered_records = []
    for p in records:
        computed_tier = 'TOP TIER' if p.ctc and p.ctc >= 30 else ('QUANTITATIVE' if p.ctc and p.ctc >= 20 else 'TACTICAL')
        if tier_str and tier_str != "ALL" and computed_tier != tier_str:
            continue
        filtered_records.append(p)

    return jsonify({
        "university_id": uni_id,
        "count": len(filtered_records),
        "placements": placements_schema.dump(filtered_records)
    }), 200

@ingest_bp.route("/placements/<int:placement_id>/apply", methods=["POST"])
@jwt_required()
def apply_placement(placement_id):
    """
    Apply to a specific placement
    """
    claims = get_jwt()
    user_id = claims.get("user_id")
    uni_id = claims.get("university_id")
    
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    placement = Placement.query.filter(
        (Placement.id == placement_id) & 
        ((Placement.university_id == uni_id) | (Placement.is_off_campus == True))
    ).first()
    if not placement:
        return jsonify({"error": "Placement not found or unauthorized"}), 404

    # Check if already applied
    existing = JobApplication.query.filter_by(user_id=user_id, placement_id=placement_id).first()
    if existing:
        return jsonify({"error": "Already applied"}), 400

    application = JobApplication(user_id=user_id, placement_id=placement_id)
    db.session.add(application)
    db.session.commit()

    return jsonify({"message": "Application submitted successfully", "application_id": application.id}), 201
