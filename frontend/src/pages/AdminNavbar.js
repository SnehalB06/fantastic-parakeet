const AdminNavbar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: "register", label: "Register User" },
    { key: "search", label: "Search User" },
    { key: "update", label: "Update User" },
    { key: "delete", label: "Delete User" },
  ];

  return (
    <div className="admin-sidebar">
      <h3 className="sidebar-title">Admin</h3>

      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`nav-btn ${activeTab === tab.key ? "active" : ""}`}
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AdminNavbar;
