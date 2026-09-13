from flask import Flask, jsonify
from app.config import Config
from app.extensions import db, ma, jwt, migrate, swagger, cors

import os
def create_app(config_class=Config):
    # Detect Vercel / AWS Lambda environment where filesystem is read-only
    is_serverless = "/var/task" in __file__
    
    if is_serverless:
        app = Flask(__name__, instance_path="/tmp/instance")
    else:
        app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Extensions
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    swagger.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": "*"}})

    # JWT Error handlers for clean API responses
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "The token has expired", "code": "token_expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Signature verification failed", "code": "invalid_token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Authorization header missing or token missing", "code": "authorization_required"}), 401

    # Register Blueprints
    from app.routes.auth import auth_bp
    from app.routes.ingest import ingest_bp
    from app.routes.assessment import assessment_bp
    from app.routes.submit import submit_bp
    from app.routes.health import health_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(ingest_bp, url_prefix="/api/ingest")
    app.register_blueprint(assessment_bp, url_prefix="/api/assessment")
    app.register_blueprint(submit_bp, url_prefix="/api/submit")
    app.register_blueprint(health_bp, url_prefix="/api")

    # Ensure tables are created when running in SQLite dev mode
    with app.app_context():
        db.create_all()

    return app
