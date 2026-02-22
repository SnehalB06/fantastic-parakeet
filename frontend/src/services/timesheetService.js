// API service for timesheet endpoints
const API_URL = '/api/timesheets';

export const timesheetAPI = {
  // Get paginated and/or filtered timesheets
  getTimesheetsPaginated: async ({ page = 1, limit = 20, employeeId, status, month, year } = {}) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (employeeId) params.append('employeeId', employeeId);
    if (status) params.append('status', status);
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const response = await fetch(`${API_URL}/all?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch timesheets');
    return response.json();
  },
  // Generate 2-week timesheets for all employees
  generateBiweeklyTimesheets: async () => {
    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (!response.ok) throw new Error('Failed to generate timesheets');
    return response.json();
  },

  // Create new timesheet
  createTimesheet: async (data) => {
    const response = await fetch(`${API_URL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create timesheet');
    return response.json();
  },

  // Get all timesheets
  getAllTimesheets: async () => {
    try {
      const response = await fetch(`${API_URL}/all`);
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("getAllTimesheets error:", error);
      throw error;
    }
  },

  // Get timesheets by employee ID
  getTimesheetByEmployee: async (employeeId) => {
    const response = await fetch(`${API_URL}/employee/${employeeId}`);
    if (!response.ok) throw new Error('Failed to fetch employee timesheets');
    return response.json();
  },

  // Get single timesheet by employee, month, year
  getTimesheet: async (employeeId, month, year) => {
    const response = await fetch(`${API_URL}/${employeeId}/${month}/${year}`);
    if (!response.ok) throw new Error('Failed to fetch timesheet');
    return response.json();
  },

  // Get or create timesheet (auto-generates if not exists)
  getOrCreateTimesheet: async (employeeId, month, year) => {
    const response = await fetch(`${API_URL}/${employeeId}/${month}/${year}`);
    if (!response.ok) throw new Error('Failed to fetch/create timesheet');
    return response.json();
  },

  // Update timesheet
  updateTimesheet: async (employeeId, month, year, data) => {
    const response = await fetch(`${API_URL}/update/${employeeId}/${month}/${year}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update timesheet');
    return response.json();
  },

  // Delete timesheet
  deleteTimesheet: async (employeeId, month, year) => {
    const response = await fetch(`${API_URL}/delete/${employeeId}/${month}/${year}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete timesheet');
    return response.json();
  },

  // Approve timesheet
  approveTimesheet: async (employeeId, month, year) => {
    const response = await fetch(`${API_URL}/approve/${employeeId}/${month}/${year}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (!response.ok) throw new Error('Failed to approve timesheet');
    return response.json();
  },

  // Reject timesheet
  rejectTimesheet: async (employeeId, month, year) => {
    const response = await fetch(`${API_URL}/reject/${employeeId}/${month}/${year}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (!response.ok) throw new Error('Failed to reject timesheet');
    return response.json();
  },

  // Lock timesheet
  lockTimesheet: async (employeeId, month, year) => {
    const response = await fetch(`${API_URL}/lock/${employeeId}/${month}/${year}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (!response.ok) throw new Error('Failed to lock timesheet');
    return response.json();
  },

  // Unlock timesheet
  unlockTimesheet: async (employeeId, month, year) => {
    const response = await fetch(`${API_URL}/unlock/${employeeId}/${month}/${year}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (!response.ok) throw new Error('Failed to unlock timesheet');
    return response.json();
  },

  // Update daily hours
  updateDailyHours: async (employeeId, month, year, data) => {
    const response = await fetch(`${API_URL}/daily/${employeeId}/${month}/${year}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update daily hours');
    return response.json();
  }
};
