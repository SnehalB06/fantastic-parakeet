import React, { useEffect, useState } from "react";
import AllProjectsList from "../Project/AllProjectsList";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const PMProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div>
      <h2>{translations[language].projectManagement || "Project Management"}</h2>
      {loading ? <div>{translations[language].loadingProjects || "Loading projects..."}</div> : <AllProjectsList projects={projects} onProjectUpdate={fetchProjects} />}
    </div>
  );
};

export default PMProjects;
