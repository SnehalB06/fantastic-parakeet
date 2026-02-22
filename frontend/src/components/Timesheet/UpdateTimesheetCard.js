import { useState } from "react";
import { timesheetAPI } from "../../services/timesheetService";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const UpdateTimesheetCard = ({ onSuccess }) => {
  const [searchData, setSearchData] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const { language } = useLanguage();
  const [timesheet, setTimesheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [found, setFound] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const itemsPerPage = 5;

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({
      ...prev,
      [name]: name === "month" || name === "year" ? parseInt(value) : value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setTimesheet(null);
    setFound(false);
    setCurrentPage(0);

    if (!searchData.employeeId || !searchData.month || !searchData.year) {
      setError("Please fill in all search fields");
      return;
    }

    try {
      setLoading(true);
      const data = await timesheetAPI.getOrCreateTimesheet(
        searchData.employeeId,
        searchData.month,
        searchData.year
      );
      setTimesheet(data);
      setFound(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = async (dayIndex, field, value) => {
    if (!timesheet) return;

    try {
      const updatedData = {
        dayIndex,
        [field]: field === "hours" ? parseFloat(value) || 0 : value
      };

      const response = await timesheetAPI.updateDailyHours(
        searchData.employeeId,
        searchData.month,
        searchData.year,
        updatedData
      );

      setTimesheet(response);
      setSuccess(translations[language].updatedSuccessfully || "✅ Updated successfully");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async () => {
    if (!timesheet) return;
    setIsSaving(true);
    try {
      setSuccess(translations[language].timesheetSavedSuccessfully || "✅ Timesheet saved successfully!");
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess("");
        setFound(false);
        setTimesheet(null);
        setSearchData({ employeeId: "", month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      }, 2000);
    } catch (err) {
      setError(translations[language].failedToSaveTimesheet || "❌ Failed to save timesheet");
    } finally {
      setIsSaving(false);
    }
  };

  if (!found) {
    return (
      <div className="update-card">
        <h3>✏️ {translations[language].updateTimesheet || "Update Timesheet"}</h3>
        {error && <div className="error">❌ {error}</div>}
        {success && <div className="success">{success}</div>}
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group">
            <label>{translations[language].employeeId || "Employee ID"} *</label>
            <input
              type="text"
              name="employeeId"
              placeholder={translations[language].enterEmployeeId || "Enter employee ID..."}
              value={searchData.employeeId}
              onChange={handleSearchChange}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{translations[language].month || "Month"} *</label>
              <select
                name="month"
                value={searchData.month}
                onChange={handleSearchChange}
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    {new Date(2024, m - 1).toLocaleString(language === 'fr' ? 'fr' : 'en', {
                      month: "long"
                    })}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{translations[language].year || "Year"} *</label>
              <input
                type="number"
                name="year"
                value={searchData.year}
                onChange={handleSearchChange}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? (translations[language].searching || "🔍 Searching...") : (translations[language].searchTimesheet || "🔍 Search Timesheet")}
          </button>
        </form>
      </div>
    );
  }

  if (!timesheet) {
    return (
      <div className="update-card">
        <div className="error">{translations[language].noTimesheetFound || "No timesheet found"}</div>
        <button
          onClick={() => setFound(false)}
          className="btn btn-secondary"
        >
          {translations[language].backToSearch || "Back to Search"}
        </button>
      </div>
    );
  }

  const weekStartDate = new Date(timesheet.weekStartDate);
  const paginatedDays = timesheet.dailyHours.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(timesheet.dailyHours.length / itemsPerPage);

  return (
    <div className="update-card">
      <div className="timesheet-header">
        <h3>✏️ {translations[language].updateTimesheet || "Update Timesheet"}</h3>
        <span className={`badge badge-primary`}>{translations[language][timesheet.status?.toLowerCase()] || timesheet.status}</span>
      </div>

      <div className="week-info">
        <div className="info-item">
          <span className="info-label">👤 {translations[language].employee || "Employee"}</span>
          <span className="info-value">{timesheet.employeeId?.firstName} {timesheet.employeeId?.lastName}</span>
        </div>
        <div className="info-item">
          <span className="info-label">📅 {translations[language].period || "Period"}</span>
          <span className="info-value">{weekStartDate.toLocaleDateString()} - {new Date(weekStartDate.getTime() + 13 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
        </div>
      </div>

      {error && <div className="error">❌ {error}</div>}
      {success && <div className="success">{success}</div>}

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
              const dayDate = new Date(day.date);
              const actualIndex = currentPage * itemsPerPage + idx;
              return (
                <tr key={actualIndex} className={actualIndex % 2 === 0 ? 'row-even' : 'row-odd'}>
                  <td className="col-day"><strong>{day.day}</strong></td>
                  <td className="col-date">{dayDate.toLocaleDateString()}</td>
                  <td className="col-hours">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={day.hours}
                      onChange={(e) => handleDayChange(actualIndex, "hours", e.target.value)}
                      disabled={timesheet.locked}
                      className="input-compact"
                    />
                  </td>
                  <td className="col-project">
                    <input
                      type="text"
                      placeholder={translations[language].project || "Project"}
                      value={day.project || ""}
                      onChange={(e) => handleDayChange(actualIndex, "project", e.target.value)}
                      disabled={timesheet.locked}
                      className="input-compact"
                    />
                  </td>
                  <td className="col-notes">
                    <input
                      type="text"
                      placeholder={translations[language].notes || "Notes"}
                      value={day.notes || ""}
                      onChange={(e) => handleDayChange(actualIndex, "notes", e.target.value)}
                      disabled={timesheet.locked}
                      className="input-compact"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="pagination-btn"
          >
            ◀ {translations[language].previous || "Previous"}
          </button>
          <span className="page-info">
            {translations[language].page || "Page"} {currentPage + 1} {translations[language].of || "of"} {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="pagination-btn"
          >
            {translations[language].next || "Next"} ▶
          </button>
        </div>
      )}

      {timesheet.locked && (
        <div className="locked-message">
          ⚠️ {translations[language].timesheetLocked || "This timesheet is locked and cannot be edited"}
        </div>
      )}

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isSaving || timesheet.locked}
        >
          {isSaving ? (translations[language].saving || "💾 Saving...") : (translations[language].saveTimesheet || "💾 Save Timesheet")}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setFound(false)}
        >
          ◀ {translations[language].backToSearch || "Back to Search"}
        </button>
      </div>
    </div>
  );
};

export default UpdateTimesheetCard;
