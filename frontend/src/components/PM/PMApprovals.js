import { useState, useEffect } from "react";
import { timesheetAPI } from "../../services/timesheetService";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const PMApprovals = ({ onRefresh }) => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);
  const { language } = useLanguage();

  useEffect(() => {
    fetchPendingTimesheets();
  }, []);

  const fetchPendingTimesheets = async () => {
    try {
      setLoading(true);
      // Use paginated API, fetch all pending timesheets (large limit for now)
      const result = await timesheetAPI.getTimesheetsPaginated({ status: "PENDING", page: 1, limit: 100 });
      const pending = Array.isArray(result.timesheets) ? result.timesheets : [];
      setTimesheets(pending);
    } catch (err) {
      console.error("Error fetching timesheets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ts) => {
    setActionInProgress(ts._id);
    try {
      const result = await timesheetAPI.approveTimesheet(ts.employeeId, ts.month, ts.year);
      if (result) {
        await fetchPendingTimesheets();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Error approving timesheet:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (ts) => {
    setActionInProgress(ts._id);
    try {
      const result = await timesheetAPI.rejectTimesheet(ts.employeeId, ts.month, ts.year);
      if (result) {
        await fetchPendingTimesheets();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Error rejecting timesheet:", err);
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) return <div className="loading">{translations[language].loadingPendingTimesheets || "Loading pending timesheets..."}</div>;

  return (
    <div className="pm-approvals">
      {timesheets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <p>{translations[language].noPendingTimesheets || "No pending timesheets"}</p>
          <p className="empty-subtext">{translations[language].allTimesheetsApprovedOrRejected || "All timesheets have been approved or rejected"}</p>
        </div>
      ) : (
        <>
          <h3>{translations[language].pendingApprovals || "Pending Approvals"} ({timesheets.length})</h3>
          <div className="approvals-list">
            {timesheets.map(ts => (
              <div key={`${ts._id}-${ts.month}-${ts.year}`} className="approval-item">
                <div className="approval-left">
                  <div className="employee-badge">
                    <div className="badge-name">
                      {ts.employeeId?.firstName} {ts.employeeId?.lastName}
                    </div>
                    <div className="badge-id">{ts.employeeId?.employeeId}</div>
                  </div>
                  <div className="approval-details">
                    <div className="period">{ts.month}/{ts.year}</div>
                    <div className="hours">
                      <strong>{ts.hoursWorked || 0}</strong> {translations[language].hoursWorked || "hours worked"}
                    </div>
                    <div className="project">
                      {translations[language].project || "Project"}: {ts.dailyHours?.[0]?.project || translations[language].unspecified || "Unspecified"}
                    </div>
                  </div>
                </div>

                <div className="approval-right">
                  <div className="approval-notes">
                    {ts.notes && <p className="notes-label">{translations[language].notes || "Notes"}: {ts.notes}</p>}
                  </div>
                  <div className="approval-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(ts)}
                      disabled={actionInProgress === ts._id}
                    >
                      {actionInProgress === ts._id ? "..." : `✓ ${translations[language].approve || "Approve"}`}
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(ts)}
                      disabled={actionInProgress === ts._id}
                    >
                      {actionInProgress === ts._id ? "..." : `✗ ${translations[language].reject || "Reject"}`}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PMApprovals;
