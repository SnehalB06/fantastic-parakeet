
import { useLanguage } from "../../context/LanguageContext";
import translations from "../../translations";

const AllUsers = ({ users, loading }) => {
  const { language } = useLanguage();
  if (loading) return <p>{translations[language].loadingUsers || "Loading users..."}</p>;

  return (
    <div className="card all-users-card">
      <h4>{translations[language].allUsers || "All Users"}</h4>

      {users.length === 0 ? (
        <p>{translations[language].noUsersFound || "No users found"}</p>
      ) : (
        <table className="employee-table">
          <thead>
            <tr>
              <th>{translations[language].username || "Username"}</th>
              <th>{translations[language].name || "Name"}</th>
              <th>{translations[language].email || "Email"}</th>
              <th>{translations[language].role || "Role"}</th>
              <th>{translations[language].status || "Status"}</th>
              <th>{translations[language].created || "Created"}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.username}</td>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge badge-${u.role.toLowerCase()}`}>
                    {translations[language][u.role?.toLowerCase()] || u.role}
                  </span>
                </td>
                <td>
                  <span className={`status ${u.status.toLowerCase()}`}>
                    {translations[language][u.status?.toLowerCase()] || u.status}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllUsers;
