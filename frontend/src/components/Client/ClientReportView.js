import { useState, useEffect } from "react";
import { timesheetAPI } from "../../services/timesheetService";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const ClientReportView = () => {
  const [reportData, setReportData] = useState({
    employeeReports: [],
    projectSummary: [],
    periodSummary: {}
  });
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Use paginated API, fetch all approved timesheets (large limit for now)
      const result = await timesheetAPI.getTimesheetsPaginated({ status: "APPROVED", page: 1, limit: 100 });
      const approved = Array.isArray(result.timesheets) ? result.timesheets : [];

      // Employee-wise report
      const employeeMap = {};
      approved.forEach(ts => {
        const empId = ts.employeeId?.employeeId || ts.employeeId;
        const empName = ts.employeeId?.firstName + " " + ts.employeeId?.lastName;
        if (!employeeMap[empId]) {
          employeeMap[empId] = {
            employeeId: empId,
            name: empName,
            totalHours: 0,
            totalCost: 0,
            projects: new Set(),
            timesheetCount: 0
          };
        }
        const hours = ts.hoursWorked || 0;
        employeeMap[empId].totalHours += hours;
        employeeMap[empId].totalCost += hours * 50; // $50/hr
        employeeMap[empId].timesheetCount += 1;
        if (ts.dailyHours && ts.dailyHours.length > 0) {
          ts.dailyHours.forEach(dh => {
            if (dh.project) employeeMap[empId].projects.add(dh.project);
          });
        }
      });

      const employeeReports = Object.values(employeeMap).map(emp => ({
        ...emp,
        projects: Array.from(emp.projects).join(", ")
      }));

      // Project summary
      const projectMap = {};
      approved.forEach(ts => {
        if (ts.dailyHours) {
          ts.dailyHours.forEach(dh => {
            const project = dh.project || "Unassigned";
            if (!projectMap[project]) {
              projectMap[project] = { project, hours: 0, cost: 0 };
            }
            projectMap[project].hours += dh.hours || 0;
            projectMap[project].cost += (dh.hours || 0) * 50;
          });
        }
      });

      setReportData({
        employeeReports: employeeReports.sort((a, b) => b.totalHours - a.totalHours),
        projectSummary: Object.values(projectMap),
        periodSummary: {
          totalHours: approved.reduce((sum, t) => sum + (t.hoursWorked || 0), 0),
          totalCost: approved.reduce((sum, t) => sum + ((t.hoursWorked || 0) * 50), 0),
          employeeCount: Object.keys(employeeMap).length,
          timesheetCount: approved.length
        }
      });
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">{translations[language].loadingReports || "Loading reports..."}</div>;

  return (
    <div className="client-reports">
      <h3>{translations[language].detailedReports || "Detailed Reports"}</h3>

      {/* Period Summary */}
      <div className="report-summary-section">
        <h4>{translations[language].periodSummary || "Period Summary"}</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-key">{translations[language].totalHours || "Total Hours"}</div>
            <div className="summary-val">{reportData.periodSummary.totalHours?.toFixed(2)} {translations[language].hrs || "hrs"}</div>
          </div>
          <div className="summary-item">
            <div className="summary-key">{translations[language].totalCost || "Total Cost"}</div>
            <div className="summary-val">${reportData.periodSummary.totalCost?.toFixed(2)}</div>
          </div>
          <div className="summary-item">
            <div className="summary-key">{translations[language].teamMembers || "Team Members"}</div>
            <div className="summary-val">{reportData.periodSummary.employeeCount}</div>
          </div>
          <div className="summary-item">
            <div className="summary-key">{translations[language].timesheets || "Timesheets"}</div>
            <div className="summary-val">{reportData.periodSummary.timesheetCount}</div>
          </div>
        </div>
      </div>

      {/* Employee Report */}
      <div className="report-section">
        <h4>{translations[language].hoursByEmployee || "Hours by Employee"}</h4>
        <div className="report-table">
          <table>
            <thead>
              <tr>
                <th>{translations[language].employee || "Employee"}</th>
                <th>{translations[language].totalHours || "Total Hours"}</th>
                <th>{translations[language].cost || "Cost"}</th>
                <th>{translations[language].timesheets || "Timesheets"}</th>
                <th>{translations[language].projects || "Projects"}</th>
              </tr>
            </thead>
            <tbody>
              {reportData.employeeReports.map(emp => (
                <tr key={emp.employeeId}>
                  <td className="emp-name">{emp.name}</td>
                  <td className="number">{emp.totalHours.toFixed(2)}</td>
                  <td className="number">${emp.totalCost.toFixed(2)}</td>
                  <td className="number">{emp.timesheetCount}</td>
                  <td className="projects">{emp.projects || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Summary */}
      <div className="report-section">
        <h4>{translations[language].hoursByProject || "Hours by Project"}</h4>
        <div className="report-table">
          <table>
            <thead>
              <tr>
                <th>{translations[language].project || "Project"}</th>
                <th>{translations[language].hours || "Hours"}</th>
                <th>{translations[language].cost || "Cost"}</th>
              </tr>
            </thead>
            <tbody>
              {reportData.projectSummary.map(proj => (
                <tr key={proj.project}>
                  <td>{proj.project}</td>
                  <td className="number">{proj.hours.toFixed(2)}</td>
                  <td className="number">${proj.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="report-actions">
        <button className="btn-export"> {translations[language].exportPDF || "Export PDF"}</button>
        <button className="btn-export"> {translations[language].emailReport || "Email Report"}</button>
        <button className="btn-export"> {translations[language].dashboardLink || "Dashboard Link"}</button>
      </div>
    </div>
  );
};

export default ClientReportView;
