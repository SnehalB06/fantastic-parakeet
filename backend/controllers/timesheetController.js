const Timesheet = require('../models/timesheet');
const User = require('../models/users');

// Helper function to enrich timesheet with employee details
const enrichTimesheetWithEmployee = async (timesheet) => {
  const employee = await User.findOne({ employeeId: timesheet.employeeId });
  return {
    ...timesheet.toObject(),
    employeeId: {
      employeeId: timesheet.employeeId,
      firstName: employee?.firstName || '',
      lastName: employee?.lastName || '',
      email: employee?.email || ''
    }
  };
};

// Generate 2-week timesheets for all employees
const generateBiweeklyTimesheets = async (req, res) => {
  try {
    console.log('Generate Timesheets endpoint called');
    
    // Get current date and find the Sunday of the current week
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStartDate = new Date(today);
    weekStartDate.setDate(today.getDate() - dayOfWeek);
    weekStartDate.setHours(0, 0, 0, 0);

    const currentMonth = weekStartDate.getMonth() + 1;
    const currentYear = weekStartDate.getFullYear();
    
    // Calculate which 2-week period (1-26 periods in a year)
    const dayOfYear = Math.floor((weekStartDate - new Date(weekStartDate.getFullYear(), 0, 0)) / 86400000);
    const biweekPeriod = Math.ceil(dayOfYear / 14);

    console.log(`Week starting from: ${weekStartDate.toDateString()}`);
    console.log(`Current period - Month: ${currentMonth}, Year: ${currentYear}, BiweekPeriod: ${biweekPeriod}`);

    // Get all active employees
    const employees = await User.find({ status: 'ACTIVE' });

    console.log(`Found ${employees?.length || 0} active employees`);

    if (!employees || employees.length === 0) {
      return res.status(200).json({ msg: 'No active employees found', timesheets: [] });
    }

    const generatedTimesheets = [];

    // Generate daily hours array for 2 weeks (14 days)
    const generateDailyHours = (startDate) => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dailyHours = [];
      
      for (let i = 0; i < 14; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        dailyHours.push({
          day: dayNames[currentDate.getDay()],
          date: new Date(currentDate),
          hours: 0,
          project: '',
          notes: ''
        });
      }
      return dailyHours;
    };

    // Generate timesheet for each employee if not already exists
    for (const employee of employees) {
      try {
        const existingTimesheet = await Timesheet.findOne({
          employeeId: employee.employeeId,
          month: currentMonth,
          year: currentYear,
          biweekPeriod: biweekPeriod
        });

        if (!existingTimesheet) {
          const newTimesheet = await Timesheet.create({
            employeeId: employee.employeeId,
            month: currentMonth,
            year: currentYear,
            biweekPeriod: biweekPeriod,
            date: new Date(),
            weekStartDate: new Date(weekStartDate),
            dailyHours: generateDailyHours(weekStartDate),
            hoursWorked: 0,
            projectName: '',
            taskDescription: '',
            status: 'PENDING',
            notes: '',
            locked: false
          });
          generatedTimesheets.push(newTimesheet);
        }
      } catch (empError) {
        console.error(`Error creating timesheet for employee ${employee.employeeId}:`, empError);
      }
    }

    console.log(`Generated ${generatedTimesheets.length} new timesheets`);

    res.status(200).json({
      msg: `Generated ${generatedTimesheets.length} timesheets for biweek period ${biweekPeriod}`,
      timesheets: generatedTimesheets,
      period: { month: currentMonth, year: currentYear, biweekPeriod: biweekPeriod, weekStartDate }
    });
  } catch (error) {
    console.error('Error in generateBiweeklyTimesheets:', error);
    res.status(500).json({ msg: `Error: ${error.message}` });
  }
};

