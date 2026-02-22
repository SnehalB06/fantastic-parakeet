import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "../context/LanguageContext";
import translations from "../translations";

const NavBar = () => {
  const { user, logout, canViewAllTimesheets } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return null; // Don't show navbar on login page
  }

  const getRoleIcon = (role) => {
    switch(role) {
      case "ADMIN": return "⚙️";
      case "PM": return "👨‍💼";
      case "CLIENT": return "👔";
      case "EMPLOYEE": return "👤";
      default: return "👤";
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case "ADMIN": return translations[language].adminRole || "ADMIN";
      case "PM": return translations[language].pmRole || "PROJECT MANAGER";
      case "CLIENT": return translations[language].clientRole || "CLIENT";
      case "EMPLOYEE": return translations[language].employeeRole || "EMPLOYEE";
      default: return role;
    }
  };

  return(
    <div className="navbar">
      <Link to="/" style={{ textDecoration: 'none', color: '#fff' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>RCC Timesheet</h1>
      </Link>
      <nav>
        <Link to="/">🏠 {translations[language].home}</Link>
        {user.role === "ADMIN" && <Link to="/admin">⚙️ {translations[language].adminPanel}</Link>}
        {user.role === "PM" && <Link to="/pm-dashboard">👨‍💼 {translations[language].pmDashboard}</Link>}
        {user.role === "CLIENT" && <Link to="/client-dashboard">👔 {translations[language].clientDashboard}</Link>}
        {user.role === "EMPLOYEE" && <Link to="/timesheet">📋 {translations[language].timesheet}</Link>}
      </nav>
      <div className="navbar-user">
        <span className="user-badge">{user.firstName} {user.lastName}</span>
        <span className={`role-badge role-${user.role.toLowerCase()}`}>
          {getRoleIcon(user.role)} {getRoleLabel(user.role)}
        </span>
        <LanguageToggle />
        <button onClick={handleLogout} className="btn-logout">{translations[language].logout}</button>
      </div>
    </div>
  )
}

export default NavBar;