import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminNavbar from "./AdminNavbar";
import RegisterUserCard from "../components/Admin/RegisterUserCard";
import SearchUserCard from "../components/Admin/SearchUserCard";
import DeleteUserCard from "../components/Admin/DeleteUserCard";
import UpdateUserCard from "../components/Admin/UpdateUserCard";
import UsersTable from "./UsersTable";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("register");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const renderActiveCard = () => {
    switch (activeTab) {
      case "register":
        return <RegisterUserCard onSuccess={fetchUsers} />;
      case "search":
        return <SearchUserCard />;
      case "update":
        return <UpdateUserCard onSuccess={fetchUsers} />;
      case "delete":
        return <DeleteUserCard onSuccess={fetchUsers} />;
      default:
        return null;
    }
  };

  return (
    
    <div className="admin-page">
      <h2 className="admin-title">Admin Dashboard</h2>

      <div className="admin-layout">
        {/* LEFT SIDEBAR */}
        <AdminNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* RIGHT CONTENT */}
        <div className="admin-content">
          {renderActiveCard()}
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="users-section">
        <div className="users-header">
          <h3>All Employees ({users.length})</h3>
          <button 
            className="btn-refresh-users" 
            onClick={fetchUsers}
            disabled={loading}
            title="Refresh employee list"
          >
            🔄 Refresh
          </button>
        </div>
        <UsersTable users={users} loading={loading} />
      </div>
    </div>
  );
};

export default Admin;
