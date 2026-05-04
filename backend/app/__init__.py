from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from app.core.config import settings
import os

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Allow the public Cloudflare frontend URL + localhost for local dev
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    allowed_origins = [frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"]
    CORS(app, origins=allowed_origins, supports_credentials=True)
    
    # Configure Database
    app.config["SQLALCHEMY_DATABASE_URI"] = settings.SQLALCHEMY_DATABASE_URI
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Register API blueprints
    from app.api.v1.api import api_bp
    app.register_blueprint(api_bp, url_prefix=settings.API_V1_STR)
    
    # Initialize temporal background chron-workers
    from app.tasks.scheduler import start_scheduler
    start_scheduler(app)
    
    
    # fot the route of the app 
    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "ok", "message": "API is running"})
        
    return app
