import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { timesheetAPI } from "../../services/timesheetService";
import ProjectSelect from "./ProjectSelect";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const CreateTimesheetCard = ({ onSuccess }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    employeeId: user?.employeeId || "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    date: new Date().toISOString().split("T")[0],
    hoursWorked: "",
    projectId: "",
    taskDescription: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auto-update employeeId if user changes (e.g., after login)
  // and prevent manual editing of employeeId field
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "employeeId") return; // Prevent manual change
    setFormData((prev) => ({
      ...prev,
      [name]: name === "hoursWorked" ? parseFloat(value) : value
    }));
  };

  const handleSaveOrSubmit = async (e, submitType) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.employeeId ||
      !formData.hoursWorked ||
      !formData.projectId ||
      !formData.date
    ) {
      setError(translations[language].fillAllRequiredFields || "Please fill in all required fields");
      return;
    }

    let payload = { ...formData };
    if (submitType === "submit") {
      payload.status = "SUBMITTED";
    } else {
      payload.status = "PENDING";
    }

    try {
      setLoading(true);
      await timesheetAPI.createTimesheet(payload);
      setSuccess(submitType === "submit"
        ? (translations[language].timesheetSubmittedSuccessfully || "Timesheet submitted successfully")
        : (translations[language].timesheetSavedSuccessfully || "Timesheet saved successfully")
      );
      setFormData({
        employeeId: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        date: new Date().toISOString().split("T")[0],
        hoursWorked: "",
        projectId: "",
        taskDescription: "",
        notes: ""
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
      <h3>{translations[language].createTimesheet || "Create Timesheet"}</h3>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <form>
        <input
          type="text"
          name="employeeId"
          placeholder={translations[language].employeeId || "Employee ID"}
          value={formData.employeeId}
          disabled
          required
        />
        <input
          type="number"
          name="month"
          placeholder={translations[language].month || "Month (1-12)"}
          value={formData.month}
          onChange={handleChange}
          min="1"
          max="12"
          required
        />
        <input
          type="number"
          name="year"
          placeholder={translations[language].year || "Year"}
          value={formData.year}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="hoursWorked"
          placeholder={translations[language].hoursWorked || "Hours Worked"}
          value={formData.hoursWorked}
          onChange={handleChange}
          min="0"
          max="60"
          step="0.5"
          required
        />
        <ProjectSelect
          value={formData.projectId}
          onChange={handleChange}
          employeeId={formData.employeeId}
        />
        <textarea
          name="taskDescription"
          placeholder={translations[language].taskDescription || "Task Description"}
          value={formData.taskDescription}
          onChange={handleChange}
        />
        <textarea
          name="notes"
          placeholder={translations[language].notes || "Notes"}
          value={formData.notes}
          onChange={handleChange}
        />
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={loading}
            onClick={e => handleSaveOrSubmit(e, "save")}
          >
            {loading ? (translations[language].saving || "Saving...") : (translations[language].saveTimesheet || "Save Timesheet")}
          </button>
          {(user && ["PM", "ADMIN", "CLIENT"].includes(user.role)) && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={loading}
              onClick={e => handleSaveOrSubmit(e, "submit")}
            >
              {loading ? (translations[language].submitting || "Submitting...") : (translations[language].submitTimesheet || "Submit Timesheet")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateTimesheetCard;
