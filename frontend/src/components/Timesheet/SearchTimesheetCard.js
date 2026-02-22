import { useState } from "react";
import { timesheetAPI } from "../../services/timesheetService";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const SearchTimesheetCard = () => {
  const { language } = useLanguage();
  const [searchData, setSearchData] = useState({
    employeeId: "",
    month: "",
    year: ""
  });
  const [timesheet, setTimesheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setTimesheet(null);

    if (!searchData.employeeId || !searchData.month || !searchData.year) {
      setError(translations[language].fillAllSearchFields || "Please fill in all search fields");
      return;
    }

    try {
      setLoading(true);
      const data = await timesheetAPI.getTimesheet(
        searchData.employeeId,
        searchData.month,
        searchData.year
      );
      setTimesheet(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>{translations[language].searchTimesheet || "Search Timesheet"}</h3>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          name="employeeId"
          placeholder={translations[language].employeeId || "Employee ID"}
          value={searchData.employeeId}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="month"
          placeholder={translations[language].month || "Month (1-12)"}
          value={searchData.month}
          onChange={handleChange}
          min="1"
          max="12"
          required
        />
        <input
          type="number"
          name="year"
          placeholder={translations[language].year || "Year"}
          value={searchData.year}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? (translations[language].searching || "Searching...") : (translations[language].search || "Search")}
        </button>
      </form>

      {timesheet && (
        <div className="timesheet-details">
          <h4>{translations[language].timesheetFound || "Timesheet Found"}</h4>
          <p><strong>{translations[language].employee || "Employee"}:</strong> {timesheet.employeeId?.firstName} {timesheet.employeeId?.lastName}</p>
          <p><strong>{translations[language].period || "Period"}:</strong> {timesheet.month}/{timesheet.year}</p>
          <p><strong>{translations[language].hoursWorked || "Hours Worked"}:</strong> {timesheet.hoursWorked}</p>
          <p><strong>{translations[language].project || "Project"}:</strong> {timesheet.projectName}</p>
          <p><strong>{translations[language].status || "Status"}:</strong> {translations[language][timesheet.status?.toLowerCase()] || timesheet.status}</p>
          <p><strong>{translations[language].taskDescription || "Task"}:</strong> {timesheet.taskDescription}</p>
          <p><strong>{translations[language].locked || "Locked"}:</strong> {timesheet.locked ? (translations[language].yes || "Yes") : (translations[language].no || "No")}</p>
        </div>
      )}
    </div>
  );
};

export default SearchTimesheetCard;
