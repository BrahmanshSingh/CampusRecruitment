from flask import Blueprint, request, jsonify, redirect, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.extensions import db
from app.models.user import User
from app.models.university import University
from app.schemas import UserSchema
from app.services.github_oauth import GitHubOAuthService

auth_bp = Blueprint("auth", __name__)
user_schema = UserSchema()

@auth_bp.route("/login", methods=["GET"])
def github_login():
    """
    Get GitHub OAuth Redirect URL
    ---
    tags:
      - Authentication
    responses:
      200:
        description: Returns authorization URL for frontend navigation
        schema:
          type: object
          properties:
            auth_url:
              type: string
    """
    state = request.args.get("state")
    url = GitHubOAuthService.get_authorization_url(state)
    
    # If browser directly navigates, redirect, else return JSON
    if "text/html" in request.headers.get("Accept", ""):
        return redirect(url)
    return jsonify({"auth_url": url}), 200

@auth_bp.route("/callback", methods=["GET"])
def github_callback():
    """
    GitHub OAuth Callback
    ---
    tags:
      - Authentication
    parameters:
      - name: code
        in: query
        type: string
        required: true
        description: OAuth code from GitHub
      - name: university_id
        in: query
        type: integer
        required: false
        description: Optional tenant university ID to bind user
    responses:
      200:
        description: Successfully authenticated with JWT access token
      400:
        description: Missing authorization code or token exchange failed
    """
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Missing authorization code from GitHub callback."}), 400

    try:
        token = GitHubOAuthService.exchange_code_for_token(code)
        gh_user = GitHubOAuthService.fetch_github_user(token)
    except Exception as e:
        return jsonify({"error": f"OAuth exchange failed: {str(e)}"}), 400

    github_id = gh_user["github_id"]
    user = User.query.filter_by(github_id=github_id).first()

    university_id_param = request.args.get("university_id", type=int)

    if not user:
        # If no university provided, default to first available or create demo tenant
        if not university_id_param:
            demo_uni = University.query.first()
            if not demo_uni:
                demo_uni = University(name="Thapar Institute of Engineering & Technology", domain="thapar.edu")
                db.session.add(demo_uni)
                db.session.commit()
            university_id_param = demo_uni.id

        user = User(
            github_id=github_id,
            username=gh_user["username"],
            email=gh_user["email"],
            avatar_url=gh_user["avatar_url"],
            role="student",
            university_id=university_id_param
        )
        db.session.add(user)
        db.session.commit()
    else:
        # Update existing user profile info
        user.username = gh_user["username"]
        user.avatar_url = gh_user["avatar_url"]
        if gh_user["email"]:
            user.email = gh_user["email"]
        if university_id_param:
            user.university_id = university_id_param
        db.session.commit()

    # Issue JWT with baked-in claims for multi-tenancy isolation
    additional_claims = {
        "role": user.role,
        "university_id": user.university_id,
        "username": user.username
    }
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims=additional_claims
    )

    return jsonify({
        "message": "Authentication successful",
        "access_token": access_token,
        "user": user_schema.dump(user)
    }), 200

@auth_bp.route("/dev-token", methods=["POST"])
def dev_token():
    """
    Generate Instant Dev / Hackathon Token (Dev mode only)
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            username:
              type: string
              example: puranjay_dev
            role:
              type: string
              example: admin
            university_name:
              type: string
              example: Thapar Institute
    responses:
      200:
        description: Returns mock JWT token for testing endpoints without GitHub OAuth
    """
    data = request.get_json() or {}
    username = data.get("username", "puranjay_lead")
    role = data.get("role", "admin")
    uni_name = data.get("university_name", "Thapar Institute of Engineering & Technology")

    uni = University.query.filter(
        (University.name == uni_name) | (University.domain == "thapar.edu")
    ).first()
    if not uni:
        uni = University(name=uni_name, domain="thapar.edu")
        db.session.add(uni)
        db.session.commit()

    user = User.query.filter_by(username=username).first()
    if not user:
        user = User(
            github_id=f"dev_{username}",
            username=username,
            email=f"{username}@placeoracle.dev",
            role=role,
            university_id=uni.id
        )
        db.session.add(user)
        db.session.commit()

    claims = {
        "role": user.role,
        "university_id": user.university_id,
        "username": user.username
    }
    token = create_access_token(identity=str(user.id), additional_claims=claims)

    return jsonify({
        "message": "Development token generated",
        "access_token": token,
        "user": user_schema.dump(user)
    }), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """
    Get Current Authenticated User Profile
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Current user profile and university tenant info
    """
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "user": user_schema.dump(user),
        "claims": get_jwt()
    }), 200
