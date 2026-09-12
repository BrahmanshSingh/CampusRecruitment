from flask import Blueprint, jsonify
from app.models.university import University
from app.models.user import User
from app.models.placement import Placement
from app.models.verification import Verification
from app.extensions import db

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health_check():
    """
    System Status & Health Check
    ---
    tags:
      - System
    responses:
      200:
        description: System operational report
    """
    return jsonify({
        "status": "operational",
        "system": "PlaceOracle Command Center",
        "team": "Jacked Nerds",
        "lead": "Puranjay Sharma",
        "version": "1.0.0"
    }), 200

@health_bp.route("/seed", methods=["POST"])
def seed_database():
    """
    Seed Demo Universities and Baseline Data (Hackathon Sprint Helper)
    ---
    tags:
      - System
    responses:
      201:
        description: Universities seeded
    """
    thapar = University.query.filter_by(name="Thapar Institute of Engineering & Technology").first()
    if not thapar:
        thapar = University(name="Thapar Institute of Engineering & Technology", domain="thapar.edu")
        db.session.add(thapar)

    vit = University.query.filter_by(name="Vellore Institute of Technology (VIT)").first()
    if not vit:
        vit = University(name="Vellore Institute of Technology (VIT)", domain="vit.ac.in")
        db.session.add(vit)

    db.session.commit()

    return jsonify({
        "message": "Demo universities seeded successfully",
        "tenants": [
            {"id": thapar.id, "name": thapar.name, "domain": thapar.domain},
            {"id": vit.id, "name": vit.name, "domain": vit.domain}
        ]
    }), 201
