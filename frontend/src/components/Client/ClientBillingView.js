import { useState, useEffect } from "react";
import { timesheetAPI } from "../../services/timesheetService";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const ClientBillingView = () => {
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hourlyRate] = useState(50); // $50 per hour default
  const { language } = useLanguage();

  useEffect(() => {
    // Avoid dependency warning by defining function inside useEffect
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        // Use paginated API, fetch all approved timesheets (large limit for now)
        const result = await timesheetAPI.getTimesheetsPaginated({ status: "APPROVED", page: 1, limit: 100 });
        const approved = Array.isArray(result.timesheets) ? result.timesheets : [];

        // Group by project
        const projectBilling = {};
        approved.forEach(ts => {
          if (ts.dailyHours && ts.dailyHours.length > 0) {
            ts.dailyHours.forEach(dh => {
              const project = dh.project || "Unassigned";
              if (!projectBilling[project]) {
                projectBilling[project] = {
                  project,
                  hours: 0,
                  cost: 0,
                  timesheets: []
                };
              }
              const hours = dh.hours || 0;
              projectBilling[project].hours += hours;
              projectBilling[project].cost += hours * hourlyRate;
              projectBilling[project].timesheets.push({
                employee: ts.employeeId?.firstName + " " + ts.employeeId?.lastName,
                month: ts.month,
                year: ts.year,
                hours,
                cost: hours * hourlyRate
              });
            });
          }
        });

        setBillingData(Object.values(projectBilling));
      } catch (err) {
        console.error("Error fetching billing data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBillingData();
  }, [hourlyRate]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      // Use paginated API, fetch all approved timesheets (large limit for now)
      const result = await timesheetAPI.getTimesheetsPaginated({ status: "APPROVED", page: 1, limit: 100 });
      const approved = Array.isArray(result.timesheets) ? result.timesheets : [];

      // Group by project
      const projectBilling = {};
      approved.forEach(ts => {
        if (ts.dailyHours && ts.dailyHours.length > 0) {
          ts.dailyHours.forEach(dh => {
            const project = dh.project || "Unassigned";
            if (!projectBilling[project]) {
              projectBilling[project] = {
                project,
                hours: 0,
                cost: 0,
                timesheets: []
              };
            }
            const hours = dh.hours || 0;
            projectBilling[project].hours += hours;
            projectBilling[project].cost += hours * hourlyRate;
            projectBilling[project].timesheets.push({
              employee: ts.employeeId?.firstName + " " + ts.employeeId?.lastName,
              month: ts.month,
              year: ts.year,
              hours,
              cost: hours * hourlyRate
            });
          });
        }
      });

      setBillingData(Object.values(projectBilling));
    } catch (err) {
      console.error("Error fetching billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">{translations[language].loadingBillingData || "Loading billing data..."}</div>;

  const totalHours = billingData.reduce((sum, p) => sum + p.hours, 0);
  const totalCost = billingData.reduce((sum, p) => sum + p.cost, 0);

  return (
    <div className="client-billing">
      <h3>{translations[language].billingSummary || "Billing Summary"}</h3>

      {/* Billing Summary Cards */}
      <div className="billing-summary-cards">
        <div className="billing-card">
          <div className="billing-label">{translations[language].totalBillableHours || "Total Billable Hours"}</div>
          <div className="billing-amount">{totalHours.toFixed(2)}</div>
          <div className="billing-unit">{translations[language].hoursAtRate || `hours @ $${hourlyRate}/hr`}</div>
        </div>
        <div className="billing-card highlight">
          <div className="billing-label">{translations[language].totalBillingAmount || "Total Billing Amount"}</div>
          <div className="billing-amount">${totalCost.toFixed(2)}</div>
        </div>
      </div>

      {/* Project-wise Billing */}
      <div className="billing-projects">
        <h4>{translations[language].billingByProject || "Billing by Project"}</h4>
        {billingData.length === 0 ? (
          <div className="empty-state">
            <p>{translations[language].noApprovedTimesheetsForBilling || "No approved timesheets for billing"}</p>
          </div>
        ) : (
          <div className="projects-table">
            <table>
              <thead>
                <tr>
                  <th>{translations[language].project || "Project"}</th>
                  <th>{translations[language].hours || "Hours"}</th>
                  <th>{translations[language].rate || "Rate"}</th>
                  <th>{translations[language].totalCost || "Total Cost"}</th>
                </tr>
              </thead>
              <tbody>
                {billingData.map(project => (
                  <tr key={project.project}>
                    <td className="project-name">{project.project}</td>
                    <td className="number-cell">{project.hours.toFixed(2)}</td>
                    <td className="number-cell">${hourlyRate}/{translations[language].hr || "hr"}</td>
                    <td className="number-cell cost">${project.cost.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td><strong>{translations[language].total || "TOTAL"}</strong></td>
                  <td className="number-cell"><strong>{totalHours.toFixed(2)}</strong></td>
                  <td></td>
                  <td className="number-cell cost"><strong>${totalCost.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Download Options */}
      <div className="billing-actions">
        <button className="btn-export"> {translations[language].exportInvoice || "Export Invoice"}</button>
        <button className="btn-export"> {translations[language].emailInvoice || "Email Invoice"}</button>
        <button className="btn-export"> {translations[language].print || "Print"}</button>
      </div>
    </div>
  );
};

export default ClientBillingView;
