const express = require('express');
const router = express.Router();
const {
  generateBiweeklyTimesheets,
  createTimesheet,
  getAllTimesheets,
  getTimesheetByUser,
  getOrCreateTimesheet,
  updateTimesheet,
  updateDailyHours,
  deleteTimesheet,
  approveTimesheet,
  rejectTimesheet,
  lockTimesheet,
  unlockTimesheet
} = require('../controllers/timesheetController');

// Generate biweekly timesheets for all employees
router.post('/generate', generateBiweeklyTimesheets);

// Create new timesheet entry
router.post('/create', createTimesheet);

// Get all timesheet entries
router.get('/all', getAllTimesheets);

// Get timesheet entries by employee ID
router.get('/employee/:employeeId', getTimesheetByUser);

// Get or create timesheet by employee ID and time period (auto-generates if not exists)
router.get('/:employeeId/:month/:year', getOrCreateTimesheet);

// Approve timesheet entry by employee ID and time period
router.patch('/approve/:employeeId/:month/:year', approveTimesheet);

// Reject timesheet entry by employee ID and time period
router.patch('/reject/:employeeId/:month/:year', rejectTimesheet);

// Lock timesheet entry by employee ID and time period
router.patch('/lock/:employeeId/:month/:year', lockTimesheet);

// Unlock timesheet entry by employee ID and time period
router.patch('/unlock/:employeeId/:month/:year', unlockTimesheet);

// Update timesheet entry by employee ID and time period
router.put('/update/:employeeId/:month/:year', updateTimesheet);

// Update daily hours for specific day
router.patch('/daily/:employeeId/:month/:year', updateDailyHours);

// Delete timesheet entry by employee ID and time period
router.delete('/delete/:employeeId/:month/:year', deleteTimesheet);

module.exports = router;
