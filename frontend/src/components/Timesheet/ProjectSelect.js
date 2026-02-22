import { useState, useEffect } from "react";
import { timesheetAPI } from "../../services/timesheetService";

const ProjectSelect = ({ value, onChange, employeeId }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) {
      setProjects([]);
      setLoading(false);
      return;
    }
    const fetchProjects = async () => {
      try {
        const res = await fetch(`/api/projects/assigned/${employeeId}`);
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [employeeId]);

  if (loading) return <select disabled><option>Loading projects...</option></select>;
  if (!projects.length) return <select disabled><option>No projects found</option></select>;

  return (
    <select value={value} onChange={onChange} name="projectId" required>
      <option value="">Select Project</option>
      {projects.map((proj) => (
        <option key={proj._id} value={proj._id}>
          {proj.name}
        </option>
      ))}
    </select>
  );
};

export default ProjectSelect;
