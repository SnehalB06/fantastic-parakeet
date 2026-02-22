import { useState, useEffect, useCallback } from "react";
import { timesheetAPI } from "../../services/timesheetService";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const PMTeamTimesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [filteredTimesheets, setFilteredTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [approving, setApproving] = useState(false);
  const { language } = useLanguage();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fetchTimesheets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await timesheetAPI.getTimesheetsPaginated({
        page,
        limit: 20,
        status: filterStatus !== "ALL" ? filterStatus : undefined
      });
      setTimesheets(Array.isArray(res.timesheets) ? res.timesheets : []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Error fetching timesheets:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  const filterTimesheets = useCallback(() => {
    let filtered = timesheets;
    if (filterStatus !== "ALL") {
      filtered = timesheets.filter(t => t.status === filterStatus);
    }
    setFilteredTimesheets(filtered);
  }, [timesheets, filterStatus]);

  useEffect(() => {
    fetchTimesheets();
  }, [fetchTimesheets]);

  useEffect(() => {
    filterTimesheets();
  }, [filterTimesheets]);

  // Always use the string employeeId for backend actions
  const getEmployeeIdString = (ts) =>
    typeof ts.employeeId === 'object' && ts.employeeId !== null
      ? ts.employeeId.employeeId
      : ts.employeeId;

  const approveAllTimesheets = async () => {
    if (filteredTimesheets.length === 0) return;
    const confirmApprove = window.confirm(
      `Are you sure you want to approve ${filteredTimesheets.length} timesheet(s)?`
    );
    if (!confirmApprove) return;
    setApproving(true);
    try {
      let approvedCount = 0;
      for (const ts of filteredTimesheets) {
        try {
          await timesheetAPI.approveTimesheet(getEmployeeIdString(ts), ts.month, ts.year);
          approvedCount++;
        } catch (err) {
          console.error(`Failed to approve timesheet for ${ts.employeeId?.firstName}:`, err);
        }
      }
      alert(`Successfully approved ${approvedCount} timesheet(s)`);
      fetchTimesheets();
    } catch (err) {
      console.error("Error approving timesheets:", err);
      alert("Error approving timesheets");
    } finally {
      setApproving(false);
    }
  };

  if (loading) return <div className="loading">{translations[language].loadingTeamTimesheets || "Loading team timesheets..."}</div>;

  // Pagination controls
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="pm-team-timesheets">
      <div className="pm-filter-bar">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="pm-filter-select"
        >
          <option value="ALL">{translations[language].allStatuses || "All Statuses"}</option>
          <option value="PENDING">{translations[language].pending || "Pending"}</option>
          <option value="APPROVED">{translations[language].approved || "Approved"}</option>
          <option value="REJECTED">{translations[language].rejected || "Rejected"}</option>
        </select>
        <span className="result-count">{filteredTimesheets.length} {translations[language].timesheets || "timesheets"}</span>
        {filterStatus === "PENDING" && filteredTimesheets.length > 0 && (
          <button
            className="btn btn-approve-all"
            onClick={approveAllTimesheets}
            disabled={approving}
          >
            {approving ? (translations[language].approving || "Approving...") : `${translations[language].approveAll || "Approve All"} (${filteredTimesheets.length})`}
          </button>
        )}
      </div>

      {filteredTimesheets.length > 0 ? (
        <table className="timesheets-table">
          <thead>
            <tr>
              <th>{translations[language].employee || "Employee"}</th>
              <th>{translations[language].employeeId || "Employee ID"}</th>
              <th>{translations[language].period || "Period"}</th>
              <th>{translations[language].hours || "Hours"}</th>
              <th>{translations[language].project || "Project"}</th>
              <th>{translations[language].submitted || "Submitted"}</th>
              <th>{translations[language].status || "Status"}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTimesheets.map(ts => (
              <tr key={`${ts._id}-${ts.month}-${ts.year}`}>
                <td>
                  <span className="employee-name">
                    {ts.employeeId?.firstName} {ts.employeeId?.lastName}
                  </span>
                </td>
                <td>{ts.employeeId?.employeeId || ts.employeeId}</td>
                <td>{ts.month}/{ts.year}</td>
                <td><strong>{ts.hoursWorked || 0}</strong> {translations[language].hrs || "hrs"}</td>
                <td>{ts.dailyHours?.[0]?.project || "—"}</td>
                <td>{ts.date ? new Date(ts.date).toLocaleDateString() : "—"}</td>
                <td>
                  <span className={`status-badge status-${ts.status?.toLowerCase() || 'pending'}`}>
                    {translations[language][ts.status?.toLowerCase()] || ts.status || translations[language].pending || "PENDING"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <p>{translations[language].noTimesheetsFound || "No timesheets found"}</p>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0' }}>
        <button onClick={handlePrevPage} disabled={page === 1}>{translations[language].prev || "Prev"}</button>
        <span style={{ margin: '0 12px' }}>{translations[language].page || "Page"} {page} {translations[language].of || "of"} {totalPages}</span>
        <button onClick={handleNextPage} disabled={page === totalPages}>{translations[language].next || "Next"}</button>
      </div>
    </div>
  );
};

export default PMTeamTimesheets;
