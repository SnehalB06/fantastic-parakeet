import { useState } from "react";

const UpdateUserCard = ({ onSuccess }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [form, setForm] = useState({
    email: "",
    phone: "",
    role: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    setError("");

    const trimmedEmployeeId = employeeId.trim();

    if (!trimmedEmployeeId) {
      setError("Employee ID is required");
      return;
    }

    // Build PATCH payload dynamically
    const payload = {};
    if (form.email) payload.email = form.email.trim().toLowerCase();
    if (form.phone) payload.phone = form.phone;
    if (form.role) payload.role = form.role;
    if (form.status) payload.status = form.status;

    if (Object.keys(payload).length === 0) {
      setError("Please enter at least one field to update");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/admin/${trimmedEmployeeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Failed to update user");
        return;
      }

      onSuccess && onSuccess();

      setEmployeeId("");
      setForm({
        email: "",
        phone: "",
        role: "",
        status: "",
      });

      alert("User updated successfully ✏️");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-user-card">
      <h4>✏️ Update Employee</h4>

      <div className="form-group">
        <label>Employee ID *</label>
        <input
          placeholder="Enter Employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          name="email"
          type="email"
          placeholder="Enter new email"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Phone</label>
        <input
          name="phone"
          placeholder="Enter new phone"
          value={form.phone}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Role</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="EMPLOYEE">EMPLOYEE</option>
          <option value="ADMIN">ADMIN</option>
          <option value="PM">PM</option>
          <option value="CLIENT">CLIENT</option>
        </select>
      </div>

      <div className="form-group">
        <label>Status</label>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="">Select Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      {error && (
        <div className="error">{error}</div>
      )}

      <button
        className="btn btn-success"
        onClick={handleUpdate}
        disabled={loading}
        style={{marginTop: '8px'}}
      >
        {loading ? "⏳ Updating..." : "✅ Update"}
      </button>
    </div>
  );
};

export default UpdateUserCard;
