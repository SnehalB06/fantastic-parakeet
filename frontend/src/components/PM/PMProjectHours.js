import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const PMProjectHours = () => {
  const [projects, setProjects] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsRes = await fetch("/api/projects");
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
        const timesheetsRes = await fetch("/api/timesheets/all");
        const result = await timesheetsRes.json();
        const timesheetsData = Array.isArray(result.timesheets) ? result.timesheets : [];
        setTimesheets(timesheetsData);
      } catch (err) {
        setProjects([]);
        setTimesheets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">{translations[language].loadingProjectHours || "Loading project hours..."}</div>;

  // Aggregate hours by project
  const projectHours = projects.map((proj) => {
    const projTimesheets = timesheets.filter(ts => ts.projectId === proj._id);
    const totalHours = projTimesheets.reduce((sum, ts) => sum + (ts.hoursWorked || 0), 0);
    return {
      ...proj,
      totalHours,
      timesheetCount: projTimesheets.length
    };
  });

  return (
    <div className="pm-project-hours">
      <h3>{translations[language].hoursLoggedByProject || "Hours Logged by Project"}</h3>
      <div className="project-hours-grid">
        {projectHours.map(proj => (
          <div key={proj._id} className="project-hours-card">
            <div className="project-title">{proj.name}</div>
            <div className="project-desc">{proj.description}</div>
            <div className="project-hours-value">{proj.totalHours} {translations[language].hours || "hours"}</div>
            <div className="project-hours-meta">{proj.timesheetCount} {translations[language].timesheets || "timesheets"}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PMProjectHours;
