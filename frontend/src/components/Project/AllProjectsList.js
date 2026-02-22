
import AssignEmployeeToProject from "./AssignEmployeeToProject";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const AllProjectsList = ({ projects, onProjectUpdate }) => {
  const { language } = useLanguage();
  if (!projects || !projects.length) return <div className="empty-state">{translations[language].noProjectsFound || "No projects found."}</div>;

  return (
    <div className="all-projects-list">
      <h2>{translations[language].allProjects || "All Projects"}</h2>
      <div className="projects-cards-list">
        {projects.map(proj => (
          <div key={proj._id} className="project-card-row">
            <div className="project-card-main">
              <div className="project-avatar">
                <span role="img" aria-label="project">📁</span>
              </div>
              <div className="project-info">
                <div className="project-name">{proj.name}</div>
                <div className="project-meta">{translations[language][proj.status?.toLowerCase()] || proj.status} &bull; {proj.startDate ? proj.startDate.slice(0,10) : "-"} - {proj.endDate ? proj.endDate.slice(0,10) : "-"}</div>
                <div className="project-desc">{proj.description}</div>
                <div className="project-role-status">
                  <span className="project-manager">{translations[language].manager || "Manager"}: {proj.projectManager || '-'}</span>
                  <span className="project-clients">{translations[language].clients || "Clients"}: {Array.isArray(proj.clients) ? proj.clients.join(', ') : '-'}</span>
                  <span className="project-employees">{translations[language].employees || "Employees"}: {Array.isArray(proj.employees) ? proj.employees.join(', ') : '-'}</span>
                </div>
              </div>
            </div>
            <div className="project-billing">
              <div className="billing-card">
                <div className="billing-label">{translations[language].hourlyRate || "Hourly Rate"}</div>
                <div className="billing-amount">${proj.billing?.hourlyRate || 50}</div>
                <div className="billing-unit">{proj.billing?.currency || 'USD'}</div>
              </div>
              <div className="billing-card">
                <div className="billing-label">{translations[language].budget || "Budget"}</div>
                <div className="billing-amount">{proj.billing?.budget ? `$${proj.billing.budget}` : '-'}</div>
              </div>
              {proj.billing?.notes && (
                <div className="billing-card">
                  <div className="billing-label">{translations[language].notes || "Notes"}</div>
                  <div className="billing-amount">{proj.billing.notes}</div>
                </div>
              )}
            </div>
            <div className="project-worksteps">
              <div className="worksteps-label">{translations[language].workSteps || "Work Steps"}</div>
              {Array.isArray(proj.workSteps) && proj.workSteps.length > 0 ? (
                <ul className="worksteps-list">
                  {proj.workSteps.map((ws, i) => (
                    <li key={i}>{ws.stepName} ({ws.order})</li>
                  ))}
                </ul>
              ) : <span>-</span>}
            </div>
            <div style={{ marginTop: 12 }}>
              <AssignEmployeeToProject projectId={proj._id} onSuccess={onProjectUpdate} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllProjectsList;
