import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ClientBillingView from "../components/Client/ClientBillingView";
import ClientReportView from "../components/Client/ClientReportView";
import AddProjectForm from "../components/Project/AddProjectForm";
import AllProjectsList from "../components/Project/AllProjectsList";
import "../styles/clientDashboard.css";

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("billing");
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "CLIENT") {
      navigate("/");
      return;
    }
    fetchClientStats();
    fetchProjects();
  }, [user, navigate]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch {
      setProjects([]);
    }
  };

  const fetchClientStats = async () => {
    try {
      // Fetch timesheets to calculate billable hours
      const timesheetsRes = await fetch("/api/timesheets/all");
      if (timesheetsRes.ok) {
        // ...existing code to fetch and process stats, but do not setStats
      }
    } catch (err) {
      console.error("Error fetching client stats:", err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "billing":
        return <ClientBillingView />;
      case "reports":
        return <ClientReportView />;
      default:
        return null;
    }
  };

  if (!user || user.role !== "CLIENT") return null;

  return (
    <div className="client-dashboard">
      <div className="client-header-grid">
        <div>
          <h1 className="client-dashboard-title">Client Dashboard</h1>
        </div>
        <div className="client-action-grid">
          <button className="btn btn-primary" onClick={() => { setShowAddProject(true); setShowAllProjects(false); }}>➕ Add Project</button>
          <button className="btn btn-secondary" onClick={() => { setShowAllProjects(true); setShowAddProject(false); }}>📋 Show All Projects</button>
          {(showAddProject || showAllProjects) && (
            <button className="btn" onClick={() => { setShowAddProject(false); setShowAllProjects(false); }}>✖ Close</button>
          )}
        </div>
      </div>

      {showAddProject && <AddProjectForm onSuccess={() => { setShowAddProject(false); fetchProjects(); fetchClientStats(); }} />}
      {showAllProjects && <AllProjectsList projects={projects} />}

      {!showAddProject && !showAllProjects && <>
        {/* Stats Cards by Project */}
        <div className="client-project-tiles-grid">
          {projects.map(project => (
            <div className="client-project-card" key={project._id}>
              <div className="client-project-title">{project.name}</div>
              <div className="client-project-desc">{project.description}</div>
              <div className="client-project-billing">
                <div><b>Hourly Rate:</b> ${project.billing?.hourlyRate || 50}</div>
                <div><b>Budget:</b> {project.billing?.budget ? `$${project.billing.budget}` : '-'}</div>
                <div><b>Currency:</b> {project.billing?.currency || 'USD'}</div>
                {project.billing?.notes && <div><b>Notes:</b> {project.billing.notes}</div>}
              </div>
              <div className="client-project-meta">
                <span>Status: {project.status}</span>
                <span>Start: {project.startDate ? project.startDate.slice(0,10) : "-"}</span>
                <span>End: {project.endDate ? project.endDate.slice(0,10) : "-"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="client-tabs modern">
          <button
            className={`client-tab ${activeTab === "billing" ? "active" : ""}`}
            onClick={() => setActiveTab("billing")}
          >
            💵 Billing Summary
          </button>
          <button
            className={`client-tab ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            📊 Detailed Reports
          </button>
        </div>

        {/* Tab Content */}
        <div className="client-content">
          {renderContent()}
        </div>
      </>}
    </div>
  );
};

export default ClientDashboard;
