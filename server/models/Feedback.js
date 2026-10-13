import mongoose from 'mongoose';

const rubricScoresSchema = new mongoose.Schema(
  {
    relevance: { type: Number, min: 1, max: 10, required: true },
    clarity: { type: Number, min: 1, max: 10, required: true },
    completeness: { type: Number, min: 1, max: 10, required: true },
    technicalCorrectness: { type: Number, min: 1, max: 10, required: true },
    examplesAndReasoning: { type: Number, min: 1, max: 10, required: true },
  },
  { _id: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
      index: true,
    },
    answerAttemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AnswerAttempt',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    questionIndex: {
      type: Number,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    studentAnswer: {
      type: String,
      required: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    rubricScores: {
      type: rubricScoresSchema,
      required: true,
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    missingPoints: {
      type: [String],
      default: [],
    },
    explanation: {
      type: String,
      required: true,
    },
    suggestedAnswer: {
      type: String,
      default: '',
    },
    providerStatus: {
      type: String,
      enum: ['live_ai', 'evaluation_failed'],
      default: 'live_ai',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly fetch feedback per session & attempt
feedbackSchema.index({ sessionId: 1, questionIndex: 1, attemptNumber: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
