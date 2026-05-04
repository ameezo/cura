import requests
import json
import uuid

BASE_URL = "http://localhost:5001/api/v1"

def print_step(msg):
    print(f"\n{'='*40}\n{msg}\n{'='*40}")

def run_tests():
    # 1. Register a doctor
    doctor_email = f"doc_{uuid.uuid4().hex[:8]}@example.com"
    doctor_password = "password123"
    print_step(f"Registering Doctor: {doctor_email}")
    res = requests.post(f"{BASE_URL}/auth/register", json={
        "email": doctor_email,
        "password": doctor_password,
        "role": "doctor"
    })
    assert res.status_code == 201, f"Doctor registration failed: {res.text}"
    doctor_token = res.json().get("access_token")
    doctor_headers = {"Authorization": f"Bearer {doctor_token}"}
    
    # 2. Create Doctor Profile
    print_step("Creating Doctor Profile")
    res = requests.post(f"{BASE_URL}/doctors/", headers=doctor_headers, json={
        "first_name": "Test",
        "last_name": "Doctor",
        "specialty": "General",
        "license_number": f"LIC-{uuid.uuid4().hex[:8]}",
        "phone_number": "1234567890"
    })
    assert res.status_code == 201, f"Doctor profile creation failed: {res.text}"
    doctor_id = res.json().get("id")
    print(f"Doctor Profile created with ID: {doctor_id}")

    # 3. Register a patient
    patient_email = f"pat_{uuid.uuid4().hex[:8]}@example.com"
    patient_password = "password123"
    print_step(f"Registering Patient: {patient_email}")
    res = requests.post(f"{BASE_URL}/auth/register", json={
        "email": patient_email,
        "password": patient_password,
        "role": "patient"
    })
    assert res.status_code == 201, f"Patient registration failed: {res.text}"
    patient_token = res.json().get("access_token")
    patient_headers = {"Authorization": f"Bearer {patient_token}"}

    # 4. Create Patient Profile
    print_step("Creating Patient Profile")
    res = requests.post(f"{BASE_URL}/patients/", headers=patient_headers, json={
        "first_name": "Test",
        "last_name": "Patient",
        "date_of_birth": "1990-01-01",
        "phone_number": "0987654321"
    })
    assert res.status_code == 201, f"Patient profile creation failed: {res.text}"
    patient_id = res.json().get("id")
    print(f"Patient Profile created with ID: {patient_id}")

    # 5. Doctor creates availability
    print_step("Doctor Creating Availability")
    date_str = "2026-10-15"
    res = requests.post(f"{BASE_URL}/bookings/availability", headers=doctor_headers, json={
        "date": date_str,
        "start_time": "10:00:00",
        "end_time": "10:30:00",
        "slot_type": "in-person"
    })
    assert res.status_code == 201, f"Doctor availability creation failed: {res.text}"
    availability_id = res.json().get("id")
    print(f"Availability created with ID: {availability_id}")

    # 6. Patient gets all availabilities
    print_step("Patient Viewing Availabilities")
    res = requests.get(f"{BASE_URL}/bookings/availability")
    assert res.status_code == 200, f"Fetching availabilities failed: {res.text}"
    availabilities = res.json()
    print(f"Total available slots: {len(availabilities)}")
    # Ensure our newly created slot is there
    assert any(a['id'] == availability_id for a in availabilities), "Created availability not found in public list"

    # 7. Patient books an appointment
    print_step("Patient Booking Appointment")
    res = requests.post(f"{BASE_URL}/bookings/appointments", headers=patient_headers, json={
        "availability_id": availability_id,
        "reason_for_visit": "Checkup"
    })
    assert res.status_code == 201, f"Appointment booking failed: {res.text}"
    appointment = res.json()
    appointment_id = appointment.get("id")
    print(f"Appointment booked with ID: {appointment_id}")

    # 8. Verify the slot is now booked (not available anymore)
    print_step("Verifying slot is marked as booked")
    res = requests.get(f"{BASE_URL}/bookings/availability")
    availabilities = res.json()
    assert not any(a['id'] == availability_id for a in availabilities), "Slot is still listed as available!"
    print("Slot is no longer available.")

    # 9. List appointments for Doctor
    print_step("Doctor Listing Appointments")
    res = requests.get(f"{BASE_URL}/bookings/appointments", headers=doctor_headers)
    assert res.status_code == 200, f"Doctor fetching appointments failed: {res.text}"
    doc_appointments = res.json()
    assert any(a['id'] == appointment_id for a in doc_appointments), "Doctor cannot see the booked appointment"
    print(f"Doctor sees {len(doc_appointments)} appointments.")

    # 10. Patient cancels the appointment
    print_step("Patient Canceling Appointment")
    res = requests.put(f"{BASE_URL}/bookings/appointments/{appointment_id}/cancel", headers=patient_headers)
    assert res.status_code == 200, f"Canceling appointment failed: {res.text}"
    print("Appointment cancelled successfully.")

    # 11. Verify the slot is freed up again
    print_step("Verifying slot is freed after cancellation")
    res = requests.get(f"{BASE_URL}/bookings/availability")
    availabilities = res.json()
    assert any(a['id'] == availability_id for a in availabilities), "Slot was not freed up after cancellation"
    print("Slot is available again.")

    print_step("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as e:
        print(f"\nTEST FAILED: {e}")
    except Exception as e:
        print(f"\nERROR: {e}")
