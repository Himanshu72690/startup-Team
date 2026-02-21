const express = require('express');
const router = express.Router();
const Startup = require('../models/Startup');
const Role = require('../models/Role');
const MemberProfile = require('../models/MemberProfile');

// Get all active startups with their roles (public endpoint - no authentication required)
router.get('/startups', async (req, res) => {
  try {
    const { search, industry, stage, location } = req.query;

    // Build filter query for startups
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
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

    // Get startups
    const startups = await Startup.find(filter)
      .select('_id name tagline description industry stage location teamSize website linkedin')
      .lean()
      .limit(100);

    // Get all open roles for these startups
    const startupIds = startups.map(s => s._id);
    const roles = await Role.find({
      startupId: { $in: startupIds },
      status: 'open'
    })
      .select('startupId title experienceLevel employmentType skills description salaryRange')
      .lean();

    // Map roles to startups
    const startupsWithRoles = startups.map(startup => {
      const startupRoles = roles.filter(role => role.startupId.toString() === startup._id.toString());
      return {
        ...startup,
        companyName: startup.name, // Add companyName for frontend compatibility
        roles: startupRoles.map(role => ({
          _id: role._id,
          title: role.title,
          type: role.employmentType,
          exp: role.experienceLevel,
          skills: role.skills,
          description: role.description,
          salaryRange: role.salaryRange
        })),
        openRolesCount: startupRoles.length
      };
    });

    res.status(200).json({
      success: true,
      data: startupsWithRoles || []
    });
  } catch (error) {
    console.error('Error fetching public startups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch startups'
    });
  }
});

// Get all members with basic public information
router.get('/members', async (req, res) => {
  try {
    const { search, location } = req.query;

    // Build filter for member profiles
    const filter = {};

    if (search) {
      filter.$or = [
        { currentRole: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Fetch member profiles with user data
    const members = await MemberProfile.find(filter)
      .populate('userId', 'name email avatar')
      .select('userId currentRole location yearsExperience skills category')
      .limit(100)
      .lean();

    // Format response to match frontend expectations
    const formattedMembers = members.map(member => ({
      _id: member._id || member.userId._id,
      name: member.userId?.name || 'Unknown',
      title: member.currentRole || 'Professional',
      role: member.currentRole || 'Professional',
      location: member.location || 'Location Unknown',
      loc: member.location || 'Location Unknown',
      skills: member.skills || [],
      yearsOfExperience: member.yearsExperience || 0,
      category: member.category || 'Engineering',
      avatar: member.userId?.avatar || member.userId?.name?.charAt(0).toUpperCase() || 'M'
    }));

    res.status(200).json({
      success: true,
      data: formattedMembers
    });
  } catch (error) {
    console.error('Error fetching public members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch members',
      error: error.message
    });
  }
});

module.exports = router;
