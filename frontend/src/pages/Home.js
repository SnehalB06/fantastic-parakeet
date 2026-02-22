import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DailyHoursChart from "../components/DailyHoursChart";
import EmployeeHoursChart from "../components/EmployeeHoursChart";

const Home = () => {
  const { user, canViewAllTimesheets } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Role-based navigation
    if (user.role === "ADMIN") {
      navigate("/admin");
    } else if (user.role === "PM") {
      navigate("/pm-dashboard");
    } else if (user.role === "CLIENT") {
      navigate("/client-dashboard");
    }
  }, [user, navigate]);

  const fetchData = useCallback(async () => {
    try {
      // Fetch employees
      const employeeRes = await fetch("/api/admin");
      if (!employeeRes.ok) throw new Error("Fetch employees failed");
      const employeeData = await employeeRes.json();
      
      // If user is employee, show only their data
      if (!canViewAllTimesheets()) {
        const userEmployee = employeeData.find(e => e.employeeId === user.employeeId);
        if (userEmployee) {
          setEmployees([userEmployee]);
        }
      } else {
        setEmployees(employeeData);
      }
      
      // Count active employees
      const active = employeeData.filter(e => e.status === "ACTIVE").length;
      setActiveEmployees(active);

      // Fetch timesheets
      const timesheetRes = await fetch("/api/timesheets/all");
      if (timesheetRes.ok) {
        let result = await timesheetRes.json();
        let timesheetData = Array.isArray(result.timesheets) ? result.timesheets : [];
        // If user is employee, filter to only their timesheets
        if (!canViewAllTimesheets()) {
          timesheetData = timesheetData.filter(ts => ts.employeeId === user.employeeId);
        }
        setTimesheets(timesheetData);
        // Calculate total hours from all timesheets
        const total = timesheetData.reduce((sum, ts) => {
          // Sum all daily hours from each timesheet
          const sheetHours = ts.dailyHours ? ts.dailyHours.reduce((daySum, day) => daySum + (day.hours || 0), 0) : 0;
          return sum + sheetHours;
        }, 0);
        setTotalHours(total);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [canViewAllTimesheets, user]);

  useEffect(() => {
    if (user) {
      fetchData();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchData();
        setRefreshKey(prev => prev + 1);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, fetchData]);

  if (loading) return <div className="loading-spinner"><p>Loading dashboard...</p></div>;
  if (!user) return null;

  const stats = canViewAllTimesheets() 
    ? [
        { icon: "👥", label: "Total Employees", value: employees.length },
        { icon: "✓", label: "Active Employees", value: activeEmployees },
        { icon: "📋", label: "Total Timesheets", value: timesheets.length },
        { icon: "⏱️", label: "Total Hours Logged", value: totalHours.toFixed(1) },
      ]
    : [
        { icon: "👤", label: "Employee ID", value: user.employeeId },
        { icon: "📋", label: "Timesheets", value: timesheets.length },
        { icon: "⏱️", label: "Total Hours Logged", value: totalHours.toFixed(1) },
        { icon: "📊", label: "Average Per Timesheet", value: timesheets.length > 0 ? (totalHours / timesheets.length).toFixed(1) : "0" },
      ];

  return (
    <div className="home-page">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="banner-content">
          <h1>Welcome to RCC Timesheet System, {user.firstName}!</h1>
          <p>{canViewAllTimesheets() ? "Admin Dashboard - Manage all employee timesheets" : "View and manage your timesheet data"}</p>
          <button className="btn-refresh" onClick={() => { fetchData(); setRefreshKey(prev => prev + 1); }} title="Refresh data">
            🔄 Refresh Now
          </button>
        </div>
      </div>

      {/* Quick Stats Dashboard */}
      <div className="stats-dashboard">
        {stats.map((stat, idx) => (
          <div className="stat-card" key={idx}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h4>{stat.label}</h4>
              <p className="stat-number">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <DailyHoursChart refreshTrigger={refreshKey} isAdmin={canViewAllTimesheets()} userEmployeeId={user.employeeId} />
        {canViewAllTimesheets() && <EmployeeHoursChart refreshTrigger={refreshKey} />}
      </div>

      {/* Employees Table */}
      {/* Removed - Employee Directory hidden from home page */}
    </div>
  );
};

export default Home;
