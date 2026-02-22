const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED'],
    default: 'ACTIVE'
  },
  workSteps: [
    {
      stepName: { type: String, required: true },
      description: { type: String },
      order: { type: Number }
    }
  ],
  employees: [{ type: String, ref: 'User' }], // employeeId strings
  clients: [{ type: String, ref: 'User' }],   // employeeId strings for clients
  projectManager: { type: String, ref: 'User' }, // employeeId string for PM
  billing: {
    hourlyRate: { type: Number, default: 50 },
    budget: { type: Number },
    currency: { type: String, default: 'USD' },
    notes: { type: String }
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);
