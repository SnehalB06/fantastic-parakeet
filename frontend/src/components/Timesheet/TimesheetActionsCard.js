import { useState } from "react";
import { timesheetAPI } from "../../services/timesheetService";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const TimesheetActionsCard = ({ onSuccess }) => {
  const { language } = useLanguage();
  const [actionData, setActionData] = useState({
    employeeId: "",
    month: "",
    year: "",
    action: "approve"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActionData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAction = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!actionData.employeeId || !actionData.month || !actionData.year) {
      setError(translations[language].fillAllFields || "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const { employeeId, month, year, action } = actionData;

      if (action === "approve") {
        await timesheetAPI.approveTimesheet(employeeId, month, year);
        setSuccess(translations[language].timesheetApprovedSuccessfully || "Timesheet approved successfully");
      } else if (action === "reject") {
        await timesheetAPI.rejectTimesheet(employeeId, month, year);
        setSuccess(translations[language].timesheetRejectedSuccessfully || "Timesheet rejected successfully");
      } else if (action === "lock") {
        await timesheetAPI.lockTimesheet(employeeId, month, year);
        setSuccess(translations[language].timesheetLockedSuccessfully || "Timesheet locked successfully");
      } else if (action === "unlock") {
        await timesheetAPI.unlockTimesheet(employeeId, month, year);
        setSuccess(translations[language].timesheetUnlockedSuccessfully || "Timesheet unlocked successfully");
      }

      setActionData({
        employeeId: "",
        month: "",
        year: "",
        action: "approve"
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>{translations[language].timesheetActions || "Timesheet Actions"}</h3>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <form onSubmit={handleAction}>
        <input
          type="text"
          name="employeeId"
          placeholder={translations[language].employeeId || "Employee ID"}
          value={actionData.employeeId}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="month"
          placeholder={translations[language].month || "Month (1-12)"}
          value={actionData.month}
          onChange={handleChange}
          min="1"
          max="12"
          required
        />
        <input
          type="number"
          name="year"
          placeholder={translations[language].year || "Year"}
          value={actionData.year}
          onChange={handleChange}
          required
        />
        <select
          name="action"
          value={actionData.action}
          onChange={handleChange}
          required
        >
          <option value="approve">{translations[language].approve || "Approve"}</option>
          <option value="reject">{translations[language].reject || "Reject"}</option>
          <option value="lock">{translations[language].lock || "Lock"}</option>
          <option value="unlock">{translations[language].unlock || "Unlock"}</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading
            ? (translations[language].processing || "Processing...")
            : `${translations[language][actionData.action] || actionData.action.charAt(0).toUpperCase() + actionData.action.slice(1)} ${translations[language].timesheet || "Timesheet"}`}
        </button>
      </form>
    </div>
  );
};

export default TimesheetActionsCard;
