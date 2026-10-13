import mongoose from 'mongoose';

const sessionQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    },
    prompt: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      default: 'Beginner',
    },
  },
  { _id: true }
);

const sessionAnswerSchema = new mongoose.Schema(
  {
    questionIndex: {
      type: Number,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    answerText: {
      type: String,
      required: true,
      trim: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    feedbackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    interviewType: {
      type: String,
      required: true,
      enum: ['HR / Behavioral', 'Technical Fundamentals', 'Role-Specific Practice', 'System Design & Architecture'],
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    questionCount: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },
    questions: [sessionQuestionSchema],
    answers: [sessionAnswerSchema],
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index to efficiently list a student's sessions sorted by recency
interviewSessionSchema.index({ userId: 1, createdAt: -1 });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
export default InterviewSession;
