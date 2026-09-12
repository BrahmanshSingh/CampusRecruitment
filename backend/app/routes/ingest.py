from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt
from marshmallow import ValidationError
from app.extensions import db
from app.models.placement import Placement
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
    university_id = json_data.get("university_id", 1) # Default to tenant 1 if not specified

    try:
        # LLM Gateway extracts structured parameters
        extracted = parse_placement_email(raw_email)
    except Exception as e:
        return jsonify({"error": f"LLM Ingestion extraction failed: {str(e)}"}), 500

    placement = Placement(
        university_id=university_id,
        company_name=extracted["company_name"],
        role=extracted["role"],
        ctc=extracted["ctc"],
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

    # MULTI-TENANT ISOLATION: Never return records from outside caller's university
    records = Placement.query.filter_by(university_id=uni_id).order_by(Placement.ingested_at.desc()).all()
    return jsonify({
        "university_id": uni_id,
        "count": len(records),
        "placements": placements_schema.dump(records)
    }), 200
