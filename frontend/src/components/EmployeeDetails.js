export const EmployeeTable = ({ employees }) => {
  return (
    <div class="page-wrapper">
    <table className="employee-table">
      <thead>
        <tr>
          <th>First Name</th>
          <th>Middle Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Role</th>
          <th>Status</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        {employees.map(emp => (
          <tr key={emp._id}>
            <td>{emp.firstName}</td>
            <td>{emp.middleName}</td>
            <td>{emp.lastName}</td>
            <td>{emp.email}</td>
            <td>{emp.phone}</td>
            <td>{emp.role}</td>
            <td>{emp.status}</td>
            <td>{new Date(emp.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
};


