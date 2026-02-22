import { useState } from "react";

const RegisterUserCard = ({ onSuccess }) => {
  const [form, setForm] = useState({
    employeeId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "EMPLOYEE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic frontend validation
    if (
      !form.employeeId ||
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.phone
    ) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          employeeId: form.employeeId.trim(),
          email: form.email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Failed to register user");
        return;
      }

      // Success
      onSuccess && onSuccess();

      setForm({
        employeeId: "",
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "EMPLOYEE",
      });

      alert("User registered successfully ✅");
    } catch (err) {
      setError("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-user-card">
      <h4>➕ Register New Employee</h4>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Employee ID *</label>
          <input
            name="employeeId"
            placeholder="e.g., EMP001"
            value={form.employeeId}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>First Name *</label>
          <input
            name="firstName"
            placeholder="Enter first name"
            value={form.firstName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Middle Name</label>
          <input
            name="middleName"
            placeholder="Enter middle name"
            value={form.middleName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Last Name *</label>
          <input
            name="lastName"
            placeholder="Enter last name"
            value={form.lastName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            name="email"
            type="email"
            placeholder="Enter email address"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Phone *</label>
          <input
            name="phone"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="ADMIN">ADMIN</option>
            <option value="PM">PM</option>
            <option value="CLIENT">CLIENT</option>
          </select>
        </div>

        {error && (
          <div className="error">{error}</div>
        )}
        
        <button className="btn btn-primary" disabled={loading} style={{marginTop: '8px'}}>
          {loading ? "⏳ Registering..." : "✅ Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterUserCard;
