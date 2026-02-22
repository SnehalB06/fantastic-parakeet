import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    employeeId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "MALE",
    password: "",
    confirmPassword: "",
    role: "EMPLOYEE",
  });

  // Only allow admin registration if a special query param is present (for demo, use ?admin=1)
  const isAdminAllowed = window.location.search.includes('admin=1');
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.employeeId.trim()) {
      setError("Employee ID is required");
      return false;
    }
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!/^\d{10}$|^\d{3}-\d{3}-\d{4}$|^\+\d{1,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number");
      return false;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.gender) {
      setError("Please select a gender");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Send registration data to backend (exclude confirmPassword)
      const { confirmPassword, ...dataToSend } = formData;
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || "Registration failed");
      }

      const newUser = await res.json();

      // Show success message
      setSuccess("Registration successful! Redirecting to login...");

      // Auto-login after registration
      setTimeout(() => {
        login({
          employeeId: newUser.employeeId,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          email: newUser.email,
        });
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <h1>Create Your Account</h1>
          <p className="register-subtitle">Join RCC Timesheet System</p>

          <form onSubmit={handleRegister} className="register-form">
            {/* Row 1: Employee ID and First Name */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="employeeId">Employee ID *</label>
                <input
                  id="employeeId"
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="emp001"
                  className="form-input"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Row 2: Middle Name and Last Name */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="middleName">Middle Name</label>
                <input
                  id="middleName"
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  placeholder="Alexander"
                  className="form-input"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Row 3: Email and Phone */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className="form-input"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="123-456-7890"
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Row 4: Gender and Password */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Row 5: Confirm Password */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Row 6: Role Selection */}
            <div className="form-group">
              <label htmlFor="role">Account Type *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
                disabled={loading}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="PM">Project Manager</option>
                <option value="CLIENT">Client</option>
                {isAdminAllowed && <option value="ADMIN">Admin</option>}
              </select>
              <span className="field-help">
                Admins are assigned by system administrators only.
                {isAdminAllowed && (
                  <span style={{ color: 'red', fontWeight: 'bold', display: 'block' }}>
                    Warning: You are registering an ADMIN account. This should only be done by authorized personnel!
                  </span>
                )}
              </span>
            </div>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Success Message */}
            {success && <div className="success-message">{success}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-register"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="auth-links">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="link-login">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Info Box */}
          <div className="register-info">
            <h4>Account Information</h4>
            <ul>
              <li><strong>EMPLOYEE:</strong> Can view and manage own timesheets</li>
              <li><strong>PM:</strong> Can view and manage team timesheets</li>
              <li><strong>CLIENT:</strong> Can view project timesheet reports</li>
              <li><strong>ADMIN:</strong> Full system access (admin only)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
