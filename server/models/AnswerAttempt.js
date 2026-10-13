import mongoose from 'mongoose';

const answerAttemptSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
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
    answerText: {
      type: String,
      required: [true, 'Answer text cannot be blank'],
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
  },
  {
    timestamps: true,
  }
);

const AnswerAttempt = mongoose.model('AnswerAttempt', answerAttemptSchema);
export default AnswerAttempt;
