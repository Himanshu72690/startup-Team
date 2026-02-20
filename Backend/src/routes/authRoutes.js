const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateVerifyOTP,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validators');
const { generateTokenPair } = require('../utils/jwtUtils');

// Local Authentication Routes
router.post('/register', validateRegister, authController.register);
router.post('/register-firebase', authController.registerFirebase); // New route for Firebase sync
router.post('/verify-email', validateVerifyOTP, authController.verifyEmail);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.get('/me', protect, authController.getMe);

// Google OAuth Routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/pages/login.html?error=oauth_failed`,
    session: false 
  }),
  (req, res) => {
    try {
      // Generate tokens
      const { accessToken, refreshToken } = generateTokenPair(req.user._id);
      
      // Redirect to frontend with tokens
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:8000';
      res.redirect(`${frontendURL}/pages/oauth-callback.html?access=${accessToken}&refresh=${refreshToken}&role=${req.user.role}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/pages/login.html?error=oauth_failed`);
    }
  }
);

// LinkedIn OAuth Routes
router.get('/linkedin',
  passport.authenticate('linkedin', { 
    session: false 
  })
);

router.get('/linkedin/callback',
  passport.authenticate('linkedin', { 
    failureRedirect: `${process.env.FRONTEND_URL}/pages/login.html?error=oauth_failed`,
    session: false 
  }),
  (req, res) => {
    try {
      // Generate tokens
      const { accessToken, refreshToken } = generateTokenPair(req.user._id);
      
      // Redirect to frontend with tokens
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:8000';
      res.redirect(`${frontendURL}/pages/oauth-callback.html?access=${accessToken}&refresh=${refreshToken}&role=${req.user.role}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/pages/login.html?error=oauth_failed`);
    }
  }
);

module.exports = router;
