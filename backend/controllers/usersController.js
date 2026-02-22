const users = require('../models/users');
const bcrypt = require('bcrypt');

//Add new employees

const createNewUser = async (req,res)=>{
  //add new user to db
  try {
    const { password, ...userData } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await users.create({
      ...userData,
      password: hashedPassword
    });
    
    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    res.status(200).json(userResponse);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

const getOneUser = async (req,res)=>{
  //add new user to db
  try {
    const employeeId = req.params.employeeId;
    console.log('Searching by employeeId:', employeeId);

    const user = await users.findOne({ employeeId });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json(userResponse);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Login endpoint with password validation
const loginUser = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({ msg: 'Employee ID and password are required' });
    }

    const user = await users.findOne({ employeeId });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ msg: 'Your account is not active' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ msg: 'Invalid password' });
    }

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const fetchAllUser = async (req,res)=>{
  //add new user to db
  try {
    const allUsers = await users.find().sort({timestamps:-1});
    
    // Return users without passwords
    const usersWithoutPasswords = allUsers.map(user => {
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    });
    
    res.status(200).json(usersWithoutPasswords);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
}; 

const deleteOneUser = async (req,res)=>{
  //add new user to db
  try {
    const employeeId = req.params.employeeId;
    console.log('Searching by employeeId:', employeeId);

    const user = await users.findOneAndDelete({ employeeId });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

const updateOneUser = async (req,res)=>{
  //add new user to db
  try {
    const employeeId = req.params.employeeId;
    console.log('Searching by employeeId:', employeeId);

    const user = await users.findOneAndUpdate({ employeeId:employeeId },{...req.body});
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

module.exports = {
  createNewUser,
  fetchAllUser,
  getOneUser,
  deleteOneUser,
  updateOneUser,
  loginUser
}