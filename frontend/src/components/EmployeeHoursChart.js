import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const EmployeeHoursChart = ({ refreshTrigger }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedView, setExpandedView] = useState(false);

  useEffect(() => {
    fetchEmployeeHours();
  }, [refreshTrigger]);

  const fetchEmployeeHours = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/timesheets/all");
      if (!res.ok) throw new Error("Failed to fetch timesheets");
      let result = await res.json();
      let timesheets = Array.isArray(result.timesheets) ? result.timesheets : [];
      // Aggregate hours by employee
      const employeeHours = {};
      timesheets.forEach(timesheet => {
        const employeeKey = timesheet.employeeId;
        const employeeName = timesheet.employeeId?.firstName 
          ? `${timesheet.employeeId.firstName} ${timesheet.employeeId.lastName}` 
          : employeeKey;
        if (!employeeHours[employeeKey]) {
          employeeHours[employeeKey] = {
            name: employeeName,
            hours: 0,
            timesheets: 0,
          };
        }
        // Sum all daily hours from the timesheet
        const sheetHours = timesheet.dailyHours ? timesheet.dailyHours.reduce((sum, day) => sum + (day.hours || 0), 0) : 0;
        employeeHours[employeeKey].hours += sheetHours;
        employeeHours[employeeKey].timesheets += 1;
      });
      // Convert to array and sort by hours (descending)
      const sortedData = Object.values(employeeHours)
        .sort((a, b) => b.hours - a.hours)
        .slice(0, expandedView ? 50 : 15); // Show top 50 when expanded, 15 normally
      setChartData(sortedData);
    } catch (err) {
      console.error("Error fetching employee hours:", err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when expandedView changes
  useEffect(() => {
    if (chartData.length > 0) {
      fetchEmployeeHours();
    }
  }, [expandedView]);

  if (loading) {
    return (
      <div className="chart-card">
        <div className="chart-loading">Loading employee data...</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-empty">No employee data available</div>
      </div>
    );
  }

  const maxHours = Math.max(...chartData.map(d => d.hours));
  const avgHours = (chartData.reduce((sum, d) => sum + d.hours, 0) / chartData.length).toFixed(1);

  return (
    <div className="chart-card employee-breakdown-card">
      <div className="chart-header">
        <h3>👥 Employee Hours Breakdown</h3>
        <span className="chart-subtitle">{expandedView ? `All (${chartData.length})` : "Top 15"} employees by hours logged</span>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={expandedView ? 600 : 400}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 200, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis type="number" stroke="#666" style={{ fontSize: "11px" }} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#666"
              style={{ fontSize: "10px" }}
              width={195}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "2px solid #1F3C88",
                borderRadius: "6px",
                padding: "10px",
              }}
              labelStyle={{ color: "#1F3C88", fontWeight: "600" }}
              formatter={(value, name) => {
                if (name === "hours") {
                  return [value.toFixed(1) + " hrs", "Hours Logged"];
                }
                return [value, name];
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar
              dataKey="hours"
              fill="#4A6ED1"
              name="Total Hours"
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Stats Section */}
      <div className="employee-stats-grid">
        <div className="employee-stat-box">
          <div className="stat-icon-employee">👥</div>
          <div className="stat-content-employee">
            <span className="stat-label-employee">Employees Tracked</span>
            <span className="stat-value-employee">{chartData.length}</span>
          </div>
        </div>
        
        <div className="employee-stat-box">
          <div className="stat-icon-employee">⏱️</div>
          <div className="stat-content-employee">
            <span className="stat-label-employee">Highest Hours</span>
            <span className="stat-value-employee">{maxHours.toFixed(1)} hrs</span>
          </div>
        </div>
        
        <div className="employee-stat-box">
          <div className="stat-icon-employee">📊</div>
          <div className="stat-content-employee">
            <span className="stat-label-employee">Average Per Employee</span>
            <span className="stat-value-employee">{avgHours} hrs</span>
          </div>
        </div>

        <div className="employee-stat-box">
          <div className="stat-icon-employee">📈</div>
          <div className="stat-content-employee">
            <span className="stat-label-employee">Total Hours</span>
            <span className="stat-value-employee">{chartData.reduce((sum, d) => sum + d.hours, 0).toFixed(1)} hrs</span>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <div className="chart-footer">
        <button 
          className="btn-expand-chart" 
          onClick={() => setExpandedView(!expandedView)}
        >
          {expandedView ? "📊 Show Less" : "📊 Show All Employees"}
        </button>
      </div>
    </div>
  );
};

export default EmployeeHoursChart;
