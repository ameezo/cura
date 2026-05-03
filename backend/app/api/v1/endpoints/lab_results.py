from flask import Blueprint, request, jsonify, g, send_file
from app.core.security import require_role
from app.services import patient_service, doctor_service
from app.models.lab_result import LabResult
from app.schemas.lab_result import LabResultCreate
from pydantic import ValidationError
from app import db
from datetime import datetime
import os
from werkzeug.utils import secure_filename

lab_results_bp = Blueprint("lab_results", __name__)

UPLOAD_FOLDER = "/app/uploads/lab_results"
# Ensure directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@lab_results_bp.route("/", methods=["GET"])
@require_role(["patient"])
def get_my_lab_results():
    current_user = g.current_user
    patient_profile = patient_service.get_patient_by_user_id(int(current_user["sub"]))
    if not patient_profile:
        return jsonify([]), 200
        
    results = LabResult.query.filter_by(
        patient_id=patient_profile.id, 
        released_to_patient=True
    ).order_by(LabResult.date.desc()).all()
    
    data = []
    for r in results:
        doctor_name = "Unknown Doctor"
        if r.doctor:
            doctor_name = f"Dr. {r.doctor.full_name}"
            
        data.append({
            "id": str(r.id),
            "test_name": r.test_name,
            "date": r.date.strftime("%Y-%m-%d"),
            "status": r.status,
            "result_summary": r.result_summary,
            "lab": r.lab_name or "Unknown Lab",
            "doctor": doctor_name,
            "doctor_comment": r.doctor_comment,
            "published_at": r.published_at.isoformat() if r.published_at else None,
            "released_to_patient": r.released_to_patient,
            "has_report": bool(r.report_file_path)
        })
        
    return jsonify(data), 200

@lab_results_bp.route("/doctor", methods=["GET"])
@require_role(["doctor"])
def get_doctor_lab_results():
    current_user = g.current_user
    doctor_profile = doctor_service.get_doctor_by_user_id(int(current_user["sub"]))
    if not doctor_profile:
        return jsonify([]), 200
        
    results = LabResult.query.filter_by(doctor_id=doctor_profile.id).order_by(LabResult.date.desc()).all()
    
    data = []
    for r in results:
        doctor_name = f"Dr. {doctor_profile.full_name}"
            
        data.append({
            "id": str(r.id),
            "patient_id": r.patient_id,
            "test_name": r.test_name,
            "date": r.date.strftime("%Y-%m-%d"),
            "status": r.status,
            "result_summary": r.result_summary,
            "lab": r.lab_name or "Unknown Lab",
            "doctor": doctor_name,
            "doctor_comment": r.doctor_comment,
            "published_at": r.published_at.isoformat() if r.published_at else None,
            "released_to_patient": r.released_to_patient,
            "has_report": bool(r.report_file_path)
        })
        
    return jsonify(data), 200

@lab_results_bp.route("/", methods=["POST"])
@require_role(["doctor", "admin"])
def create_lab_result():
    current_user = g.current_user
    doctor_profile = doctor_service.get_doctor_by_user_id(int(current_user["sub"]))
    if not doctor_profile:
        return jsonify({"msg": "Profile required to publish lab results."}), 400
        
    # Handle both JSON and Multipart Form Data
    if request.is_json:
        payload = request.json.copy() if request.json else {}
    else:
        payload = dict(request.form)
        # Parse boolean carefully from form data string
        if "released_to_patient" in payload:
            payload["released_to_patient"] = str(payload["released_to_patient"]).lower() in ['true', '1', 't', 'y', 'yes']

    try:
        data = LabResultCreate(**payload)
    except ValidationError as e:
        return jsonify(e.errors()), 400
        
    # Handle File Upload
    report_file_path = None
    if "report_file" in request.files:
        file = request.files["report_file"]
        if file and file.filename:
            filename = secure_filename(f"{datetime.utcnow().timestamp()}_{file.filename}")
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            report_file_path = filepath
        
    now = datetime.utcnow()
    new_result = LabResult(
        patient_id=data.patient_id,
        doctor_id=doctor_profile.id,
        test_name=data.test_name,
        date=data.date,
        status=data.status,
        result_summary=data.result_summary,
        lab_name=data.lab_name,
        doctor_comment=data.doctor_comment,
        released_to_patient=data.released_to_patient,
        published_at=now if data.released_to_patient else None,
        report_file_path=report_file_path
    )
    
    db.session.add(new_result)
    db.session.commit()
    
    return jsonify({"msg": "Lab result created successfully", "id": new_result.id}), 201

@lab_results_bp.route("/<int:id>/release", methods=["PATCH"])
@require_role(["doctor", "admin"])
def release_lab_result(id):
    current_user = g.current_user
    doctor_profile = doctor_service.get_doctor_by_user_id(int(current_user["sub"]))
    if not doctor_profile:
        return jsonify({"msg": "Profile required"}), 400
        
    result = LabResult.query.get(id)
    if not result:
        return jsonify({"msg": "Lab result not found"}), 404
        
    if result.doctor_id != doctor_profile.id and current_user["role"] != "admin":
        return jsonify({"msg": "Unauthorized to release this result"}), 403
        
    if not result.released_to_patient:
        result.released_to_patient = True
        result.published_at = datetime.utcnow()
        db.session.commit()
        
    return jsonify({"msg": "Lab result released to patient successfully"}), 200

@lab_results_bp.route("/<int:id>/download", methods=["GET"])
@require_role(["patient", "doctor", "admin"])
def download_lab_report(id):
    current_user = g.current_user
    result = LabResult.query.get(id)
    
    if not result:
        return jsonify({"msg": "Lab result not found"}), 404
        
    if not result.report_file_path or not os.path.exists(result.report_file_path):
        return jsonify({"msg": "Report file not found"}), 404
        
    # IDOR Protection
    if current_user["role"] == "patient":
        patient_profile = patient_service.get_patient_by_user_id(int(current_user["sub"]))
        if not patient_profile or result.patient_id != patient_profile.id or not result.released_to_patient:
            return jsonify({"msg": "Unauthorized"}), 403
    elif current_user["role"] == "doctor":
        doctor_profile = doctor_service.get_doctor_by_user_id(int(current_user["sub"]))
        if not doctor_profile or result.doctor_id != doctor_profile.id:
            return jsonify({"msg": "Unauthorized"}), 403
            
    return send_file(result.report_file_path, as_attachment=True)