// Create new timesheet entry
const createTimesheet = async (req, res) => {
  try {
    const newTimesheet = await Timesheet.create(req.body);
    res.status(200).json(newTimesheet);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

// Get all timesheet entries with pagination and filtering
const getAllTimesheets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Optional filters
    const filter = {};
    if (req.query.employeeId) filter.employeeId = req.query.employeeId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.month) filter.month = parseInt(req.query.month);
    if (req.query.year) filter.year = parseInt(req.query.year);

    const total = await Timesheet.countDocuments(filter);
    const timesheets = await Timesheet.find(filter)
      .sort({ year: -1, month: -1, date: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch employee details for each timesheet
    const enrichedTimesheets = await Promise.all(
      timesheets.map(async (ts) => {
        const employee = await User.findOne({ employeeId: ts.employeeId });
        return {
          ...ts.toObject(),
          employeeId: {
            employeeId: ts.employeeId,
            firstName: employee?.firstName || '',
            lastName: employee?.lastName || '',
            email: employee?.email || ''
          }
        };
      })
    );

    res.status(200).json({
      timesheets: enrichedTimesheets,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Get timesheet entries by user ID
// Get timesheet entries by user ID
const getTimesheetByUser = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const timesheets = await Timesheet.find({ employeeId })
      .sort({ year: -1, month: -1, date: -1 });
    
    if (!timesheets || timesheets.length === 0) {
      return res.status(404).json({ msg: 'No timesheets found for this employee' });
    }
    
    // Fetch employee details
    const employee = await User.findOne({ employeeId });
    const enrichedTimesheets = timesheets.map(ts => ({
      ...ts.toObject(),
      employeeId: {
        employeeId: ts.employeeId,
        firstName: employee?.firstName || '',
        lastName: employee?.lastName || '',
        email: employee?.email || ''
      }
    }));
    
    res.status(200).json(enrichedTimesheets);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Get timesheet and auto-generate if not exists
const getOrCreateTimesheet = async (req, res) => {
  try {
    const { employeeId, month, year } = req.params;
    
    console.log(`📋 getOrCreateTimesheet called for employeeId: ${employeeId}, month: ${month}, year: ${year}`);

    // Find existing timesheet
    let timesheet = await Timesheet.findOne({ employeeId, month, year })
      .populate('employeeId', 'employeeId firstName lastName email');

    // If exists, return it
    if (timesheet) {
      console.log(`✅ Timesheet found for employee ${employeeId}`);
      return res.status(200).json(timesheet);
    }

    console.log(`⚠️ Timesheet not found, creating new one for employee ${employeeId}`);

    // If not exists, create it
    const employee = await User.findOne({ employeeId });
    if (!employee) {
      console.log(`❌ Employee not found with ID: ${employeeId}`);
      return res.status(404).json({ msg: 'Employee not found' });
    }

    console.log(`✅ Employee found: ${employee.firstName} ${employee.lastName}`);

    // Calculate week starting from Sunday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStartDate = new Date(today);
    weekStartDate.setDate(today.getDate() - dayOfWeek);
    weekStartDate.setHours(0, 0, 0, 0);

    const dayOfYear = Math.floor((weekStartDate - new Date(weekStartDate.getFullYear(), 0, 0)) / 86400000);
    const biweekPeriod = Math.ceil(dayOfYear / 14);

    // Generate daily hours for 2 weeks
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyHours = [];
    
    for (let i = 0; i < 14; i++) {
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(weekStartDate.getDate() + i);
      
      dailyHours.push({
        day: dayNames[currentDate.getDay()],
        date: new Date(currentDate),
        hours: 0,
        project: '',
        notes: ''
      });
    }

    // Create new timesheet
    timesheet = await Timesheet.create({
      employeeId: employeeId,
      month: parseInt(month),
      year: parseInt(year),
      biweekPeriod: biweekPeriod,
      date: new Date(),
      weekStartDate: new Date(weekStartDate),
      dailyHours: dailyHours,
      hoursWorked: 0,
      projectName: '',
      taskDescription: '',
      status: 'PENDING',
      notes: '',
      locked: false
    });

    console.log(`✅ Timesheet created successfully for employee ${employeeId}`);

    // Fetch employee details to return enriched response
    const responseData = {
      ...timesheet.toObject(),
      employeeId: {
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email
      }
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ Error in getOrCreateTimesheet:', error);
    res.status(500).json({ msg: `Error: ${error.message}` });
  }
};

// Update timesheet entry
const updateTimesheet = async (req, res) => {
  try {
    const { employeeId, month, year } = req.params;
    const timesheet = await Timesheet.findOneAndUpdate(
      { employeeId, month, year },
      { ...req.body },
      { new: true }
    );
    if (!timesheet) {
      return res.status(404).json({ msg: 'Timesheet not found' });
    }
    const enrichedTimesheet = await enrichTimesheetWithEmployee(timesheet);
    res.status(200).json(enrichedTimesheet);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

// Delete timesheet entry
const deleteTimesheet = async (req, res) => {
  try {
    const { employeeId, month, year } = req.params;
    const timesheet = await Timesheet.findOneAndDelete({ employeeId, month, year });
    if (!timesheet) {
      return res.status(404).json({ msg: 'Timesheet not found' });
    }
    res.status(200).json(timesheet);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

// Approve timesheet entry
const approveTimesheet = async (req, res) => {
  try {
    const { employeeId, month, year } = req.params;
    const timesheet = await Timesheet.findOneAndUpdate(
      { employeeId, month, year },
      { status: 'APPROVED' },
      { new: true }
    );
    if (!timesheet) {
      return res.status(404).json({ msg: 'Timesheet not found' });
    }
    const enrichedTimesheet = await enrichTimesheetWithEmployee(timesheet);
    res.status(200).json(enrichedTimesheet);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

// Reject timesheet entry
const rejectTimesheet = async (req, res) => {
  try {
    const { employeeId, month, year } = req.params;
    const timesheet = await Timesheet.findOneAndUpdate(
      { employeeId, month, year },
      { status: 'REJECTED' },
      { new: true }
    );
    if (!timesheet) {
      return res.status(404).json({ msg: 'Timesheet not found' });
    }
    const enrichedTimesheet = await enrichTimesheetWithEmployee(timesheet);
    res.status(200).json(enrichedTimesheet);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

// Lock timesheet entry
const lockTimesheet = async (req, res) => {
  try {
    const { employeeId, month, year } = req.params;
    const timesheet = await Timesheet.findOneAndUpdate(
      { employeeId, month, year },
      { locked: true },
      { new: true }
    );
    if (!timesheet) {
      return res.status(404).json({ msg: 'Timesheet not found' });
    }
    const enrichedTimesheet = await enrichTimesheetWithEmployee(timesheet);
    res.status(200).json(enrichedTimesheet);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

// Unlock timesheet entry
const unlockTimesheet = async (req, res) => {
  try {
    const { employeeId, month, year } = req.params;
    const timesheet = await Timesheet.findOneAndUpdate(
      { employeeId, month, year },
      { locked: false },
      { new: true }
    );
    if (!timesheet) {
      return res.status(404).json({ msg: 'Timesheet not found' });
    }
    const enrichedTimesheet = await enrichTimesheetWithEmployee(timesheet);
    res.status(200).json(enrichedTimesheet);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

// Update daily hours for a specific day
const updateDailyHours = async (req, res) => {
  try {
    const { employeeId, month, year } = req.params;
    const { dayIndex, hours, project, notes } = req.body;

    if (dayIndex < 0 || dayIndex > 13) {
      return res.status(400).json({ msg: 'Invalid day index (0-13)' });
    }

    const timesheet = await Timesheet.findOne({ employeeId, month, year });
    if (!timesheet) {
      return res.status(404).json({ msg: 'Timesheet not found' });
    }

    // Update the specific day
    timesheet.dailyHours[dayIndex].hours = Math.min(24, Math.max(0, hours));
    if (project) timesheet.dailyHours[dayIndex].project = project;
    if (notes) timesheet.dailyHours[dayIndex].notes = notes;

    // Recalculate total hours
    timesheet.hoursWorked = timesheet.dailyHours.reduce((sum, day) => sum + day.hours, 0);

    const updatedTimesheet = await timesheet.save();
    const enrichedTimesheet = await enrichTimesheetWithEmployee(updatedTimesheet);

    res.status(200).json(enrichedTimesheet);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

module.exports = {
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
};
