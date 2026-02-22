import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";
import { useState, useEffect } from "react";

const AdminReports = () => {
  const { language } = useLanguage();
  const [reportData, setReportData] = useState({
    usersByRole: {},
    timesheetsByStatus: {},
    averageHours: 0,
    totalHours: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      // Fetch users
      const usersRes = await fetch("/api/admin");
      const users = usersRes.ok ? await usersRes.json() : [];

      // Fetch timesheets
      const timesheetsRes = await fetch("/api/timesheets/all");
      const result = timesheetsRes.ok ? await timesheetsRes.json() : { timesheets: [] };
      const timesheets = Array.isArray(result.timesheets) ? result.timesheets : [];

      // Process data
      const usersByRole = {
        ADMIN: users.filter(u => u.role === "ADMIN").length,
        PM: users.filter(u => u.role === "PM").length,
        CLIENT: users.filter(u => u.role === "CLIENT").length,
        EMPLOYEE: users.filter(u => u.role === "EMPLOYEE").length
      };

      const timesheetsByStatus = {
        PENDING: timesheets.filter(t => t.status === "PENDING").length,
        APPROVED: timesheets.filter(t => t.status === "APPROVED").length,
        REJECTED: timesheets.filter(t => t.status === "REJECTED").length
      };

      const totalHours = timesheets.reduce((sum, t) => sum + (t.hoursWorked || 0), 0);
      const averageHours = users.length > 0 ? (totalHours / users.length).toFixed(2) : 0;

      setReportData({
        usersByRole,
        timesheetsByStatus,
        totalHours,
        averageHours
      });
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">{translations[language].loadingReports || "Loading reports..."}</div>;

  return (
    <div className="admin-reports">
      <h2>{translations[language].systemReports || "System Reports"}</h2>

      {/* Users by Role */}
      <div className="report-section">
        <h3>{translations[language].usersByRole || "Users by Role"}</h3>
        <div className="report-grid">
          <div className="report-card">
            <div className="report-label">{translations[language].administrators || "Administrators"}</div>
            <div className="report-value">{reportData.usersByRole.ADMIN}</div>
          </div>
          <div className="report-card">
            <div className="report-label">{translations[language].projectManagers || "Project Managers"}</div>
            <div className="report-value">{reportData.usersByRole.PM}</div>
          </div>
          <div className="report-card">
            <div className="report-label">{translations[language].clients || "Clients"}</div>
            <div className="report-value">{reportData.usersByRole.CLIENT}</div>
          </div>
          <div className="report-card">
            <div className="report-label">{translations[language].employees || "Employees"}</div>
            <div className="report-value">{reportData.usersByRole.EMPLOYEE}</div>
          </div>
        </div>
      </div>

      {/* Timesheets by Status */}
      <div className="report-section">
        <h3>{translations[language].timesheetsByStatus || "Timesheets by Status"}</h3>
        <div className="report-grid">
          <div className="report-card status-pending">
            <div className="report-label">{translations[language].pending || "Pending"}</div>
            <div className="report-value">{reportData.timesheetsByStatus.PENDING}</div>
          </div>
          <div className="report-card status-approved">
            <div className="report-label">{translations[language].approved || "Approved"}</div>
            <div className="report-value">{reportData.timesheetsByStatus.APPROVED}</div>
          </div>
          <div className="report-card status-rejected">
            <div className="report-label">{translations[language].rejected || "Rejected"}</div>
            <div className="report-value">{reportData.timesheetsByStatus.REJECTED}</div>
          </div>
        </div>
      </div>

      {/* Hours Statistics */}
      <div className="report-section">
        <h3>{translations[language].hoursStatistics || "Hours Statistics"}</h3>
        <div className="report-grid">
          <div className="report-card">
            <div className="report-label">{translations[language].totalHoursWorked || "Total Hours Worked"}</div>
            <div className="report-value">{reportData.totalHours.toFixed(2)}</div>
            <div className="report-unit">{translations[language].hours || "hours"}</div>
          </div>
          <div className="report-card">
            <div className="report-label">{translations[language].averageHoursPerEmployee || "Average Hours per Employee"}</div>
            <div className="report-value">{reportData.averageHours}</div>
            <div className="report-unit">{translations[language].hours || "hours"}</div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="report-actions">
        <button className="btn-export">📥 {translations[language].exportToCSV || "Export to CSV"}</button>
        <button className="btn-export">📑 {translations[language].printReport || "Print Report"}</button>
      </div>
    </div>
  );
};

export default AdminReports;
