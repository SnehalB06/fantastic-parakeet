import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";
import { useState } from "react";

const AdminSettings = () => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState({
    systemName: "RCC Timesheet System",
    maxHoursPerWeek: 40,
    autoLockDays: 7,
    requireApproval: true,
    notifyOnSubmit: true,
    notifyOnApproval: true
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save settings to localStorage for now
    localStorage.setItem("timesheetSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="admin-settings">
      <h2>{translations[language].systemSettings || "System Settings"}</h2>

      {saved && <div className="success-message">✓ {translations[language].settingsSavedSuccessfully || "Settings saved successfully"}</div>}

      <div className="settings-form">
        {/* General Settings */}
        <div className="settings-section">
          <h3>{translations[language].generalSettings || "General Settings"}</h3>
          <div className="form-group">
            <label>{translations[language].systemName || "System Name"}</label>
            <input
              type="text"
              value={settings.systemName}
              onChange={(e) => handleChange("systemName", e.target.value)}
            />
          </div>
        </div>

        {/* Timesheet Settings */}
        <div className="settings-section">
          <h3>{translations[language].timesheetConfiguration || "Timesheet Configuration"}</h3>
          <div className="form-group">
            <label>{translations[language].maxHoursPerWeek || "Maximum Hours per Week"}</label>
            <input
              type="number"
              value={settings.maxHoursPerWeek}
              onChange={(e) => handleChange("maxHoursPerWeek", e.target.value)}
              min="1"
              max="168"
            />
            <small>{translations[language].defaultMaxWorkingHours || "Default maximum working hours in a week"}</small>
          </div>

          <div className="form-group">
            <label>{translations[language].autoLockTimesheetAfter || "Auto-lock Timesheet After (days)"}</label>
            <input
              type="number"
              value={settings.autoLockDays}
              onChange={(e) => handleChange("autoLockDays", e.target.value)}
              min="1"
              max="60"
            />
            <small>{translations[language].autoLockTimesheetHelp || "Automatically lock timesheets after X days from submission"}</small>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="requireApproval"
              checked={settings.requireApproval}
              onChange={(e) => handleChange("requireApproval", e.target.checked)}
            />
            <label htmlFor="requireApproval">{translations[language].requireManagerApproval || "Require Manager Approval"}</label>
            <small>{translations[language].requireManagerApprovalHelp || "Timesheets must be approved by manager before finalization"}</small>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <h3>{translations[language].notificationSettings || "Notification Settings"}</h3>
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="notifyOnSubmit"
              checked={settings.notifyOnSubmit}
              onChange={(e) => handleChange("notifyOnSubmit", e.target.checked)}
            />
            <label htmlFor="notifyOnSubmit">{translations[language].notifyManagerOnSubmit || "Notify Manager on Submit"}</label>
            <small>{translations[language].notifyManagerOnSubmitHelp || "Send email to manager when timesheet is submitted"}</small>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="notifyOnApproval"
              checked={settings.notifyOnApproval}
              onChange={(e) => handleChange("notifyOnApproval", e.target.checked)}
            />
            <label htmlFor="notifyOnApproval">{translations[language].notifyEmployeeOnApproval || "Notify Employee on Approval"}</label>
            <small>{translations[language].notifyEmployeeOnApprovalHelp || "Send email to employee when timesheet is approved/rejected"}</small>
          </div>
        </div>

        {/* System Status */}
        <div className="settings-section">
          <h3>{translations[language].systemStatus || "System Status"}</h3>
          <div className="status-info">
            <div className="status-item">
              <span>{translations[language].databaseConnection || "Database Connection:"}</span>
              <span className="status-indicator online">● {translations[language].online || "Online"}</span>
            </div>
            <div className="status-item">
              <span>{translations[language].apiServer || "API Server:"}</span>
              <span className="status-indicator online">● {translations[language].running || "Running"}</span>
            </div>
            <div className="status-item">
              <span>{translations[language].lastBackup || "Last Backup:"}</span>
              <span>{translations[language].todayAt || "Today at"} 2:30 AM</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button className="btn-primary" onClick={handleSave}>
            💾 {translations[language].saveSettings || "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
