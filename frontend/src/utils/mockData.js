/* ============================================
   Mock Data for Cura Frontend Development
   ============================================ */

export const mockUser = {
  id: 'usr_001',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '+1 555-0142',
  role: 'patient',
  avatar: null,
  dateOfBirth: '1990-03-15',
  bloodType: 'A+',
  allergies: ['Penicillin'],
  emergencyContact: { name: 'Michael Johnson', phone: '+1 555-0199', relation: 'Husband' },
};

export const mockDoctors = [
  { id: 'doc_001', name: 'Dr. Sarah Ali', specialty: 'Cardiology', rating: 4.9, experience: '12 years', available: true, avatar: null, nextSlot: '2026-05-12 10:30 AM' },
  { id: 'doc_002', name: 'Dr. Ahmed Hassan', specialty: 'Neurology', rating: 4.8, experience: '15 years', available: true, avatar: null, nextSlot: '2026-05-13 02:00 PM' },
  { id: 'doc_003', name: 'Dr. Lena Fischer', specialty: 'Dermatology', rating: 4.7, experience: '8 years', available: false, avatar: null, nextSlot: '2026-05-14 09:00 AM' },
  { id: 'doc_004', name: 'Dr. Omar Khalil', specialty: 'Psychiatry', rating: 4.9, experience: '20 years', available: true, avatar: null, nextSlot: '2026-05-12 03:00 PM' },
  { id: 'doc_005', name: 'Dr. Maria Santos', specialty: 'Pediatrics', rating: 4.6, experience: '10 years', available: true, avatar: null, nextSlot: '2026-05-15 11:00 AM' },
  { id: 'doc_006', name: 'Dr. James Park', specialty: 'General Medicine', rating: 4.5, experience: '7 years', available: true, avatar: null, nextSlot: '2026-05-12 01:00 PM' },
];

export const mockAppointments = [
  { id: 'apt_001', doctor_name: 'Dr. Sarah Ali', specialty: 'Cardiology', date: '2026-05-12', time: '10:30 AM', status: 'confirmed', type: 'onsite', notes: 'Regular checkup' },
  { id: 'apt_002', doctor_name: 'Dr. Ahmed Hassan', specialty: 'Neurology', date: '2026-05-15', time: '02:00 PM', status: 'pending', type: 'online', notes: 'Follow-up consultation' },
  { id: 'apt_003', doctor_name: 'Dr. Omar Khalil', specialty: 'Psychiatry', date: '2026-05-18', time: '11:00 AM', status: 'confirmed', type: 'online', notes: 'Therapy session' },
  { id: 'apt_004', doctor_name: 'Dr. Lena Fischer', specialty: 'Dermatology', date: '2026-04-28', time: '09:00 AM', status: 'completed', type: 'onsite', notes: 'Skin examination results' },
  { id: 'apt_005', doctor_name: 'Dr. Maria Santos', specialty: 'Pediatrics', date: '2026-04-20', time: '03:30 PM', status: 'cancelled', type: 'onsite', notes: 'Child vaccination' },
];

