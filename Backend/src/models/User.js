const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\d\s\+\-\(\)]+$/, 'Please provide a valid phone number']
  },
  role: {
    type: String,
    enum: ['founder', 'member'],
    required: [true, 'User role is required']
  },
  avatar: {
    type: String,
    default: null // Cloudinary URL
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationOTP: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800 // 7 days in seconds
    }
  }],
  authProvider: {
    type: String,
    enum: ['local', 'google', 'linkedin', 'firebase'],
    default: 'local'
  },
  providerId: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();
  
  // Don't hash if using OAuth (no password)
  if (!this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationOTP = otp;
  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(otp) {
  if (!this.verificationOTP || !this.otpExpires) return false;
  if (Date.now() > this.otpExpires) return false;
  return this.verificationOTP === otp;
};

module.exports = mongoose.model('User', userSchema);
