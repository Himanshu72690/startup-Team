const FounderProfile = require('../models/FounderProfile');
const Startup = require('../models/Startup');
const Role = require('../models/Role');
const Application = require('../models/Application');
const User = require('../models/User');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');

// @route   GET /api/founder/profile
// @desc    Get founder profile
// @access  Private (Founder only)
exports.getProfile = async (req, res) => {
  try {
    const profile = await FounderProfile.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone avatar');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Founder profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get founder profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// @route   PUT /api/founder/profile
// @desc    Update founder profile
// @access  Private (Founder only)
exports.updateProfile = async (req, res) => {
  try {
    const { name, experience, bio, skills, linkedin, portfolio } = req.body;

    let profile = await FounderProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Founder profile not found'
      });
    }

    // Update profile fields
    if (experience) profile.experience = experience;
    if (bio) profile.bio = bio;
    if (skills) profile.skills = skills;
    if (linkedin) profile.linkedin = linkedin;
    if (portfolio !== undefined) profile.portfolio = portfolio;

    await profile.save();

    // Also update user name if provided
    if (name) {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { name },
        { new: true }
      );
      console.log('Updated user name to:', name);
    }

    // Fetch updated profile with user data
    const updatedProfile = await FounderProfile.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone avatar');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Update founder profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// @route   POST /api/founder/startup
// @desc    Create startup
// @access  Private (Founder only)
exports.createStartup = async (req, res) => {
  try {
    // Check if founder already has a startup
    const existingStartup = await Startup.findOne({ founderId: req.user._id });
    if (existingStartup) {
      return res.status(400).json({
        success: false,
        message: 'You already have a startup. Each founder can create only one startup.'
      });
    }

    const startup = await Startup.create({
      founderId: req.user._id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Startup created successfully',
      data: startup
    });
  } catch (error) {
    console.error('Create startup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create startup',
      error: error.message
    });
  }
};

// @route   GET /api/founder/startup
// @desc    Get founder's startup
// @access  Private (Founder only)
exports.getStartup = async (req, res) => {
  try {
    const startup = await Startup.findOne({ founderId: req.user._id })
      .populate('founderId', 'name email phone avatar');

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: 'Startup not found. Please create one first.'
      });
    }

    // Get roles count
    const rolesCount = await Role.countDocuments({ startupId: startup._id, status: 'open' });
    
    const response = startup.toObject();
    response.rolesCount = rolesCount;

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Get startup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch startup',
      error: error.message
    });
  }
};

// @route   PUT /api/founder/startup/:id
// @desc    Update startup
// @access  Private (Founder only)
exports.updateStartup = async (req, res) => {
  try {
    let startup = await Startup.findOne({ 
      _id: req.params.id, 
      founderId: req.user._id 
    });

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: 'Startup not found or unauthorized'
      });
    }

    // Update allowed fields
    const allowedFields = ['name', 'logo', 'industry', 'website', 'location', 'stage', 'teamSize', 'tagline', 'description', 'linkedin'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        startup[field] = req.body[field];
      }
    });

    await startup.save();

    res.json({
      success: true,
      message: 'Startup updated successfully',
      data: startup
    });
  } catch (error) {
    console.error('Update startup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update startup',
      error: error.message
    });
  }
};

// @route   POST /api/founder/roles
// @desc    Create a role posting
// @access  Private (Founder only)
exports.createRole = async (req, res) => {
  try {
    // Get founder's startup
    const startup = await Startup.findOne({ founderId: req.user._id });
    
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: 'Please create a startup first before posting roles'
      });
    }

    const role = await Role.create({
      startupId: startup._id,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Role posted successfully',
      data: role
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: error.message
    });
  }
};

// @route   GET /api/founder/roles
// @desc    Get all roles for founder's startup
// @access  Private (Founder only)
exports.getRoles = async (req, res) => {
  try {
    const startup = await Startup.findOne({ founderId: req.user._id });
    
    if (!startup) {
      return res.json({
        success: true,
        data: []
      });
    }

    const roles = await Role.find({ startupId: startup._id })
      .sort({ postedDate: -1 });

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      error: error.message
    });
  }
};

// @route   PUT /api/founder/roles/:id
// @desc    Update a role
// @access  Private (Founder only)
exports.updateRole = async (req, res) => {
  try {
    const startup = await Startup.findOne({ founderId: req.user._id });
    
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: 'Startup not found'
      });
    }

    const role = await Role.findOne({ 
      _id: req.params.id, 
      startupId: startup._id 
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found or unauthorized'
      });
    }

    // Update fields
    const allowedFields = ['title', 'experienceLevel', 'salaryRange', 'employmentType', 'skills', 'description', 'status'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        role[field] = req.body[field];
      }
    });

    await role.save();

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: error.message
    });
  }
};

