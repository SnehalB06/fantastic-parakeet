import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const AssignEmployeeToProject = ({ projectId, onSuccess }) => {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { language } = useLanguage();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/admin");
        const data = await res.json();
        setEmployees(data.filter(u => u.role === "EMPLOYEE"));
      } catch {
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleAssign = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employees: selected })
      });
      if (!res.ok) throw new Error("Failed to assign employees");
      setSuccess("Employees assigned successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Error assigning employees");
    }
  };

  if (loading) return <div>{translations[language].loadingEmployees || "Loading employees..."}</div>;

  return (
    <div>
      <h4>{translations[language].assignEmployeesToProject || "Assign Employees to Project"}</h4>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
      <select multiple value={selected} onChange={e => setSelected(Array.from(e.target.selectedOptions, o => o.value))}>
        {employees.map(emp => (
          <option key={emp.employeeId} value={emp.employeeId}>
            {emp.firstName} {emp.lastName} ({emp.employeeId})
          </option>
        ))}
      </select>
      <button onClick={handleAssign} disabled={selected.length === 0}>{translations[language].assign || "Assign"}</button>
    </div>
  );
};

export default AssignEmployeeToProject;
