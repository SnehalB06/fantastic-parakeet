const { json } = require('body-parser');
const express =require('express');
const adminEmployees = express.Router();
const users = require('../models/users');
const {createNewUser, 
  fetchAllUser,
  getOneUser,deleteOneUser,
    updateOneUser,
    loginUser} =require('../controllers/usersController')

adminEmployees.get('/',fetchAllUser);

//SINGLE employee details
adminEmployees.get('/:employeeId',getOneUser);

//Add new employees
adminEmployees.post('/', createNewUser);

// Login endpoint
adminEmployees.post('/login', loginUser);

// Delete employees
adminEmployees.delete('/:employeeId',deleteOneUser);

// Update employees
adminEmployees.patch('/:employeeId',updateOneUser);


module.exports = adminEmployees;