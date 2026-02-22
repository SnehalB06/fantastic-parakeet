import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const AddProjectForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
    workSteps: [{ stepName: "", description: "", order: 1 }],
    employees: [],
    clients: [],
    projectManager: "",
    billing: {
      hourlyRate: 50,
      budget: "",
      currency: "USD",
      notes: ""
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { language } = useLanguage();

  const handleWorkStepChange = (idx, field, value) => {
    setFormData((prev) => {
      const steps = [...prev.workSteps];
      steps[idx][field] = value;
      return { ...prev, workSteps: steps };
    });
  };

  const addWorkStep = () => {
    setFormData((prev) => ({
      ...prev,
      workSteps: [...prev.workSteps, { stepName: "", description: "", order: prev.workSteps.length + 1 }]
    }));
  };

  const removeWorkStep = (idx) => {
    setFormData((prev) => {
      const steps = prev.workSteps.filter((_, i) => i !== idx);
      // Reorder steps
      return { ...prev, workSteps: steps.map((s, i) => ({ ...s, order: i + 1 })) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        let msg = "Failed to add project";
        try {
          const data = await res.json();
          if (data && data.msg) msg = data.msg;
        } catch {}
        throw new Error(msg);
      }
      const project = await res.json();
      setSuccess("Project added successfully!");
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "ACTIVE",
        workSteps: [{ stepName: "", description: "", order: 1 }],
        employees: [],
        clients: [],
        projectManager: "",
        billing: {
          hourlyRate: 50,
          budget: "",
          currency: "USD",
          notes: ""
        }
      });
      if (onSuccess) onSuccess(project);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('billing.')) {
      const billingField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        billing: { ...prev.billing, [billingField]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ...existing code for handleWorkStepChange, addWorkStep, removeWorkStep, handleSubmit...

  return (
    <div className="add-project-form">
      <h2>{translations[language].addNewProject || "Add New Project"}</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <form onSubmit={handleSubmit}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder={translations[language].projectName || "Project Name"} required />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder={translations[language].description || "Description"} />
        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="ACTIVE">{translations[language].active || "Active"}</option>
            <option value="COMPLETED">{translations[language].completed || "Completed"}</option>
            <option value="ON_HOLD">{translations[language].onHold || "On Hold"}</option>
            <option value="CANCELLED">{translations[language].cancelled || "Cancelled"}</option>
          </select>
          <div className="work-steps-section">
            <label>{translations[language].workSteps || "Work Steps"}:</label>
            {formData.workSteps.map((step, idx) => (
              <div key={idx} className="work-step-row">
                <input
                  placeholder={translations[language].stepName || "Step Name"}
                  value={step.stepName}
                  onChange={e => handleWorkStepChange(idx, "stepName", e.target.value)}
                  required
                />
                <input
                  placeholder={translations[language].description || "Description"}
                  value={step.description}
                  onChange={e => handleWorkStepChange(idx, "description", e.target.value)}
                />
                <input
                  type="number"
                  placeholder={translations[language].order || "Order"}
                  value={step.order}
                  min={1}
                  onChange={e => handleWorkStepChange(idx, "order", parseInt(e.target.value))}
                  required
                />
                {formData.workSteps.length > 1 && (
                  <button type="button" className="btn-small btn-remove" onClick={() => removeWorkStep(idx)} title={translations[language].removeStep || "Remove Step"}>✖</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addWorkStep}>+ {translations[language].addStep || "Add Step"}</button>
          </div>
          <input
            name="projectManager"
            value={formData.projectManager}
            onChange={handleChange}
            placeholder={translations[language].projectManagerRequired || "Project Manager (required)"}
            required
          />
          {/* For simplicity, employee/client assignment can be added later */}
          <div className="billing-section">
            <h3>{translations[language].billingInformation || "Billing Information"}</h3>
            <input
              name="billing.hourlyRate"
              type="number"
              min="0"
              value={formData.billing.hourlyRate}
              onChange={handleChange}
              placeholder={translations[language].hourlyRateUSD || "Hourly Rate (USD)"}
              required
            />
            <input
              name="billing.budget"
              type="number"
              min="0"
              value={formData.billing.budget}
              onChange={handleChange}
              placeholder={translations[language].projectBudgetOptional || "Project Budget (optional)"}
            />
            <input
              name="billing.currency"
              value={formData.billing.currency}
              onChange={handleChange}
              placeholder={translations[language].currencyExample || "Currency (e.g. USD)"}
            />
            <textarea
              name="billing.notes"
              value={formData.billing.notes}
              onChange={handleChange}
              placeholder={translations[language].billingNotesOptional || "Billing Notes (optional)"}
            />
          </div>
          <button type="submit" disabled={loading}>{loading ? (translations[language].adding || "Adding...") : (translations[language].addProject || "Add Project")}</button>
        </form>
      </div>

    );
  };


export default AddProjectForm;
