const MemberProfile = require('../models/MemberProfile');
const Startup = require('../models/Startup');
const Role = require('../models/Role');
const Application = require('../models/Application');
const SavedStartup = require('../models/SavedStartup');
const emailService = require('../services/emailService');

// @route   GET /api/member/profile
// @desc    Get member profile
// @access  Private (Member only)
exports.getProfile = async (req, res) => {
  try {
    const profile = await MemberProfile.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone avatar');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get member profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// @route   PUT /api/member/profile
// @desc    Update member profile
// @access  Private (Member only)
exports.updateProfile = async (req, res) => {
  try {
    const { currentRole, company, yearsExperience, linkedin, github, skills, bio, portfolio } = req.body;

    let profile = await MemberProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Member profile not found'
      });
    }

    // Update fields
    if (currentRole) profile.currentRole = currentRole;
    if (company !== undefined) profile.company = company;
    if (yearsExperience !== undefined) profile.yearsExperience = yearsExperience;
    if (linkedin !== undefined) profile.linkedin = linkedin;
    if (github !== undefined) profile.github = github;
    if (skills) profile.skills = skills;
    if (bio) profile.bio = bio;
    // Update portfolio - handle new file, deletion, or no change
    if (portfolio !== undefined) {
      if (portfolio === null) {
        // Explicitly delete portfolio
        profile.portfolio = null;
      } else if (typeof portfolio === 'object' && Object.keys(portfolio).length > 0 && portfolio.filename) {
        // Update with new portfolio metadata
        profile.portfolio = portfolio;
      }
      // If empty object, don't update
    }

    await profile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Update member profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// @route   GET /api/member/startups
// @desc    Explore startups with filtering and search
// @access  Private (Member only)
exports.exploreStartups = async (req, res) => {
  try {
    const { search, industry, stage, location, page = 1, limit = 12, sort = 'newest' } = req.query;

    // Build filter query
    const filter = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }

    if (industry) {
      const industries = industry.split(',');
      filter.industry = { $in: industries };
    }

    if (stage) {
      const stages = stage.split(',');
      filter.stage = { $in: stages };
    }

    if (location) {
      filter.location = new RegExp(location, 'i');
    }

    // Determine sort order
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'views':
        sortOption = { viewCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [startups, totalCount] = await Promise.all([
      Startup.find(filter)
        .populate('founderId', 'name avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Startup.countDocuments(filter)
    ]);

    // Get role counts for each startup
    const startupsWithRoles = await Promise.all(
      startups.map(async (startup) => {
        const openRoles = await Role.countDocuments({ 
          startupId: startup._id, 
          status: 'open' 
        });
        const startupObj = startup.toObject();
        startupObj.openRolesCount = openRoles;
        return startupObj;
      })
    );

    res.json({
      success: true,
      data: startupsWithRoles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
        hasMore: skip + startups.length < totalCount
      }
    });
  } catch (error) {
    console.error('Explore startups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch startups',
      error: error.message
    });
  }
};

// @route   GET /api/member/startups/:id
// @desc    Get startup details
// @access  Private (Member only)
exports.getStartupDetails = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id)
      .populate('founderId', 'name email phone avatar');

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: 'Startup not found'
      });
    }

    // Increment view count
    startup.viewCount += 1;
    await startup.save();

    // Get open roles
    const roles = await Role.find({ 
      startupId: startup._id, 
      status: 'open' 
    }).sort({ postedDate: -1 });

    const response = startup.toObject();
    response.roles = roles;

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Get startup details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch startup details',
      error: error.message
    });
  }
};

