import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { timesheetAPI } from "../../services/timesheetService";

const TimesheetsList = ({ refreshTrigger }) => {
  const { user, isAdmin, canViewAllTimesheets } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    console.log("TimesheetsList useEffect triggered - refreshTrigger:", refreshTrigger);
    fetchTimesheets();
  }, [user, refreshTrigger]);

  const fetchTimesheets = async () => {
    try {
      setIsLoading(true);
      const res = await timesheetAPI.getTimesheetsPaginated({
        page,
        limit: 20,
        employeeId: !canViewAllTimesheets() && user?.employeeId ? user.employeeId : undefined
      });
      setTimesheets(Array.isArray(res.timesheets) ? res.timesheets : []);
      setTotalPages(res.totalPages || 1);
      setError("");
    } catch (err) {
      console.error("Error fetching timesheets:", err);
      setError(err.message || "Failed to fetch timesheets");
      setTimesheets([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="timesheets-section"><p>Loading timesheets...</p></div>;
  }

  // Pagination controls
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="timesheets-section">
      <h3>{canViewAllTimesheets() ? "All Timesheets" : "My Timesheets"}</h3>
      {error && <div className="error">Error: {error}</div>}
      {/* No external loading prop, only use internal isLoading */}
      {Array.isArray(timesheets) && timesheets.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              {isAdmin() && <th>Employee</th>}
              <th>Period</th>
              <th>Hours</th>
              <th>Project</th>
              <th>Status</th>
              <th>Locked</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {timesheets.map((timesheet) => {
              const employeeName = 
                timesheet.employeeId?.firstName && timesheet.employeeId?.lastName 
                  ? `${timesheet.employeeId.firstName} ${timesheet.employeeId.lastName}`
                  : timesheet.employeeId || "Unknown";
              
              // Get project from dailyHours or default to empty
              const project = timesheet.dailyHours && timesheet.dailyHours.length > 0 
                ? timesheet.dailyHours[0].project || "-" 
                : "-";
              
              // Get status or default to PENDING
              const status = timesheet.status || "PENDING";
              const locked = timesheet.locked || false;
              
              return (
                <tr key={`${timesheet._id}-${timesheet.month}-${timesheet.year}`}>
                  {isAdmin() && <td>{employeeName}</td>}
                  <td>{timesheet.month}/{timesheet.year}</td>
                  <td>{timesheet.hoursWorked || 0}</td>
                  <td>{project}</td>
                  <td>
                    <span className={`status ${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </td>
                  <td>{locked ? "Yes" : "No"}</td>
                  <td>{timesheet.date ? new Date(timesheet.date).toLocaleDateString() : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>{isAdmin() ? "No timesheets found" : "You have no timesheets yet"}</p>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0' }}>
        <button onClick={handlePrevPage} disabled={page === 1}>Prev</button>
        <span style={{ margin: '0 12px' }}>Page {page} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default TimesheetsList;
