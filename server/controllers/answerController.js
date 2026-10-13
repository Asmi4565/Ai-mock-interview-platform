import InterviewSession from '../models/InterviewSession.js';
import AnswerAttempt from '../models/AnswerAttempt.js';
import Feedback from '../models/Feedback.js';
import { evaluateAnswerWithAI, MissingCredentialsError } from '../services/aiService.js';

// @desc    Evaluate a specific answer attempt using Live AI
// @route   POST /api/sessions/:id/answers/:questionIndex/evaluate
// @access  Private
export const evaluateAnswer = async (req, res, next) => {
  try {
    const { id, questionIndex } = req.params;
    const qIdx = parseInt(questionIndex, 10);

    const session = await InterviewSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    // STRICT OWNERSHIP CHECK
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot evaluate an interview session belonging to another user.',
      });
    }

    const question = session.questions[qIdx];
    if (!question) {
      return res.status(400).json({ success: false, message: `Question at index ${qIdx} does not exist.` });
    }

    const answer = session.answers.find((a) => a.questionIndex === qIdx);
    if (!answer || !answer.answerText?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'No answer has been submitted for this question yet.',
      });
    }

    // Find latest AnswerAttempt record
    let attempt = await AnswerAttempt.findOne({
      sessionId: session._id,
      questionIndex: qIdx,
    }).sort({ attemptNumber: -1 });

    if (!attempt) {
      attempt = await AnswerAttempt.create({
        sessionId: session._id,
        userId: req.user._id,
        questionIndex: qIdx,
        questionText: question.prompt,
        answerText: answer.answerText,
        attemptNumber: answer.attemptNumber || 1,
      });
    }

    // Call Live LLM Service
    const aiEvaluation = await evaluateAnswerWithAI({
      role: session.role,
      interviewType: session.interviewType,
      difficulty: session.difficulty,
      questionPrompt: question.prompt,
      studentAnswer: answer.answerText,
      attemptNumber: attempt.attemptNumber,
    });

    // Save Feedback in MongoDB
    const feedback = await Feedback.create({
      sessionId: session._id,
      answerAttemptId: attempt._id,
      userId: req.user._id,
      questionIndex: qIdx,
      questionText: question.prompt,
      studentAnswer: answer.answerText,
      attemptNumber: attempt.attemptNumber,
      overallScore: aiEvaluation.overallScore,
      rubricScores: aiEvaluation.rubricScores,
      strengths: aiEvaluation.strengths,
      improvements: aiEvaluation.improvements,
      missingPoints: aiEvaluation.missingPoints,
      explanation: aiEvaluation.explanation,
      suggestedAnswer: aiEvaluation.suggestedAnswer,
      providerStatus: 'live_ai',
    });

    // Link feedback back to AnswerAttempt and Session subdocument
    attempt.feedbackId = feedback._id;
    await attempt.save();

    const ansSubdoc = session.answers.find((a) => a.questionIndex === qIdx);
    if (ansSubdoc) {
      ansSubdoc.feedbackId = feedback._id;
      await session.save();
    }

    res.status(200).json({
      success: true,
      message: 'Answer successfully evaluated by AI.',
      feedback,
    });
  } catch (error) {
    if (error instanceof MissingCredentialsError) {
      return res.status(400).json({
        success: false,
        errorType: 'MISSING_CREDENTIALS',
        message: error.message,
        instructions:
          '1. Get a free API key at https://aistudio.google.com\n2. Open server/.env and set AI_API_KEY=your_key_here\n3. Restart server.',
      });
    }
    next(error);
  }
};

// @desc    Retry an answer and receive comparison feedback
// @route   POST /api/sessions/:id/answers/:questionIndex/retry
// @access  Private
export const retryAnswer = async (req, res, next) => {
  try {
    const { id, questionIndex } = req.params;
    const { revisedAnswerText } = req.body;
    const qIdx = parseInt(questionIndex, 10);

    if (!revisedAnswerText || !revisedAnswerText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Revised answer cannot be blank.',
      });
    }

    const session = await InterviewSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    // STRICT OWNERSHIP CHECK
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify another student’s interview.',
      });
    }

    const question = session.questions[qIdx];
    if (!question) {
      return res.status(400).json({ success: false, message: 'Question not found in session.' });
    }

    // Fetch prior attempt and prior feedback
    const previousAttempt = await AnswerAttempt.findOne({
      sessionId: session._id,
      questionIndex: qIdx,
    }).sort({ attemptNumber: -1 });

    const newAttemptNumber = (previousAttempt?.attemptNumber || 1) + 1;

    // Create new AnswerAttempt
    const newAttempt = await AnswerAttempt.create({
      sessionId: session._id,
      userId: req.user._id,
      questionIndex: qIdx,
      questionText: question.prompt,
      answerText: revisedAnswerText.trim(),
      attemptNumber: newAttemptNumber,
    });

    // Evaluate revised attempt with AI
    const aiEvaluation = await evaluateAnswerWithAI({
      role: session.role,
      interviewType: session.interviewType,
      difficulty: session.difficulty,
      questionPrompt: question.prompt,
      studentAnswer: revisedAnswerText.trim(),
      attemptNumber: newAttemptNumber,
      previousAnswer: previousAttempt?.answerText,
    });

    // Save New Feedback
    const newFeedback = await Feedback.create({
      sessionId: session._id,
      answerAttemptId: newAttempt._id,
      userId: req.user._id,
      questionIndex: qIdx,
      questionText: question.prompt,
      studentAnswer: revisedAnswerText.trim(),
      attemptNumber: newAttemptNumber,
      overallScore: aiEvaluation.overallScore,
      rubricScores: aiEvaluation.rubricScores,
      strengths: aiEvaluation.strengths,
      improvements: aiEvaluation.improvements,
      missingPoints: aiEvaluation.missingPoints,
      explanation: aiEvaluation.explanation,
      suggestedAnswer: aiEvaluation.suggestedAnswer,
      providerStatus: 'live_ai',
    });

    // Update Session subdocument with latest retry
    const ansSubdoc = session.answers.find((a) => a.questionIndex === qIdx);
    if (ansSubdoc) {
      ansSubdoc.answerText = revisedAnswerText.trim();
      ansSubdoc.attemptNumber = newAttemptNumber;
      ansSubdoc.feedbackId = newFeedback._id;
      ansSubdoc.submittedAt = new Date();
      await session.save();
    }

    res.status(200).json({
      success: true,
      message: `Attempt ${newAttemptNumber} evaluated successfully.`,
      feedback: newFeedback,
      attemptNumber: newAttemptNumber,
    });
  } catch (error) {
    if (error instanceof MissingCredentialsError) {
      return res.status(400).json({
        success: false,
        errorType: 'MISSING_CREDENTIALS',
        message: error.message,
      });
    }
    next(error);
  }
};

// @desc    Get all feedback records for a session
// @route   GET /api/sessions/:id/feedback
// @access  Private
export const getSessionFeedback = async (req, res, next) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    // STRICT OWNERSHIP CHECK
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot view feedback for another user’s interview.',
      });
    }

    const feedbacks = await Feedback.find({ sessionId: session._id }).sort({
      questionIndex: 1,
      attemptNumber: 1,
    });

    res.status(200).json({
      success: true,
      feedbacks,
      session,
    });
  } catch (error) {
    next(error);
  }
};
