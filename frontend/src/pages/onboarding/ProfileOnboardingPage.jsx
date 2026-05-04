import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/routePaths';
import { createPatientProfile } from '../../api/patientsApi';
import { createDoctorProfile } from '../../api/doctorsApi';
import '../OnboardingPages.css';

export default function ProfileOnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDoctor = user?.role === 'doctor';

  // Patient form state
  const [patientForm, setPatientForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    medical_history: '',
  });

  // Doctor form state
  const [doctorForm, setDoctorForm] = useState({
    full_name: '',
    specialization: '',
    clinic_location: '',
    contact_phone: '',
  });

  const handlePatientChange = (e) =>
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });

  const handleDoctorChange = (e) =>
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isDoctor) {
        if (!doctorForm.full_name || !doctorForm.specialization) {
          setError('Full name and specialization are required');
          setLoading(false);
          return;
        }
        await createDoctorProfile(doctorForm);
      } else {
        if (!patientForm.first_name || !patientForm.last_name) {
          setError('First name and last name are required');
          setLoading(false);
          return;
        }
        // Only send non-empty fields
        const payload = { ...patientForm };
        Object.keys(payload).forEach((key) => {
          if (!payload[key]) delete payload[key];
        });
        // first_name and last_name are always required
        payload.first_name = patientForm.first_name;
        payload.last_name = patientForm.last_name;
        await createPatientProfile(payload);
      }

      // Update local auth state to reflect profile completion
      if (updateUser) {
        updateUser({ ...user, has_profile: true });
      }

      // Doctors need admin approval — send to pending page
      if (isDoctor) {
        navigate(ROUTES.PENDING_APPROVAL);
      } else {
        navigate(ROUTES.DASHBOARD);
      }
    } catch (err) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Step indicator */}
      <div className="onboarding-steps">
        <div className="onboarding-step completed">
          <span className="onboarding-step-dot">
            <span className="material-symbols-rounded">check</span>
          </span>
          <span>Account</span>
        </div>
        <div className={`onboarding-step-line completed`} />
        <div className="onboarding-step current">
          <span className="onboarding-step-dot">2</span>
          <span>Profile</span>
        </div>
      </div>

      <Card className="onboarding-card animate-scale-in" padding="lg">
        <div className="onboarding-card-header">
          <h2>{isDoctor ? 'Doctor Profile' : 'Complete Your Profile'}</h2>
          <p>
            {isDoctor
              ? 'Set up your professional profile to start seeing patients'
              : 'Tell us about yourself to personalize your experience'}
          </p>
          <div className="onboarding-role-badge">
            <span className="material-symbols-rounded">
              {isDoctor ? 'stethoscope' : 'person'}
            </span>
            {isDoctor ? 'Doctor' : 'Patient'}
          </div>
        </div>

        {error && (
          <div className="auth-error">
            <span className="material-symbols-rounded">error</span>
            {error}
          </div>
        )}

        {isDoctor && (
          <div className="doctor-pending-notice">
            <span className="material-symbols-rounded">info</span>
            <p>
              After completing your profile, your account will need to be verified
              by an administrator before you can access all doctor features.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="onboarding-form">
          {isDoctor ? (
            /* ---- Doctor Form ---- */
            <>
              <Input
                label="Full Name"
                name="full_name"
                value={doctorForm.full_name}
                onChange={handleDoctorChange}
                required
                icon="badge"
                placeholder="Dr. Sarah Ali"
              />
              <Input
                label="Specialization"
                name="specialization"
                value={doctorForm.specialization}
                onChange={handleDoctorChange}
                required
                icon="medical_services"
                placeholder="e.g., Cardiology, Neurology"
              />
              <Input
                label="Clinic Location"
                name="clinic_location"
                value={doctorForm.clinic_location}
                onChange={handleDoctorChange}
                icon="location_on"
                placeholder="City Hospital, Building A"
              />
              <Input
                label="Contact Phone"
                type="tel"
                name="contact_phone"
                value={doctorForm.contact_phone}
                onChange={handleDoctorChange}
                icon="phone"
                placeholder="+1 555-000-0000"
              />
            </>
          ) : (
            /* ---- Patient Form ---- */
            <>
              <div className="onboarding-form-row">
                <Input
                  label="First Name"
                  name="first_name"
                  value={patientForm.first_name}
                  onChange={handlePatientChange}
                  required
                  icon="person"
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  value={patientForm.last_name}
                  onChange={handlePatientChange}
                  required
                  icon="person"
                  placeholder="Doe"
                />
              </div>
              <div className="onboarding-form-row">
                <Input
                  label="Date of Birth"
                  type="date"
                  name="date_of_birth"
                  value={patientForm.date_of_birth}
                  onChange={handlePatientChange}
                  icon="calendar_today"
                />
                <div className="input-group">
                  <label htmlFor="gender" className="input-label">Gender</label>
                  <div className="input-wrapper">
                    <span className="input-icon material-symbols-rounded">wc</span>
                    <select
                      id="gender"
                      name="gender"
                      value={patientForm.gender}
                      onChange={handlePatientChange}
                      className="input-field has-icon"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              <Input
                label="Phone Number"
                type="tel"
                name="phone_number"
                value={patientForm.phone_number}
                onChange={handlePatientChange}
                icon="phone"
                placeholder="+1 555-000-0000"
              />
              <Input
                label="Medical History"
                type="textarea"
                name="medical_history"
                value={patientForm.medical_history}
                onChange={handlePatientChange}
                icon="history"
                placeholder="Any allergies, conditions, or notes your doctor should know..."
                rows={3}
              />
            </>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
            icon={isDoctor ? 'stethoscope' : 'how_to_reg'}
          >
            {isDoctor ? 'Create Doctor Profile' : 'Complete Profile'}
          </Button>
        </form>
      </Card>
    </>
  );
}
