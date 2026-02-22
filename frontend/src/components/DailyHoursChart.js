import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const DailyHoursChart = ({ refreshTrigger, isAdmin = true, userEmployeeId }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("line");

  useEffect(() => {
    fetchDailyHours();
  }, [refreshTrigger, isAdmin, userEmployeeId]);

  const fetchDailyHours = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/timesheets/all");
      if (!res.ok) throw new Error("Failed to fetch timesheets");
      let result = await res.json();
      let timesheets = Array.isArray(result.timesheets) ? result.timesheets : [];
      // Filter timesheets if user is not admin
      if (!isAdmin && userEmployeeId) {
        timesheets = timesheets.filter(ts => ts.employeeId === userEmployeeId);
      }
      // Aggregate hours by day across filtered timesheets
      const dailyAggregation = {};
      timesheets.forEach(timesheet => {
        if (timesheet.dailyHours) {
          timesheet.dailyHours.forEach(dayData => {
            const date = dayData.date ? dayData.date.split('T')[0] : dayData.day;
            if (!dailyAggregation[date]) {
              dailyAggregation[date] = {
                date: date,
                day: dayData.day,
                totalHours: 0,
                employeeCount: 0,
              };
            }
            dailyAggregation[date].totalHours += dayData.hours || 0;
            dailyAggregation[date].employeeCount += 1;
          });
        }
      });
      // Convert to array and sort by date
      const sortedData = Object.values(dailyAggregation)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-30); // Show last 30 days

      setChartData(sortedData);
    } catch (err) {
      console.error("Error fetching daily hours:", err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="chart-container">
        <div className="chart-loading">Loading chart data...</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-empty">No data available for chart</div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>📊 {isAdmin ? "Daily Hours Trend" : "Your Daily Hours"}</h3>
        <span className="chart-subtitle">Hours logged per day (Last 30 days)</span>
        <div className="chart-controls">
          <button
            className={`chart-btn ${chartType === "line" ? "active" : ""}`}
            onClick={() => setChartType("line")}
          >
            📈 Line
          </button>
          <button
            className={`chart-btn ${chartType === "bar" ? "active" : ""}`}
            onClick={() => setChartType("bar")}
          >
            📊 Bar
          </button>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          {chartType === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                stroke="#666"
                style={{ fontSize: "12px" }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#666" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "2px solid #1F3C88",
                  borderRadius: "6px",
                  padding: "10px",
                }}
                labelStyle={{ color: "#1F3C88", fontWeight: "600" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Line
                type="monotone"
                dataKey="totalHours"
                stroke="#1F3C88"
                strokeWidth={3}
                dot={{ fill: "#1F3C88", r: 5 }}
                activeDot={{ r: 7 }}
                name="Total Hours"
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                stroke="#666"
                style={{ fontSize: "12px" }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#666" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "2px solid #1F3C88",
                  borderRadius: "6px",
                  padding: "10px",
                }}
                labelStyle={{ color: "#1F3C88", fontWeight: "600" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar
                dataKey="totalHours"
                fill="#1F3C88"
                name="Total Hours"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="chart-stats">
        <div className="chart-stat-item">
          <span className="chart-stat-label">Average Daily Hours</span>
          <span className="chart-stat-value">
            {(
              chartData.reduce((sum, d) => sum + d.totalHours, 0) /
              chartData.length
            ).toFixed(1)}
          </span>
        </div>
        <div className="chart-stat-item">
          <span className="chart-stat-label">Peak Day</span>
          <span className="chart-stat-value">
            {Math.max(...chartData.map(d => d.totalHours)).toFixed(1)} hrs
          </span>
        </div>
        <div className="chart-stat-item">
          <span className="chart-stat-label">Total Period</span>
          <span className="chart-stat-value">
            {chartData.reduce((sum, d) => sum + d.totalHours, 0).toFixed(1)} hrs
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailyHoursChart;
