
const express = require('express');
const router = express.Router();
const Project = require('../models/project');

// Get projects assigned to a specific employee
router.get('/assigned/:employeeId', async (req, res) => {
  try {
    const projects = await Project.find({ employees: req.params.employeeId });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Create a new project
router.post('/', async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get a single project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update a project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    res.status(200).json(project);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    res.status(200).json({ msg: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