// @route   POST /api/member/applications
// @desc    Apply to a role
// @access  Private (Member only)
exports.applyToRole = async (req, res) => {
  try {
    const { roleId, coverLetter } = req.body;

    // Check if role exists and is open
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    if (role.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This role is no longer accepting applications'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      memberId: req.user._id,
      roleId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this role'
      });
    }

    // Get startup
    const startup = await Startup.findById(role.startupId)
      .populate('founderId', 'name email');

    // Create application
    const application = await Application.create({
      memberId: req.user._id,
      startupId: role.startupId,
      roleId,
      coverLetter,
      status: 'pending'
    });

    // Update role applications count
    role.applicationsCount += 1;
    await role.save();

    // Send notification to founder
    try {
      if (startup && startup.founderId.email) {
        await emailService.sendNewApplicationEmail(
          startup.founderId.email,
          startup.founderId.name,
          req.user.name,
          role.title,
          startup.name
        );
      }
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Apply to role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// @route   GET /api/member/applications
// @desc    Get member's applications
// @access  Private (Member only)
exports.getMyApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { memberId: req.user._id };
    
    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('startupId', 'name logo industry stage')
      .populate('roleId', 'title employmentType experienceLevel')
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

// @route   DELETE /api/member/applications/:id
// @desc    Cancel application
// @access  Private (Member only)
exports.cancelApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      memberId: req.user._id,
      status: 'pending' // Can only cancel pending applications
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or cannot be cancelled'
      });
    }

    await application.deleteOne();

    // Decrement role applications count
    await Role.findByIdAndUpdate(application.roleId, {
      $inc: { applicationsCount: -1 }
    });

    res.json({
      success: true,
      message: 'Application cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel application',
      error: error.message
    });
  }
};

// @route   POST /api/member/startups/:id/save
// @desc    Save/bookmark a startup
// @access  Private (Member only)
exports.saveStartup = async (req, res) => {
  try {
    const startupId = req.params.id;

    // Check if startup exists
    const startup = await Startup.findById(startupId);
    if (!startup) {
      return res.status(404).json({
        success: false,
        message: 'Startup not found'
      });
    }

    // Check if already saved
    const existing = await SavedStartup.findOne({
      userId: req.user._id,
      startupId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Startup already saved'
      });
    }

    await SavedStartup.create({
      userId: req.user._id,
      startupId
    });

    res.json({
      success: true,
      message: 'Startup saved successfully'
    });
  } catch (error) {
    console.error('Save startup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save startup',
      error: error.message
    });
  }
};

// @route   DELETE /api/member/startups/:id/save
// @desc    Remove saved startup
// @access  Private (Member only)
exports.unsaveStartup = async (req, res) => {
  try {
    const result = await SavedStartup.findOneAndDelete({
      userId: req.user._id,
      startupId: req.params.id
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Saved startup not found'
      });
    }

    res.json({
      success: true,
      message: 'Startup removed from saved list'
    });
  } catch (error) {
    console.error('Unsave startup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove saved startup',
      error: error.message
    });
  }
};

// @route   GET /api/member/startups/saved
// @desc    Get saved startups
// @access  Private (Member only)
exports.getSavedStartups = async (req, res) => {
  try {
    const savedStartups = await SavedStartup.find({ userId: req.user._id })
      .populate({
        path: 'startupId',
        populate: { path: 'founderId', select: 'name avatar' }
      })
      .sort({ savedDate: -1 });

    const startups = savedStartups
      .filter(saved => saved.startupId) // Filter out deleted startups
      .map(saved => saved.startupId);

    res.json({
      success: true,
      data: startups
    });
  } catch (error) {
    console.error('Get saved startups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved startups',
      error: error.message
    });
  }
};

// @route   GET /api/member/dashboard
// @desc    Get member dashboard statistics
// @access  Private (Member only)
exports.getDashboard = async (req, res) => {
  try {
    const [applications, savedStartupsCount] = await Promise.all([
      Application.find({ memberId: req.user._id }),
      SavedStartup.countDocuments({ userId: req.user._id })
    ]);

    const totalApplications = applications.length;
    const pendingCount = applications.filter(app => app.status === 'pending').length;
    const interviewCount = applications.filter(app => app.status === 'interview').length;
    const acceptedCount = applications.filter(app => app.status === 'accepted').length;

    // Get new startups from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newStartupsCount = await Startup.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      isActive: true
    });

    res.json({
      success: true,
      data: {
        totalApplications,
        pendingCount,
        interviewCount,
        acceptedCount,
        savedStartupsCount,
        newStartupsCount
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
