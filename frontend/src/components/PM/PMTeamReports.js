import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const PMTeamReports = () => {
  const [reportData, setReportData] = useState({
    teamStats: [],
    averageHours: 0,
    submissionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      // Fetch users (team members)
      const usersRes = await fetch("/api/admin");
      const users = usersRes.ok ? await usersRes.json() : [];
      const employees = users.filter(u => u.role === "EMPLOYEE");

      // Fetch timesheets
      const timesheetsRes = await fetch("/api/timesheets/all");
      const result = timesheetsRes.ok ? await timesheetsRes.json() : { timesheets: [] };
      const timesheets = Array.isArray(result.timesheets) ? result.timesheets : [];

      // Build team statistics
      const teamStats = employees.map(emp => {
        const empTimesheets = timesheets.filter(t => 
          typeof t.employeeId === 'object' 
            ? t.employeeId?.employeeId === emp.employeeId 
            : t.employeeId === emp.employeeId
        );
        const totalHours = empTimesheets.reduce((sum, t) => sum + (t.hoursWorked || 0), 0);
        const avgHours = empTimesheets.length > 0 ? (totalHours / empTimesheets.length).toFixed(2) : 0;
        return {
          name: `${emp.firstName} ${emp.lastName}`,
          employeeId: emp.employeeId,
          totalHours,
          avgHours,
          submittedCount: empTimesheets.length,
          approvedCount: empTimesheets.filter(t => t.status === "APPROVED").length
        };
      });
      const totalHours = teamStats.reduce((sum, stat) => sum + stat.totalHours, 0);
      const avgHours = employees.length > 0 ? (totalHours / employees.length).toFixed(2) : 0;
      const submissionRate = employees.length > 0 
        ? ((teamStats.reduce((sum, stat) => sum + stat.submittedCount, 0) / employees.length) * 100).toFixed(1)
        : 0;
      setReportData({
        teamStats: teamStats.sort((a, b) => b.totalHours - a.totalHours),
        averageHours: avgHours,
        submissionRate
      });
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">{translations[language].loadingTeamReports || "Loading team reports..."}</div>;

  return (
    <div className="pm-team-reports">
      <h3>{translations[language].teamPerformanceReport || "Team Performance Report"}</h3>

      {/* Summary Stats */}
      <div className="report-summary">
        <div className="summary-card">
          <div className="summary-label">{translations[language].averageHoursPerMember || "Average Hours per Member"}</div>
          <div className="summary-value">{reportData.averageHours}</div>
          <div className="summary-unit">{translations[language].hours || "hours"}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">{translations[language].submissionRate || "Submission Rate"}</div>
          <div className="summary-value">{reportData.submissionRate}%</div>
        </div>
      </div>

      {/* Team Table */}
      <div className="team-report-table">
        <table>
          <thead>
            <tr>
              <th>{translations[language].employee || "Employee"}</th>
              <th>{translations[language].employeeId || "ID"}</th>
              <th>{translations[language].totalHours || "Total Hours"}</th>
              <th>{translations[language].avgHours || "Avg Hours"}</th>
              <th>{translations[language].submitted || "Submitted"}</th>
              <th>{translations[language].approved || "Approved"}</th>
              <th>{translations[language].approvalRate || "Approval Rate"}</th>
            </tr>
          </thead>
          <tbody>
            {reportData.teamStats.map(stat => (
              <tr key={stat.employeeId}>
                <td className="name-cell">{stat.name}</td>
                <td>{stat.employeeId}</td>
                <td className="number-cell">{stat.totalHours.toFixed(2)}</td>
                <td className="number-cell">{stat.avgHours}</td>
                <td className="number-cell">{stat.submittedCount}</td>
                <td className="number-cell">{stat.approvedCount}</td>
                <td className="percentage-cell">
                  {stat.submittedCount > 0 
                    ? ((stat.approvedCount / stat.submittedCount) * 100).toFixed(0) + '%'
                    : '—'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Performers */}
      {reportData.teamStats.length > 0 && (
        <div className="top-performers">
          <h4>{translations[language].topPerformersByHours || "Top Performers (by hours)"}</h4>
          <div className="performers-list">
            {reportData.teamStats.slice(0, 3).map((stat, idx) => (
              <div key={stat.employeeId} className="performer-item">
                <div className="rank-badge">{idx + 1}</div>
                <div className="performer-info">
                  <div className="performer-name">{stat.name}</div>
                  <div className="performer-hours">{stat.totalHours.toFixed(2)} {translations[language].hours || "hours"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PMTeamReports;
