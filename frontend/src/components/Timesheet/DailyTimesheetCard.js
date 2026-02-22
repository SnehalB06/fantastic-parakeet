import { useState, useEffect, useCallback } from "react";
import { timesheetAPI } from "../../services/timesheetService";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const DailyTimesheetCard = ({ employeeId, month, year, onSuccess }) => {
  const { language } = useLanguage();
  const [timesheet, setTimesheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const itemsPerPage = 5;

  /* ----------------------------------------
     Fetch / Create Timesheet
  ---------------------------------------- */
  const fetchOrCreateTimesheet = useCallback(async () => {
    if (!employeeId || !month || !year) return;

    try {
      setLoading(true);
      setError("");

      const data = await timesheetAPI.getOrCreateTimesheet(
        employeeId,
        month,
        year
      );

      setTimesheet(data);
      setCurrentPage(0);
    } catch (err) {
      setError(err.message || "Failed to load timesheet");
      setTimesheet(null);
    } finally {
      setLoading(false);
    }
  }, [employeeId, month, year]);

  /* ----------------------------------------
     Load Timesheet on Change
  ---------------------------------------- */
  useEffect(() => {
    fetchOrCreateTimesheet();
  }, [fetchOrCreateTimesheet]);

  /* ----------------------------------------
     Handle Daily Field Change
  ---------------------------------------- */
  const handleDayChange = async (dayIndex, field, value) => {
    if (!timesheet || timesheet.locked) return;

    try {
      const payload = {
        dayIndex,
        [field]: field === "hours" ? parseFloat(value) || 0 : value
      };

      const response = await timesheetAPI.updateDailyHours(
        employeeId,
        month,
        year,
        payload
      );

      setTimesheet(response);
      setSuccess("✅ Updated successfully");

      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message || "Failed to update day");
    }
  };

  /* ----------------------------------------
     Submit Timesheet
  ---------------------------------------- */
  const handleSubmit = async () => {
    if (!timesheet || timesheet.locked) return;

    setIsSaving(true);
    setError("");

    try {
      const response = await timesheetAPI.updateTimesheet(
        employeeId,
        month,
        year,
        {
          status: "PENDING",
          lastUpdated: new Date()
        }
      );

      setTimesheet(response);
      setSuccess("✅ Timesheet submitted successfully!");

      setTimeout(() => setSuccess(""), 3000);

      if (onSuccess) {
        setTimeout(onSuccess, 1000);
      }
    } catch (err) {
      setError("❌ Failed to submit timesheet: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  /* ----------------------------------------
     Guards
  ---------------------------------------- */
  if (!employeeId || !month || !year) {
    return (
      <div className="card">
        <p>{translations[language].selectEmployeeMonthYear || "Please select Employee, Month, and Year"}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <p>{translations[language].loadingTimesheet || "Loading timesheet..."}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!timesheet) {
    return (
      <div className="card">
        <p>{translations[language].noTimesheetFound || "No timesheet found"}</p>
      </div>
    );
  }

  /* ----------------------------------------
     Helpers
  ---------------------------------------- */
  const weekStartDate = new Date(timesheet.weekStartDate);

  const getStatusBadgeClass = () => {
    switch (timesheet.status) {
      case "APPROVED":
        return "badge-success";
      case "REJECTED":
        return "badge-danger";
      case "PENDING":
        return "badge-warning";
      default:
        return "badge-primary";
    }
  };

  const progressPercentage = Math.min(
    (timesheet.hoursWorked / 80) * 100,
    100
  );

  const paginatedDays = timesheet.dailyHours.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const totalPages = Math.ceil(
    timesheet.dailyHours.length / itemsPerPage
  );

  /* ----------------------------------------
     Render
  ---------------------------------------- */
  return (
    <div className="daily-timesheet-card">
      {/* Header */}
      <div className="timesheet-header">
        <h3>📋 {translations[language].twoWeekTimesheet || "2-Week Timesheet"}</h3>
        <span className={`badge ${getStatusBadgeClass()}`}>
          {translations[language][timesheet.status?.toLowerCase()] || timesheet.status}
        </span>
      </div>

      {/* Info */}
      <div className="week-info">
        <div className="info-item">
          <span className="info-label">👤 {translations[language].employee || "Employee"}</span>
          <span className="info-value">
            {timesheet.employeeId?.firstName}{" "}
            {timesheet.employeeId?.lastName}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">📅 {translations[language].period || "Period"}</span>
          <span className="info-value">
            {weekStartDate.toLocaleDateString()} –{" "}
            {new Date(
              weekStartDate.getTime() + 13 * 24 * 60 * 60 * 1000
            ).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-section">
        <div className="progress-header">
          <span>⏱️ {translations[language].hoursProgress || "Hours Progress"}</span>
          <span>{timesheet.hoursWorked} / 80 {translations[language].hrs || "hrs"}</span>
        </div>

        <div className="progress-bar-wrapper">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
      </div>

      {success && <div className="success">{success}</div>}

      {/* Table */}
      <div className="compact-table-wrapper">
        <table className="compact-timesheet-table">
          <thead>
            <tr>
              <th>{translations[language].day || "Day"}</th>
              <th>{translations[language].date || "Date"}</th>
              <th>{translations[language].hours || "Hours"}</th>
              <th>{translations[language].project || "Project"}</th>
              <th>{translations[language].notes || "Notes"}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDays.map((day, idx) => {
              const actualIndex =
                currentPage * itemsPerPage + idx;

              return (
                <tr key={actualIndex}>
                  <td><strong>{day.day}</strong></td>
                  <td>{new Date(day.date).toLocaleDateString()}</td>
                  <td>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={day.hours}
                      disabled={timesheet.locked}
                      onChange={(e) =>
                        handleDayChange(
                          actualIndex,
                          "hours",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={day.project || ""}
                      disabled={timesheet.locked}
                      onChange={(e) =>
                        handleDayChange(
                          actualIndex,
                          "project",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={day.notes || ""}
                      disabled={timesheet.locked}
                      onChange={(e) =>
                        handleDayChange(
                          actualIndex,
                          "notes",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
            disabled={currentPage === 0}
          >
            ◀ {translations[language].prev || "Prev"}
          </button>

          <span>
            {translations[language].page || "Page"} {currentPage + 1} {translations[language].of || "of"} {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage(p =>
                Math.min(p + 1, totalPages - 1)
              )
            }
            disabled={currentPage === totalPages - 1}
          >
            {translations[language].next || "Next"} ▶
          </button>
        </div>
      )}

      {timesheet.locked && (
        <div className="locked-message">
          ⚠️ {translations[language].thisTimesheetIsLocked || "This timesheet is locked"}
        </div>
      )}

      {/* Submit */}
      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isSaving || timesheet.locked}
        >
          {isSaving ? (translations[language].saving || "💾 Saving...") : (translations[language].submitTimesheet || "💾 Submit Timesheet")}
        </button>
      </div>
    </div>
  );
};

export default DailyTimesheetCard;