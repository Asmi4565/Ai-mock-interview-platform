// Request validation helpers

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Name is required and must be at least 2 characters long.',
    });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.',
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.',
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Both email and password are required.',
    });
  }

  next();
};

export const validateProfile = (req, res, next) => {
  const { educationLevel, targetRole, skills, projectDescriptions } = req.body;

  if (skills && !Array.isArray(skills)) {
    return res.status(400).json({
      success: false,
      message: 'Skills must be an array of strings.',
    });
  }

  if (projectDescriptions && !Array.isArray(projectDescriptions)) {
    return res.status(400).json({
      success: false,
      message: 'Project descriptions must be an array of strings.',
    });
  }

  next();
};
