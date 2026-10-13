import StudentProfile from '../models/StudentProfile.js';

// @desc    Get current student's profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user._id });

    // If profile does not exist, initialize one
    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user._id,
        targetRole: 'Full Stack Developer',
        skills: ['JavaScript', 'React', 'Node.js'],
        educationLevel: 'Undergraduate - Final Year',
        projectDescriptions: [],
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current student's profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { educationLevel, targetRole, skills, projectDescriptions } = req.body;

    let profile = await StudentProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = new StudentProfile({ userId: req.user._id });
    }

    if (educationLevel !== undefined) profile.educationLevel = educationLevel;
    if (targetRole !== undefined) profile.targetRole = targetRole.trim();
    if (skills !== undefined) {
      profile.skills = skills.map((s) => s.trim()).filter((s) => s.length > 0);
    }
    if (projectDescriptions !== undefined) {
      profile.projectDescriptions = projectDescriptions
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};
