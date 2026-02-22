import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import LanguageToggle from "../LanguageToggle";
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";
import RegisterUserCard from "../components/Admin/RegisterUserCard";
import SearchUserCard from "../components/Admin/SearchUserCard";
import DeleteUserCard from "../components/Admin/DeleteUserCard";
import UpdateUserCard from "../components/Admin/UpdateUserCard";
import UsersTable from "./UsersTable";

const Admin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabFromUrl || null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab) {
      fetchUsers();
    }
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const renderActiveCard = () => {
    switch (activeTab) {
      case "register":
        return <RegisterUserCard onSuccess={fetchUsers} />;
      case "search":
        return <SearchUserCard />;
      case "update":
        return <UpdateUserCard onSuccess={fetchUsers} />;
      case "delete":
        return <DeleteUserCard onSuccess={fetchUsers} />;
      default:
        return null;
    }
  };

  const { language } = useLanguage();
  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="admin-title">👥 {translations[language].adminDashboard}</h2>
        <LanguageToggle />
      </div>
      <div className="admin-layout">
        {/* SIDEBAR NAVIGATION */}
        <div className="admin-navbar">
          <button
            className={`admin-nav-btn ${activeTab === "register" ? "active" : ""}`}
            onClick={() => handleTabChange("register")}
          >
            ➕ {translations[language].registerEmployee}
          </button>
          <button
            className={`admin-nav-btn ${activeTab === "search" ? "active" : ""}`}
            onClick={() => handleTabChange("search")}
          >
            🔍 {translations[language].searchEmployee}
          </button>
          <button
            className={`admin-nav-btn ${activeTab === "update" ? "active" : ""}`}
            onClick={() => handleTabChange("update")}
          >
            📝 {translations[language].updateEmployee}
          </button>
          <button
            className={`admin-nav-btn ${activeTab === "delete" ? "active" : ""}`}
            onClick={() => handleTabChange("delete")}
          >
            ❌ {translations[language].deleteEmployee}
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="admin-content">
          {!activeTab ? (
            <div style={{
              background: '#fff',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: 'var(--shadow)',
              textAlign: 'center',
              color: 'var(--text-light)'
            }}>
              <p style={{fontSize: '16px', margin: 0}}>Select an action from the left menu to get started</p>
            </div>
          ) : (
            <div className="fade-slide">
              {renderActiveCard()}
            </div>
          )}
        </div>
      </div>

      {/* USERS TABLE SECTION */}
      <div className="users-section">
        {activeTab && (
          <UsersTable users={users} loading={loading} />
        )}
      </div>
    </div>
  );
};

export default Admin;
