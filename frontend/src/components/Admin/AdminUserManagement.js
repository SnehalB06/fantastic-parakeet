import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";
import { useState, useEffect } from "react";

const AdminUserManagement = ({ onRefresh }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "EMPLOYEE",
    status: "ACTIVE"
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === "ALL" || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
    setFilteredUsers(filtered);
  };

  const handleEditUser = (user) => {
    setEditingUser(user._id);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    });
    setShowForm(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    try {
      const res = await fetch(`/api/admin/${editingUser}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        fetchUsers();
        if (onRefresh) onRefresh();
        setShowForm(false);
        setEditingUser(null);
      }
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const handleDeleteUser = async (employeeId) => {
    if (window.confirm(`Delete user ${employeeId}?`)) {
      try {
        const res = await fetch(`/api/admin/${employeeId}`, {
          method: "DELETE"
        });
        
        if (res.ok) {
          fetchUsers();
          if (onRefresh) onRefresh();
        }
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

  const toggleUserStatus = async (user) => {
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/${user.employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        fetchUsers();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const { language } = useLanguage();
  if (loading) return <div className="loading">{translations[language].loadingUsers || "Loading users..."}</div>;

  return (
    <div className="user-management">
      {/* Search and Filter */}
      <div className="management-toolbar">
        <input
          type="text"
          placeholder={translations[language].searchByIdNameEmail || "Search by ID, name, or email..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="filter-select"
        >
          <option value="ALL">{translations[language].allRoles || "All Roles"}</option>
          <option value="EMPLOYEE">{translations[language].employee || "Employee"}</option>
          <option value="PM">{translations[language].projectManager || "Project Manager"}</option>
          <option value="CLIENT">{translations[language].client || "Client"}</option>
          <option value="ADMIN">{translations[language].admin || "Admin"}</option>
        </select>
        <span className="result-count">{filteredUsers.length} {translations[language].usersFound || "users found"}</span>
      </div>

      {/* Users Table */}
      <div className="users-cards-list">
        {filteredUsers.map(user => (
          <div key={user._id} className={`user-card-row${user.status === "INACTIVE" ? " inactive" : ""}`}>
            <div className="user-card-main">
              <div className="user-avatar">
                <span role="img" aria-label="user">👤</span>
              </div>
              <div className="user-info">
                <div className="user-name">{user.firstName} {user.lastName}</div>
                <div className="user-meta">{user.employeeId} &bull; {user.email}</div>
                <div className="user-role-status">
                  <span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span>
                  <span className={`status-badge status-${user.status.toLowerCase()}`}>{user.status}</span>
                </div>
              </div>
            </div>
            <div className="user-actions">
              <button
                className="btn-icon btn-edit"
                onClick={() => handleEditUser(user)}
                title="Edit user"
              >
                <span role="img" aria-label="edit">✏️</span>
              </button>
              <button
                className={`btn-icon btn-status ${user.status === "ACTIVE" ? "btn-deactivate" : "btn-activate"}`}
                onClick={() => toggleUserStatus(user)}
                title={user.status === "ACTIVE" ? "Deactivate" : "Activate"}
              >
                {user.status === "ACTIVE" ? <span role="img" aria-label="deactivate">🚫</span> : <span role="img" aria-label="activate">✅</span>}
              </button>
              <button
                className="btn-icon btn-delete"
                onClick={() => handleDeleteUser(user.employeeId)}
                title="Delete user"
              >
                <span role="img" aria-label="delete">🗑️</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{translations[language].editUser || "Edit User"}</h3>
            <div className="form-group">
              <label>{translations[language].firstName || "First Name"}</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{translations[language].lastName || "Last Name"}</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{translations[language].email || "Email"}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{translations[language].phone || "Phone"}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{translations[language].role || "Role"}</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="EMPLOYEE">{translations[language].employee || "Employee"}</option>
                <option value="PM">{translations[language].projectManager || "Project Manager"}</option>
                <option value="CLIENT">{translations[language].client || "Client"}</option>
                <option value="ADMIN">{translations[language].admin || "Admin"}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{translations[language].status || "Status"}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">{translations[language].active || "Active"}</option>
                <option value="INACTIVE">{translations[language].inactive || "Inactive"}</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={handleSaveUser}>{translations[language].save || "Save"}</button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>{translations[language].cancel || "Cancel"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
