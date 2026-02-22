const mongoose = require('mongoose');
require('dotenv').config();

async function dropUsernameIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    const collection = mongoose.connection.db.collection('users');
    
    // Drop the old username index
    try {
      await collection.dropIndex('username_1');
      console.log('✅ Successfully dropped username_1 index');
    } catch (err) {
      if (err.message.includes('index not found')) {
        console.log('ℹ️  Index username_1 not found (already dropped)');
      } else {
        throw err;
      }
    }
    
    await mongoose.connection.close();
    console.log('✅ Index cleanup complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

dropUsernameIndex();
