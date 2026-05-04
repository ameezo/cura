from app import create_app, db
from app.models.patient import Patient

app = create_app()
with app.app_context():
    p = Patient.query.get(3)
    print(f"Patient 3 user_id before: {p.user_id}")
    p.first_name = "test"
    db.session.commit()
    print(f"Patient 3 user_id after: {p.user_id}")
