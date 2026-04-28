Build Backend Phase 3 for our medical web application.

In this phase, implement the following backend modules and keep the code modular, scalable, and ready for integration with the React frontend.

Scope of Phase 3:
1. Patient CRUD cycle
2. Doctor CRUD cycle
3. Doctor availability and booking system
4. Reminder system foundation

Requirements:

1) Patient CRUD
Create the full CRUD cycle for patients:
- create patient
- read patient by id
- list patients
- update patient
- delete or soft-delete patient if better for medical records

Use proper:
- model
- schema
- service
- routes/endpoints
- validation
- database relationships if needed

2) Doctor CRUD
Create the full CRUD cycle for doctors:
- create doctor
- read doctor by id
- list doctors
- update doctor
- delete or soft-delete doctor if needed

Include doctor-related fields that support booking, such as:
- name
- specialization
- clinic location
- online meeting availability
- onsite availability status

3) Booking and availability system
Implement a booking system with two sides:

Doctor side:
- doctor can define available dates
- doctor can define available time slots
- doctor can mark whether the slot is for clinic visit, online meeting, or both

Patient side:
- patient can view available doctors
- patient can view available dates and time slots
- patient can reserve an available slot
- reservation must be stored in the database
- once booked, the slot should not be double-booked

The booking record should store at least:
- patient_id
- doctor_id
- booking_date
- start_time
- end_time
- booking_type (online or onsite)
- status
- notes if needed

Add validation rules such as:
- no booking on unavailable slots
- no double booking
- booking must reference existing doctor and patient
- doctor availability must be defined before booking

4) Reminder system foundation
Implement the reminder foundation related to bookings and/or medication scheduling.

For now:
- create reminder model
- create reminder schema
- create reminder service
- create reminder endpoints if needed
- store reminder records in the database

Reminder fields may include:
- user_id or patient_id
- reminder_type
- title
- message
- scheduled_at
- status
- related appointment or medication id if applicable

Do not implement external notification providers yet unless needed.
Keep the reminder logic ready for future scheduler or n8n integration.

Technical expectations:
- use clean Flask project structure
- keep business logic in services, not directly inside route files
- use SQLAlchemy models
- use migrations if schema changes are needed
- keep the API RESTful
- make the responses suitable for React frontend integration
- include proper status codes and JSON responses

Testing and verification:
After generating the code, also provide:
1. the list of created files
2. the new endpoints
3. example request and response JSON for each main endpoint
4. how to test each endpoint in Postman
5. how to verify the stored data in PostgreSQL
6. important edge cases to test

Important:
Do not generate everything as one huge unorganized block.
Build it feature by feature in this order:
1. patient CRUD
2. doctor CRUD
3. doctor availability
4. patient booking
5. reminder foundation

Explain each step briefly before moving to the next one.