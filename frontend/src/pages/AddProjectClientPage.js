
import AddProjectForm from "../components/Project/AddProjectForm";
import AssignEmployeeToProject from "../components/Project/AssignEmployeeToProject";
import { useState } from "react";


const AddProjectClientPage = () => {
  const [createdProjectId, setCreatedProjectId] = useState(null);
  const [showAssign, setShowAssign] = useState(false);

  // Show AssignEmployeeToProject after project is created
  const handleSuccess = (project) => {
    if (project && project._id) {
      setCreatedProjectId(project._id);
      setShowAssign(true);
    }
  };

  return (
    <div className="add-project-page">
      <AddProjectForm onSuccess={handleSuccess} />
      {showAssign && createdProjectId && (
        <div style={{ marginTop: 32 }}>
          <AssignEmployeeToProject projectId={createdProjectId} onSuccess={() => setShowAssign(false)} />
        </div>
      )}
    </div>
  );
};

export default AddProjectClientPage;
