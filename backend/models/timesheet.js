const mongoose = require('mongoose');

const TimesheetSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },

    year: {
      type: Number,
      required: true
    },

    biweekPeriod: {
      type: Number,
      min: 1,
      max: 26,
      required: false
    },

    date: {
      type: Date,
      required: true
    },

    weekStartDate: {
      type: Date,
      required: true
    },


    dailyHours: [
      {
        day: { type: String, enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
        date: Date,
        hours: { type: Number, min: 0, max: 24, default: 0 },
        project: String,
        notes: String
      }
    ],

    // Reference to the project this timesheet is for
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: false
    },

    hoursWorked: {
      type: Number,
      required: true,
      min: 0,
      max: 168,
      default: 0
    },

    projectName: {
      type: String,
      trim: true,
      default: ''
    },

    taskDescription: {
      type: String,
      trim: true,
      default: ''
    },

    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },

    notes: {
      type: String,
      trim: true,
      default: ''
    },

    locked: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Ensure only one timesheet per employee/month/year
TimesheetSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Timesheet', TimesheetSchema);
