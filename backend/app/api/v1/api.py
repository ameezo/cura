from flask import Blueprint

from app.api.v1.endpoints.auth import auth_bp
from app.api.v1.endpoints.ai_chat import ai_chat_bp
from app.api.v1.endpoints.reminders import reminders_bp
from app.api.v1.endpoints.admin import admin_bp
from app.api.v1.endpoints.patients import patients_bp
from app.api.v1.endpoints.doctors import doctors_bp
from app.api.v1.endpoints.bookings import bookings_bp
from app.api.v1.endpoints.medications import medications_bp
from app.api.v1.endpoints.lab_results import lab_results_bp

api_bp = Blueprint("api_v1", __name__)

api_bp.register_blueprint(auth_bp, url_prefix="/auth")
api_bp.register_blueprint(ai_chat_bp, url_prefix="/ai-chat")
api_bp.register_blueprint(reminders_bp, url_prefix="/reminders")
api_bp.register_blueprint(admin_bp, url_prefix="/admin")
api_bp.register_blueprint(patients_bp, url_prefix="/patients")
api_bp.register_blueprint(doctors_bp, url_prefix="/doctors")
api_bp.register_blueprint(bookings_bp, url_prefix="/bookings")
api_bp.register_blueprint(medications_bp, url_prefix="/medications")
api_bp.register_blueprint(lab_results_bp, url_prefix="/lab-results")
