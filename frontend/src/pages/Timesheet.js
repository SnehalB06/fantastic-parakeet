import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchTimesheetCard from "../components/Timesheet/SearchTimesheetCard";
import DailyTimesheetCard from "../components/Timesheet/DailyTimesheetCard";
import UpdateTimesheetCard from "../components/Timesheet/UpdateTimesheetCard";
import TimesheetActionsCard from "../components/Timesheet/TimesheetActionsCard";
import TimesheetsList from "../components/Timesheet/TimesheetsList";

const Timesheet = () => {
  const { user, isAdmin, canViewAllTimesheets } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("daily");
  const [loading, setLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(canViewAllTimesheets() ? "" : user?.employeeId || "");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
    // If employee (can't view all timesheets), set their ID as selected
    if (!canViewAllTimesheets() && user?.employeeId) {
      setSelectedEmployeeId(user.employeeId);
    }
  }, [user, navigate, canViewAllTimesheets]);

  const fetchTimesheets = async () => {
    console.log("fetchTimesheets called - triggering list refresh");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRefreshTrigger(prev => {
        console.log("Incrementing refreshTrigger from", prev, "to", prev + 1);
        return prev + 1;
      });
    }, 500);
  };

  const renderActiveCard = () => {
    // Determine which employee ID to use
    const effectiveEmployeeId = selectedEmployeeId || user?.employeeId;
    
    switch (activeTab) {
      case "daily":
        return (
          <DailyTimesheetCard
            employeeId={effectiveEmployeeId}
            month={selectedMonth}
            year={selectedYear}
            onSuccess={fetchTimesheets}
          />
        );
      case "search":
        return canViewAllTimesheets() ? <SearchTimesheetCard /> : <DailyTimesheetCard employeeId={user?.employeeId} month={selectedMonth} year={selectedYear} />;
      case "update":
        return <UpdateTimesheetCard onSuccess={fetchTimesheets} />;
      case "actions":
        return canViewAllTimesheets() ? <TimesheetActionsCard onSuccess={fetchTimesheets} /> : null;
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="timesheet-page">
      <h2 className="page-title">{canViewAllTimesheets() ? "Timesheet Management" : "My Timesheet"}</h2>

      <div className="page-layout">
        {/* SIDEBAR */}
        <div className="sidebar">
          <nav className="nav-menu">
            <button
              className={`nav-item ${activeTab === "daily" ? "active" : ""}`}
              onClick={() => setActiveTab("daily")}
            >
              Daily Tracker
            </button>
            {canViewAllTimesheets() && (
              <>
                <button
                  className={`nav-item ${activeTab === "search" ? "active" : ""}`}
                  onClick={() => setActiveTab("search")}
                >
                  Search
                </button>
                <button
                  className={`nav-item ${activeTab === "update" ? "active" : ""}`}
                  onClick={() => setActiveTab("update")}
                >
                  Update
                </button>
                <button
                  className={`nav-item ${activeTab === "actions" ? "active" : ""}`}
                  onClick={() => setActiveTab("actions")}
                >
                  Actions
                </button>
              </>
            )}
          </nav>

          {activeTab === "daily" && canViewAllTimesheets() && (
            <div className="selection-panel">
              <h4>Select Timesheet</h4>
              <div className="input-group">
                <label>Employee ID:</label>
                <input
                  type="text"
                  placeholder="Paste employee ID"
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Month:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>
                      {new Date(2024, m - 1).toLocaleString("default", {
                        month: "long"
                      })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Year:</label>
                <input
                  type="number"
                  placeholder="Year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                />
              </div>
            </div>
          )}

          {activeTab === "daily" && !isAdmin() && (
            <div className="selection-panel">
              <div className="employee-info">
                <h4>Your Timesheet</h4>
                <p><strong>Employee ID:</strong> {user?.employeeId}</p>
                <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
              </div>
              <div className="input-group">
                <label>Month:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>
                      {new Date(2024, m - 1).toLocaleString("default", {
                        month: "long"
                      })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Year:</label>
                <input
                  type="number"
                  placeholder="Year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="content">
          {renderActiveCard()}
        </div>
      </div>

      {/* TIMESHEETS LIST */}
      <div className="list-section">
        <TimesheetsList loading={loading} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default Timesheet;
