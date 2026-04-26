from flask import Blueprint

from app.api.v1.endpoints.auth import auth_bp
from app.api.v1.endpoints.ai_chat import ai_chat_bp
from app.api.v1.endpoints.reminders import reminders_bp
from app.api.v1.endpoints.admin import admin_bp

api_bp = Blueprint("api_v1", __name__)

api_bp.register_blueprint(auth_bp, url_prefix="/auth")
api_bp.register_blueprint(ai_chat_bp, url_prefix="/ai-chat")
api_bp.register_blueprint(reminders_bp, url_prefix="/reminders")
api_bp.register_blueprint(admin_bp, url_prefix="/admin")
