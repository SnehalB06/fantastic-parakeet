import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PMTeamTimesheets from "../components/PM/PMTeamTimesheets";
import PMApprovals from "../components/PM/PMApprovals";
import PMTeamReports from "../components/PM/PMTeamReports";
import PMProjectHours from "../components/PM/PMProjectHours";
import PMProjects from "../components/PM/PMProjects";
import "../styles/pmDashboard.css";

const PMDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("timesheets");
  const [stats, setStats] = useState({
    teamMembers: 0,
    submittedTimesheets: 0,
    pendingApprovals: 0,
    totalTeamHours: 0
  });

  useEffect(() => {
    if (!user || user.role !== "PM") {
      navigate("/");
      return;
    }
    fetchPMStats();
  }, [user, navigate]);

  const fetchPMStats = async () => {
    try {
      // Fetch all users
      const usersRes = await fetch("/api/admin");
      if (usersRes.ok) {
        const users = await usersRes.json();
        // For demo, assume PM can see timesheets for employees (in real app, would filter by team)
        setStats(prev => ({
          ...prev,
          teamMembers: users.filter(u => u.role === "EMPLOYEE").length
        }));
      }

      // Fetch timesheets
      const timesheetsRes = await fetch("/api/timesheets/all");
      if (timesheetsRes.ok) {
        const result = await timesheetsRes.json();
        const timesheets = Array.isArray(result.timesheets) ? result.timesheets : [];
        setStats(prev => ({
          ...prev,
          submittedTimesheets: timesheets.length,
          pendingApprovals: timesheets.filter(t => t.status === "PENDING").length,
          totalTeamHours: timesheets.reduce((sum, t) => sum + (t.hoursWorked || 0), 0)
        }));
      }
    } catch (err) {
      console.error("Error fetching PM stats:", err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "timesheets":
        return <PMTeamTimesheets />;
      case "approvals":
        return <PMApprovals onRefresh={fetchPMStats} />;
      case "reports":
        return <PMTeamReports />;
      case "projecthours":
        return <PMProjectHours />;
      case "projects":
        return <PMProjects />;
      default:
        return null;
    }
  };

  if (!user || user.role !== "PM") return null;

  return (
    <div className="pm-dashboard">
      <div className="pm-header-top">
        <div className="pm-title-section">
          <h1>👨‍💼 Project Manager Dashboard</h1>
          <p className="pm-subtitle">Manage and approve your team's timesheets</p>
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div className="pm-stats-compact">
        <div className="pm-stat-mini">
          <div className="pm-stat-mini-value">{stats.teamMembers}</div>
          <div className="pm-stat-mini-label">Team</div>
        </div>
        <div className="pm-stat-mini">
          <div className="pm-stat-mini-value">{stats.submittedTimesheets}</div>
          <div className="pm-stat-mini-label">Submitted</div>
        </div>
        <div className="pm-stat-mini highlight">
          <div className="pm-stat-mini-value">{stats.pendingApprovals}</div>
          <div className="pm-stat-mini-label">Pending</div>
        </div>
        <div className="pm-stat-mini">
          <div className="pm-stat-mini-value">{stats.totalTeamHours.toFixed(0)}h</div>
          <div className="pm-stat-mini-label">Total Hours</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pm-tabs modern-tab-tiles">
        <button
          className={`pm-tab modern-tab-tile ${activeTab === "timesheets" ? "active" : ""}`}
          onClick={() => setActiveTab("timesheets")}
        >
          <span className="tab-icon" style={{background: 'linear-gradient(135deg, #2196F3 60%, #21CBF3 100%)'}}>
            📊
          </span>
          <span className="tab-label">Team Timesheets</span>
        </button>
        <button
          className={`pm-tab modern-tab-tile ${activeTab === "approvals" ? "active" : ""}`}
          onClick={() => setActiveTab("approvals")}
        >
          <span className="tab-icon" style={{background: 'linear-gradient(135deg, #43e97b 60%, #38f9d7 100%)'}}>
            ✅
          </span>
          <span className="tab-label">Approvals ({stats.pendingApprovals})</span>
        </button>
        <button
          className={`pm-tab modern-tab-tile ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          <span className="tab-icon" style={{background: 'linear-gradient(135deg, #f7971e 60%, #ffd200 100%)'}}>
            📈
          </span>
          <span className="tab-label">Reports</span>
        </button>
        <button
          className={`pm-tab modern-tab-tile ${activeTab === "projecthours" ? "active" : ""}`}
          onClick={() => setActiveTab("projecthours")}
        >
          <span className="tab-icon" style={{background: 'linear-gradient(135deg, #b721ff 60%, #21d4fd 100%)'}}>
            🏗️
          </span>
          <span className="tab-label">Project Hours</span>
        </button>
      </div>

      {/* Add Projects Tab */}
      <button
        className={`pm-tab modern-tab-tile ${activeTab === "projects" ? "active" : ""}`}
        onClick={() => setActiveTab("projects")}
      >
        <span className="tab-icon" style={{background: 'linear-gradient(135deg, #ff6a00 60%, #ee0979 100%)'}}>
          🗂️
        </span>
        <span className="tab-label">Projects</span>
      </button>

      {/* Tab Content */}
      <div className="pm-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default PMDashboard;
