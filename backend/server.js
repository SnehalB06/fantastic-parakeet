const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const employeeRoutes = require('./routes/adminEmployee');
const timesheetRoutes = require('./routes/timeSheetRoutes');
const projectRoutes = require('./routes/projectRoutes');


const app = express();

// Enable CORS for both frontend dev ports
// Update the following line with your EC2 public IP (e.g., 'http://<EC2_PUBLIC_IP>:3000')
app.use(cors({
  origin: ['http://184.73.14.231:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.use('/api/admin', employeeRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/projects', projectRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

//connect to db
console.log('🔄 Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGO_URL, {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000
})
.then(()=>{
  console.log('✅ MongoDB connected successfully');
  //listening
  app.listen(process.env.PORT,()=>{
    console.log(`✅ Listening on Port ${process.env.PORT}`);
  });
})
.catch((err)=>{
  console.log('❌ MongoDB connection error:', err.message);
  console.log('⚠️ Starting server anyway for health checks...');
  app.listen(process.env.PORT,()=>{
    console.log(`⚠️ Server listening on Port ${process.env.PORT} (without DB)`);
  });
})


