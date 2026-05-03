import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.lab_result import LabResult
from app.models.patient import Patient
from app.models.doctor import Doctor
from datetime import datetime, timedelta

def seed_lab_results():
    app = create_app()
    with app.app_context():
        # Get a patient to attach the results to
        patient = Patient.query.first()
        if not patient:
            print("No patients found in DB. Please create a patient profile first.")
            return

        # Get a doctor
        doctor = Doctor.query.first()
        
        # Check if already seeded
        existing = LabResult.query.filter_by(patient_id=patient.id).first()
        if existing:
            print(f"Lab results already exist for patient {patient.id}. Skipping.")
            return
            
        print(f"Seeding lab results for patient {patient.id}...")
        
        now = datetime.utcnow()
        
        results = [
            LabResult(
                patient_id=patient.id,
                doctor_id=doctor.id if doctor else None,
                test_name="Complete Blood Count",
                date=now.date() - timedelta(days=2),
                status="normal",
                result_summary="All values within normal range",
                lab_name="City Medical Lab",
                doctor_comment="Patient is healthy.",
                published_at=now,
                released_to_patient=True
            ),
            LabResult(
                patient_id=patient.id,
                doctor_id=doctor.id if doctor else None,
                test_name="Lipid Panel",
                date=now.date() - timedelta(days=7),
                status="attention",
                result_summary="LDL cholesterol slightly elevated at 142 mg/dL",
                lab_name="City Medical Lab",
                doctor_comment="Please advise patient to adjust diet.",
                published_at=now,
                released_to_patient=True
            ),
            LabResult(
                patient_id=patient.id,
                doctor_id=doctor.id if doctor else None,
                test_name="Thyroid Panel",
                date=now.date() - timedelta(days=15),
                status="urgent",
                result_summary="TSH elevated at 8.2 mIU/L — follow-up recommended",
                lab_name="Central Diagnostics",
                doctor_comment="Needs immediate attention.",
                published_at=now,
                released_to_patient=False
            )
        ]
        
        for r in results:
            db.session.add(r)
            
        db.session.commit()
        print("Successfully seeded lab results!")

if __name__ == "__main__":
    seed_lab_results()
