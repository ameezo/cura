from app.models.reminder import Reminder
from app.models.appointment import Appointment
from app.models.medication import Medication
from app import db
from typing import List, Optional
from datetime import datetime, timedelta

def get_patient_reminders(patient_id: int) -> List[Reminder]:
    return Reminder.query.filter_by(patient_id=patient_id).order_by(Reminder.scheduled_at.asc()).all()

def dismiss_reminder(reminder_id: int) -> bool:
    reminder = Reminder.query.get(reminder_id)
    if not reminder: return False
    reminder.status = "dismissed"
    db.session.commit()
    return True

# ----------------- PIPELINE ENGINES ----------------- #

def generate_appointment_reminders(appointment_id: int):
    appointment = Appointment.query.get(appointment_id)
    if not appointment: return
    
    slot = appointment.slot
    
    # We must combine date + time from DoctorAvailability
    booking_dt = datetime.combine(slot.date, slot.start_time)
    
    # Generate 24h generic push reminder
    twenty_four = Reminder(
        patient_id=appointment.patient_id,
        appointment_id=appointment.id,
        reminder_type="appointment_reminder",
        title="Upcoming Appointment Tomorrow",
        message=f"You have a clinical appointment with Dr. {appointment.doctor.full_name} tomorrow at {slot.start_time.strftime('%I:%M %p')}.",
        channel="email",
        scheduled_at=booking_dt - timedelta(hours=24)
    )
    
    # Generate 2h immediate push reminder
    two_hour = Reminder(
        patient_id=appointment.patient_id,
        appointment_id=appointment.id,
        reminder_type="appointment_reminder",
        title="Appointment Approaching",
        message=f"Your appointment with Dr. {appointment.doctor.full_name} starts in 2 hours.",
        channel="in_app",
        scheduled_at=booking_dt - timedelta(hours=2)
    )
    
    db.session.add(twenty_four)
    db.session.add(two_hour)
    db.session.commit()

def generate_medication_reminders(medication_id: int):
    med = Medication.query.get(medication_id)
    if not med: return
    
    # Compute schedule limit. Start today or whenever it starts, for a max lookahead of 7 days
    start = med.start_date
    current_date = datetime.today().date()
    effective_start = start if start >= current_date else current_date
    
    end_limit = effective_start + timedelta(days=7)
    if med.end_date and med.end_date < end_limit:
        end_limit = med.end_date
        
    current = effective_start
    reminders_to_insert = []
    
    # Generic staggered timings for times_per_day logic
    daily_schedules = {
        1: [timedelta(hours=8)], # 8:00 AM once daily
        2: [timedelta(hours=8), timedelta(hours=20)], # 8 AM and 8 PM
        3: [timedelta(hours=8), timedelta(hours=14), timedelta(hours=20)] # 8 AM, 2 PM, 8 PM
    }
    
    basetimes = daily_schedules.get(med.times_per_day, daily_schedules[1])
    
    while current <= end_limit:
        for offset in basetimes:
            schedule_dt = datetime.combine(current, datetime.min.time()) + offset
            
            # Avoid sending reminders for pills in the past
            if schedule_dt <= datetime.now():
                continue
                
            r = Reminder(
                patient_id=med.patient_id,
                medication_id=med.id,
                reminder_type="medication_reminder",
                title=f"Time to take {med.name}",
                message=f"Please take your scheduled dosage of {med.name} ({med.dosage}) now.",
                channel="in_app",
                scheduled_at=schedule_dt
            )
            reminders_to_insert.append(r)
            
        current += timedelta(days=1)
        
    if reminders_to_insert:
        db.session.bulk_save_objects(reminders_to_insert)
        db.session.commit()
