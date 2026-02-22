import { useState } from "react";

const SearchUserCard = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [user, setUser] = useState(null);

  const handleSearch = async () => {
    const res = await fetch(`/api/admin/${employeeId}`);
    if (!res.ok) {
      alert("Employee not found");
      return;
    }
    const data = await res.json();
    setUser(data);
  };

  return (
    <div className="search-user-card">
      <h4>🔍 Search Employee</h4>

      <div className="form-group">
        <label>Employee ID</label>
        <input
          placeholder="Enter Employee ID to search"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />
      </div>

      <button className="btn btn-primary" onClick={handleSearch}>
        🔎 Search
      </button>

      {user && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #f5f7fb, #e8ecf5)', 
            padding: '16px', 
            borderRadius: '8px',
            borderLeft: '4px solid var(--success)'
          }}>
            <p style={{margin: '0 0 12px 0'}}><strong>👤 Name:</strong> {user.firstName} {user.lastName}</p>
            <p style={{margin: '0 0 12px 0'}}><strong>📧 Email:</strong> {user.email}</p>
            <p style={{margin: '0 0 12px 0'}}><strong>📱 Phone:</strong> {user.phone}</p>
            <p style={{margin: '0 0 12px 0'}}><strong>🎯 Role:</strong> <span className={`badge badge-${user.role.toLowerCase()}`}>{user.role}</span></p>
            <p style={{margin: '0'}}><strong>✓ Status:</strong> <span className={`status ${user.status.toLowerCase()}`}>{user.status}</span></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchUserCard;
