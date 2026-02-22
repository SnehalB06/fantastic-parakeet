import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import AdminUserManagement from "../components/Admin/AdminUserManagement";
import AdminReports from "../components/Admin/AdminReports";
import AdminSettings from "../components/Admin/AdminSettings";
import AdminTimesheets from "../components/Admin/AdminTimesheets";
import "../styles/adminPanel.css";
import { useLanguage } from "../context/LanguageContext";
import translations from "../translations";

const AdminPanel = () => {
  const { user, isAdmin, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTimesheets: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate("/");
      return;
    }
    fetchAdminStats();
  }, [user, isAdmin, navigate]);

  const fetchAdminStats = async () => {
    try {
      // Fetch users count
      const usersRes = await fetch("/api/admin");
      if (usersRes.ok) {
        const users = await usersRes.json();
        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
          activeUsers: users.filter(u => u.status === "ACTIVE").length
        }));
      }

      // Fetch timesheets count
      const timesheetsRes = await fetch("/api/timesheets/all");
      if (timesheetsRes.ok) {
        const result = await timesheetsRes.json();
        const timesheets = Array.isArray(result.timesheets) ? result.timesheets : [];
        setStats(prev => ({
          ...prev,
          totalTimesheets: timesheets.length,
          pendingApprovals: timesheets.filter(t => t.status === "PENDING").length
        }));
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <AdminUserManagement onRefresh={fetchAdminStats} />;
      case "timesheets":
        return <AdminTimesheets />;
      case "reports":
        return <AdminReports />;
      case "settings":
        return <AdminSettings />;
      default:
        return null;
    }
  };

  if (!user || !isAdmin()) return null;

  return (
    <div className="admin-panel">
      <div className="admin-header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <h1>{translations[language].systemAdministration || "System Administration"}</h1>
        <button className="btn-logout" onClick={logout} style={{marginLeft: 16}}>
          {translations[language].logout || "Logout"}
        </button>
      </div>

      {/* Modern Stats Tiles */}
      <div className="admin-stats">
        <div className="stat-card modern-tile">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #2196F3 60%, #21CBF3 100%)'}}>
            <span role="img" aria-label="users">👥</span>
          </div>
          <div>
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">{translations[language].totalUsers || "Total Users"}</div>
          </div>
        </div>
        <div className="stat-card modern-tile">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #43e97b 60%, #38f9d7 100%)'}}>
            <span role="img" aria-label="active">✅</span>
          </div>
          <div>
            <div className="stat-number">{stats.activeUsers}</div>
            <div className="stat-label">{translations[language].activeUsers || "Active Users"}</div>
          </div>
        </div>
        <div className="stat-card modern-tile">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #f7971e 60%, #ffd200 100%)'}}>
            <span role="img" aria-label="timesheets">🗂️</span>
          </div>
          <div>
            <div className="stat-number">{stats.totalTimesheets}</div>
            <div className="stat-label">{translations[language].totalTimesheets || "Total Timesheets"}</div>
          </div>
        </div>
        <div className="stat-card modern-tile highlight">
          <div className="stat-icon" style={{background: 'linear-gradient(135deg, #f953c6 60%, #b91d73 100%)'}}>
            <span role="img" aria-label="pending">⏳</span>
          </div>
          <div>
            <div className="stat-number">{stats.pendingApprovals}</div>
            <div className="stat-label">{translations[language].pendingApprovals || "Pending Approvals"}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs modern-tab-tiles">
        <button
          className={`admin-tab modern-tab-tile ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <span className="tab-icon" style={{background: 'linear-gradient(135deg, #2196F3 60%, #21CBF3 100%)'}}>
            👥
          </span>
          <span className="tab-label">{translations[language].userManagement || "User Management"}</span>
        </button>
        <button
          className={`admin-tab modern-tab-tile ${activeTab === "timesheets" ? "active" : ""}`}
          onClick={() => setActiveTab("timesheets")}
        >
          <span className="tab-icon" style={{background: 'linear-gradient(135deg, #f7971e 60%, #ffd200 100%)'}}>
            🗂️
          </span>
          <span className="tab-label">{translations[language].timesheetsTab || "Timesheets"}</span>
        </button>
        <button
          className={`admin-tab modern-tab-tile ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          <span className="tab-icon" style={{background: 'linear-gradient(135deg, #43e97b 60%, #38f9d7 100%)'}}>
            📊
          </span>
          <span className="tab-label">{translations[language].reportsTab || "Reports"}</span>
        </button>
        <button
          className={`admin-tab modern-tab-tile ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <span className="tab-icon" style={{background: 'linear-gradient(135deg, #f953c6 60%, #b91d73 100%)'}}>
            ⚙️
          </span>
          <span className="tab-label">{translations[language].settingsTab || "Settings"}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPanel;
