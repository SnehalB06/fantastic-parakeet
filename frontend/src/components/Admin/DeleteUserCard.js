import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";
import { useState } from "react";

const DeleteUserCard = ({ onSuccess }) => {
  const { language } = useLanguage();
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setError("");

    const trimmedEmployeeId = employeeId.trim();

    if (!trimmedEmployeeId) {
      setError(translations[language].employeeIdRequired || "Employee ID is required");
      return;
    }

    const confirmDelete = window.confirm(
      `${translations[language].confirmDeleteEmployee || "Are you sure you want to delete employee"} "${trimmedEmployeeId}"?`
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/admin/${trimmedEmployeeId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Failed to delete employee");
        return;
      }

      onSuccess && onSuccess();
      setEmployeeId("");

      alert(translations[language].employeeDeletedSuccessfully || "Employee deleted successfully! ✓");
    } catch (err) {
      console.error(err);
      setError(translations[language].somethingWentWrong || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-user-card">
      <h3>🗑️ {translations[language].deleteEmployee || "Delete Employee"}</h3>

      <div className="form-group">
        <label>{translations[language].employeeId || "Employee ID"} *</label>
        <input
          placeholder={translations[language].enterEmployeeId || "Enter employee ID..."}
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />
      </div>

      {error && <p className="error">{error}</p>}

      <div className="button-group">
        <button
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? (translations[language].deleting || "⏳ Deleting...") : `🗑️ ${translations[language].deleteEmployee || "Delete Employee"}`}
        </button>
      </div>
    </div>
  );
};

export default DeleteUserCard;
