const User = require('../models/User');
const FounderProfile = require('../models/FounderProfile');
const MemberProfile = require('../models/MemberProfile');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwtUtils');
const { generateResetToken, hashToken } = require('../utils/tokenUtils');
const emailService = require('../services/emailService');

// @route   POST /api/auth/register-firebase
// @desc    Sync Firebase registration with MongoDB
// @access  Public
exports.registerFirebase = async (req, res) => {
  try {
    const { uid, name, email, phone, role, provider } = req.body;
    
    console.log('Register Firebase Request:', { uid, name, email, role, provider }); // DEBUG LOG

    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      console.log('User found in DB:', user.email, 'Role:', user.role);
    
      // Force update role if user provides a different one during "signup" (not login)
      // This is important because users might have accidentally created an account with wrong role
      if (role && role !== user.role) {
         console.log('Updating existing user role to:', role);
         user.role = role;
         await user.save();
         
         // Fix profile type mismatch
         if (role === 'founder') {
             await MemberProfile.findOneAndDelete({ userId: user._id });
             const existingProfile = await FounderProfile.findOne({ userId: user._id });
             if (!existingProfile) await FounderProfile.create({ userId: user._id });
         } else {
             await FounderProfile.findOneAndDelete({ userId: user._id });
             const existingProfile = await MemberProfile.findOne({ userId: user._id });
             if (!existingProfile) await MemberProfile.create({ userId: user._id });
         }
      }
      
      return res.status(200).json({
        success: true,
        message: 'User already registered',
        data: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      });
    }

    // Create new user
    user = new User({
      name: name || email.split('@')[0],
      email,
      phone,
      role: role || 'member',
      authProvider: provider || 'firebase',
      providerId: uid, // Storing Firebase UID
      emailVerified: provider === 'google', // Google is verified, email/pass needs link
      lastLogin: Date.now()
    });

    await user.save();

    // Create associated profile based on role
    if (user.role === 'founder') {
      await FounderProfile.create({ userId: user._id });
    } else {
      await MemberProfile.create({ userId: user._id });
    }

    res.status(201).json({
      success: true,
      message: 'User registered in backend',
      data: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Firebase registration sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Backend registration sync failed',
      error: error.message
    });
  }
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      role,
      authProvider: 'local'
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Create associated profile based on role
    if (role === 'founder') {
      await FounderProfile.create({ userId: user._id });
    } else {
      await MemberProfile.create({ userId: user._id });
    }

    // Send verification email (skip in development if email fails)
    try {
      await emailService.sendVerificationEmail(email, otp, name);
    } catch (emailError) {
      console.warn('Email sending failed (continuing in development mode):', emailError.message);
      // In development, log the OTP to console
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n📧 OTP for ${email}: ${otp}\n`);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification code.',
      data: {
        email: user.email,
        name: user.name,
        role: user.role,
        ...(process.env.NODE_ENV === 'development' && { otp }) // Include OTP in dev mode
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @route   POST /api/auth/verify-email
// @desc    Verify email with OTP
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+verificationOTP +otpExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified. Please login.'
      });
    }

    if (!user.verifyOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.verificationOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.'
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
};

// @route   POST /api/auth/resend-otp
// @desc    Resend verification OTP
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send email (skip in development if email fails)
    try {
      await emailService.sendVerificationEmail(email, otp, user.name);
    } catch (emailError) {
      console.warn('Email sending failed (continuing in development mode):', emailError.message);
      // In development, log the OTP to console
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n📧 OTP for ${email}: ${otp}\n`);
      }
    }

    res.json({
      success: true,
      message: 'New verification code sent to your email',
      ...(process.env.NODE_ENV === 'development' && { data: { otp } }) // Include OTP in dev mode
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if using OAuth (no password)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account uses social login. Please login with ' + user.authProvider
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check email verification
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        requiresVerification: true
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user._id);

    // Save refresh token
    user.refreshTokens.push({ token: refreshToken });
    user.lastLogin = Date.now();
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user and check if refresh token exists
    const user = await User.findOne({
      _id: decoded.id,
      'refreshTokens.token': refreshToken
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new token pair
    const tokens = generateTokenPair(user._id);

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
    user.refreshTokens.push({ token: tokens.refreshToken });
    await user.save();

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate refresh token)
// @access  Private
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove the specific refresh token
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: { token: refreshToken } }
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.'
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = hashToken(resetToken);

    // Save hashed token and expiry
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Send email with reset token
    await emailService.sendPasswordResetEmail(email, resetToken, user.name);

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process request',
      error: error.message
    });
  }
};

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: error.message
    });
  }
};

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data',
      error: error.message
    });
  }
};