// @route   DELETE /api/founder/roles/:id
// @desc    Delete a role (soft delete)
// @access  Private (Founder only)
exports.deleteRole = async (req, res) => {
  try {
    const startup = await Startup.findOne({ founderId: req.user._id });
    
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: 'Startup not found'
      });
    }

    const role = await Role.findOne({ 
      _id: req.params.id, 
      startupId: startup._id 
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found or unauthorized'
      });
    }

    // Soft delete by setting status to closed
    role.status = 'closed';
    await role.save();

    res.json({
      success: true,
      message: 'Role closed successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: error.message
    });
  }
};

// @route   GET /api/founder/applications
// @desc    Get all applications for founder's startup
// @access  Private (Founder only)
exports.getApplications = async (req, res) => {
  try {
    const startup = await Startup.findOne({ founderId: req.user._id });
    
    if (!startup) {
      return res.json({
        success: true,
        data: []
      });
    }

    const { status } = req.query;
    const filter = { startupId: startup._id };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('memberId', 'name email phone avatar')
      .populate('roleId', 'title experienceLevel employmentType')
      .sort({ appliedDate: -1 });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// @route   PUT /api/founder/applications/:id/accept
// @desc    Accept an application
// @access  Private (Founder only)
exports.acceptApplication = async (req, res) => {
  try {
    const startup = await Startup.findOne({ founderId: req.user._id });
    
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: 'Startup not found'
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      startupId: startup._id
    }).populate('memberId', 'name email phone')
      .populate('roleId', 'title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized'
      });
    }

    application.status = 'accepted';
    application.notes = req.body.notes || '';
    await application.save();

    // Send notifications
    try {
      await emailService.sendApplicationStatusEmail(
        application.memberId.email,
        application.memberId.name,
        startup.name,
        application.roleId.title,
        'accepted'
      );

      if (application.memberId.phone && req.user.phone) {
        await whatsappService.sendApplicationAccepted(
          application.memberId.phone,
          startup.name,
          req.user.phone
        );
      }
    } catch (notifError) {
      console.error('Notification error:', notifError);
      // Don't fail the request if notification fails
    }

    res.json({
      success: true,
      message: 'Application accepted successfully',
      data: application
    });
  } catch (error) {
    console.error('Accept application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept application',
      error: error.message
    });
  }
};

// @route   PUT /api/founder/applications/:id/reject
// @desc    Reject an application
// @access  Private (Founder only)
exports.rejectApplication = async (req, res) => {
  try {
    const startup = await Startup.findOne({ founderId: req.user._id });
    
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: 'Startup not found'
      });
    }

    const application = await Application.findOne({
      _id: req.params.id,
      startupId: startup._id
    }).populate('memberId', 'name email')
      .populate('roleId', 'title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized'
      });
    }

    application.status = 'rejected';
    application.notes = req.body.notes || '';
    await application.save();

    // Send notification email
    try {
      await emailService.sendApplicationStatusEmail(
        application.memberId.email,
        application.memberId.name,
        startup.name,
        application.roleId.title,
        'rejected'
      );
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.json({
      success: true,
      message: 'Application rejected',
      data: application
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject application',
      error: error.message
    });
  }
};

// @route   GET /api/founder/dashboard
// @desc    Get founder dashboard statistics
// @access  Private (Founder only)
exports.getDashboard = async (req, res) => {
  try {
    const startup = await Startup.findOne({ founderId: req.user._id });
    
    if (!startup) {
      return res.json({
        success: true,
        data: {
          hasStartup: false,
          totalRoles: 0,
          totalApplications: 0,
          pendingApplications: 0,
          recentRoles: []
        }
      });
    }

    const [totalRoles, applications, recentRoles] = await Promise.all([
      Role.countDocuments({ startupId: startup._id, status: 'open' }),
      Application.find({ startupId: startup._id }),
      Role.find({ startupId: startup._id })
        .sort({ postedDate: -1 })
        .limit(5)
    ]);

    const pendingApplications = applications.filter(app => app.status === 'pending').length;

    res.json({
      success: true,
      data: {
        hasStartup: true,
        totalRoles,
        totalApplications: applications.length,
        pendingApplications,
        recentRoles,
        startupViews: startup.viewCount || 0
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};
