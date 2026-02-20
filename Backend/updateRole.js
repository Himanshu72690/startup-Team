// Script to update user role from 'member' to 'founder'
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const MemberProfile = require('./src/models/MemberProfile');
const FounderProfile = require('./src/models/FounderProfile');

async function updateRole() {
  try {
    // 1. Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // GET EMAIL FROM COMMAND LINE ARGUMENT
    const email = process.argv[2];
    
    if (!email) {
      console.error('Please provide an email address. Usage: node updateRole.js <email>');
      process.exit(1);
    }

    // 2. Find the user
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.email}) - Current Role: ${user.role}`);

    if (user.role === 'founder') {
        console.log('User is already a founder.');
        process.exit(0);
    }

    // 3. Update User Role
    user.role = 'founder';
    await user.save();
    console.log('Updated user role to "founder".');

    // 4. Create Founder Profile if missing
    let founderProfile = await FounderProfile.findOne({ userId: user._id });
    if (!founderProfile) {
        await FounderProfile.create({ userId: user._id });
        console.log('Created Founder Profile.');
    }

    // 5. Delete Member Profile (optional but clean)
    await MemberProfile.findOneAndDelete({ userId: user._id });
    console.log('Removed Member Profile (if existed).');

    console.log('✅ Successfully converted account to Founder!');
    process.exit();

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateRole();
