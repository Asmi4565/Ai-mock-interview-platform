import InterviewSession from '../models/InterviewSession.js';
import Question from '../models/Question.js';
import AnswerAttempt from '../models/AnswerAttempt.js';
import { defaultQuestions } from '../data/seedQuestions.js';

// Supported Configuration Options
export const INTERVIEW_OPTIONS = {
  roles: [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'General Software Engineer',
  ],
  categories: [
    'HR / Behavioral',
    'Technical Fundamentals',
    'Role-Specific Practice',
    'System Design & Architecture',
  ],
  difficulties: ['Beginner', 'Intermediate', 'Advanced'],
  questionCounts: [3, 5, 7],
};

// @desc    Get supported roles, categories, and difficulties
// @route   GET /api/interview-options
// @access  Private
export const getInterviewOptions = async (req, res) => {
  res.status(200).json({
    success: true,
    options: INTERVIEW_OPTIONS,
  });
};

// @desc    Create a new mock interview practice session
// @route   POST /api/sessions
// @access  Private
export const createSession = async (req, res, next) => {
  try {
    const {
      role = 'Full Stack Developer',
      interviewType = 'Technical Fundamentals',
      difficulty = 'Beginner',
      questionCount = 3,
    } = req.body;

    const count = Math.min(Math.max(parseInt(questionCount, 10) || 3, 1), 10);

    // 1. Fetch matching questions from database
    let dbQuestions = await Question.find({
      category: interviewType,
      isActive: true,
    });

    // 2. If fewer questions in DB than requested, supplement with seed questions
    let candidateQuestions = dbQuestions.length > 0 ? dbQuestions : defaultQuestions.filter((q) => q.category === interviewType);
    if (candidateQuestions.length === 0) {
      candidateQuestions = defaultQuestions;
    }

    // Shuffle and pick questionCount questions
    const shuffled = [...candidateQuestions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, count).map((q) => ({
      questionId: q._id || null,
      prompt: q.prompt,
      category: q.category,
      difficulty: q.difficulty || difficulty,
    }));

    // 3. Create Session with ownership tied strictly to req.user._id
    const session = await InterviewSession.create({
      userId: req.user._id,
      role: role.trim(),
      interviewType,
      difficulty,
      questionCount: selectedQuestions.length,
      questions: selectedQuestions,
      answers: [],
      status: 'in-progress',
      startedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Interview session created successfully.',
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's interview sessions (with pagination)
// @route   GET /api/sessions
// @access  Private
export const getUserSessions = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const total = await InterviewSession.countDocuments({ userId: req.user._id });
    const sessions = await InterviewSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-questions.prompt -answers.answerText'); // Light list payload

    res.status(200).json({
      success: true,
      sessions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single interview session by ID with full questions and answers
// @route   GET /api/sessions/:id
// @access  Private
export const getSessionById = async (req, res, next) => {
  try {
    const session = await InterviewSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    // STRICT OWNERSHIP CHECK: Student can only access their own session
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to access another student’s interview session.',
      });
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit / update answer for a question in a session
// @route   POST /api/sessions/:id/answers
// @access  Private
export const saveAnswer = async (req, res, next) => {
  try {
    const { questionIndex, answerText } = req.body;

    if (questionIndex === undefined || typeof questionIndex !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid questionIndex is required.',
      });
    }

    if (!answerText || typeof answerText !== 'string' || answerText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Answer text cannot be blank.',
      });
    }

    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    // STRICT OWNERSHIP CHECK
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot submit answers to an interview session you do not own.',
      });
    }

    if (questionIndex < 0 || questionIndex >= session.questions.length) {
      return res.status(400).json({
        success: false,
        message: `Invalid questionIndex ${questionIndex}. Session contains ${session.questions.length} questions.`,
      });
    }

    const targetQuestion = session.questions[questionIndex];

    // Find if an answer already exists for this index
    const existingIndex = session.answers.findIndex((a) => a.questionIndex === questionIndex);

    let savedAnswer;
    let attemptNumber = 1;

    if (existingIndex >= 0) {
      // Revision / Retry
      attemptNumber = (session.answers[existingIndex].attemptNumber || 1) + 1;
      session.answers[existingIndex].answerText = answerText.trim();
      session.answers[existingIndex].attemptNumber = attemptNumber;
      session.answers[existingIndex].submittedAt = new Date();
      savedAnswer = session.answers[existingIndex];
    } else {
      // First submission
      savedAnswer = {
        questionIndex,
        questionText: targetQuestion.prompt,
        answerText: answerText.trim(),
        attemptNumber: 1,
        submittedAt: new Date(),
      };
      session.answers.push(savedAnswer);
    }

    await session.save();

    // Persist to AnswerAttempt collection for audit and retry history
    await AnswerAttempt.create({
      sessionId: session._id,
      userId: req.user._id,
      questionIndex,
      questionText: targetQuestion.prompt,
      answerText: answerText.trim(),
      attemptNumber,
      submittedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Answer saved successfully.',
      answer: savedAnswer,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark session as completed
// @route   POST /api/sessions/:id/complete
// @access  Private
export const completeSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    // STRICT OWNERSHIP CHECK
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this session.',
      });
    }

    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Interview session completed.',
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete session and related answers
// @route   DELETE /api/sessions/:id
// @access  Private
export const deleteSession = async (req, res, next) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    // STRICT OWNERSHIP CHECK
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot delete another student’s session.',
      });
    }

    await InterviewSession.findByIdAndDelete(req.params.id);
    await AnswerAttempt.deleteMany({ sessionId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Interview session deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