export const mockMedications = [
  { id: 'med_001', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', time: '08:00 AM', startDate: '2026-04-01', endDate: '2026-07-01', instructions: 'Take with water on an empty stomach', active: true },
  { id: 'med_002', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', time: '08:00 AM, 08:00 PM', startDate: '2026-03-15', endDate: '2026-09-15', instructions: 'Take with meals', active: true },
  { id: 'med_003', name: 'Vitamin D3', dosage: '2000 IU', frequency: 'Once daily', time: '12:00 PM', startDate: '2026-04-10', endDate: '2026-10-10', instructions: 'Take with a fatty meal', active: true },
  { id: 'med_004', name: 'Amoxicillin', dosage: '250mg', frequency: 'Three times daily', time: '08:00 AM, 02:00 PM, 08:00 PM', startDate: '2026-04-20', endDate: '2026-04-30', instructions: 'Complete full course', active: false },
];

export const mockLabResults = [
  { id: 'lab_001', test_name: 'Complete Blood Count', date: '2026-05-01', status: 'normal', result_summary: 'All values within normal range', lab: 'City Medical Lab', doctor: 'Dr. Sarah Ali' },
  { id: 'lab_002', test_name: 'Lipid Panel', date: '2026-04-25', status: 'attention', result_summary: 'LDL cholesterol slightly elevated at 142 mg/dL', lab: 'City Medical Lab', doctor: 'Dr. Sarah Ali' },
  { id: 'lab_003', test_name: 'HbA1c', date: '2026-04-20', status: 'normal', result_summary: 'HbA1c at 5.4% — within normal range', lab: 'Central Diagnostics', doctor: 'Dr. James Park' },
  { id: 'lab_004', test_name: 'Thyroid Panel', date: '2026-04-15', status: 'urgent', result_summary: 'TSH elevated at 8.2 mIU/L — follow-up recommended', lab: 'Central Diagnostics', doctor: 'Dr. Ahmed Hassan' },
  { id: 'lab_005', test_name: 'Vitamin D Level', date: '2026-04-10', status: 'attention', result_summary: 'Vitamin D at 22 ng/mL — insufficiency', lab: 'City Medical Lab', doctor: 'Dr. James Park' },
];

export const mockNotifications = [
  { id: 'not_001', type: 'medication', title: 'Medication Reminder', message: 'Time to take your morning dose of Lisinopril (10mg)', created_at: '2026-05-01T08:00:00Z', read: false },
  { id: 'not_002', type: 'appointment', title: 'Upcoming Appointment', message: 'Your appointment with Dr. Sarah Ali is tomorrow at 10:30 AM', created_at: '2026-05-01T09:00:00Z', read: false },
  { id: 'not_003', type: 'lab_result', title: 'Lab Results Ready', message: 'Your Complete Blood Count results are now available', created_at: '2026-04-30T14:00:00Z', read: true },
  { id: 'not_004', type: 'ai_followup', title: 'AI Health Insight', message: 'Based on your recent activity, here are some wellness tips', created_at: '2026-04-29T10:00:00Z', read: true },
  { id: 'not_005', type: 'appointment', title: 'Appointment Confirmed', message: 'Your appointment with Dr. Omar Khalil has been confirmed for May 18', created_at: '2026-04-28T16:00:00Z', read: true },
  { id: 'not_006', type: 'medication', title: 'Medication Reminder', message: 'Time to take your evening dose of Metformin (500mg)', created_at: '2026-04-28T20:00:00Z', read: false },
  { id: 'not_007', type: 'system', title: 'Welcome to Cura', message: 'Your account has been set up. Explore your health dashboard!', created_at: '2026-04-15T12:00:00Z', read: true },
];

export const mockEmergencyContacts = [
  { id: 'ec_001', name: 'Emergency Services', phone: '911', type: 'emergency', description: 'National emergency number' },
  { id: 'ec_002', name: 'Poison Control', phone: '1-800-222-1222', type: 'emergency', description: 'Poison emergency hotline' },
  { id: 'ec_003', name: 'Dr. Sarah Ali', phone: '+1 555-0301', type: 'doctor', description: 'Primary cardiologist' },
  { id: 'ec_004', name: 'City General Hospital', phone: '+1 555-0400', type: 'hospital', description: 'Nearest hospital — 2.3 miles' },
  { id: 'ec_005', name: 'Michael Johnson', phone: '+1 555-0199', type: 'personal', description: 'Husband — Emergency contact' },
];

export const mockChatMessages = [
  { id: 'msg_001', role: 'assistant', content: 'Hello! I\'m your Cura AI health assistant. How can I help you today? Please remember that I provide general wellness guidance and am not a substitute for professional medical advice.', timestamp: '2026-05-01T10:00:00Z' },
];

export const mockCalendarEvents = [
  { id: 'evt_001', title: 'Cardiology Checkup', date: '2026-05-12', time: '10:30 AM', type: 'appointment', color: 'var(--color-primary)' },
  { id: 'evt_002', title: 'Neurology Follow-up', date: '2026-05-15', time: '02:00 PM', type: 'appointment', color: 'var(--color-primary)' },
  { id: 'evt_003', title: 'Therapy Session', date: '2026-05-18', time: '11:00 AM', type: 'appointment', color: 'var(--color-secondary)' },
  { id: 'evt_004', title: 'Lisinopril — Morning', date: '2026-05-12', time: '08:00 AM', type: 'medication', color: 'var(--color-success)' },
  { id: 'evt_005', title: 'Metformin — Morning', date: '2026-05-12', time: '08:00 AM', type: 'medication', color: 'var(--color-success)' },
  { id: 'evt_006', title: 'Blood Test', date: '2026-05-20', time: '09:00 AM', type: 'lab', color: 'var(--color-warning)' },
];
