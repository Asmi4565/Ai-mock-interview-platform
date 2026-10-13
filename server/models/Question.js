import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['HR / Behavioral', 'Technical Fundamentals', 'Role-Specific Practice', 'System Design & Architecture'],
    },
    role: {
      type: String,
      required: true,
      enum: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'General Software Engineer'],
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    idealKeywords: {
      type: [String],
      default: [],
    },
    rubricGuide: {
      type: String,
      default: '',
    },
    sampleAnswer: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient question queries by role, category, and difficulty
questionSchema.index({ role: 1, category: 1, difficulty: 1 });

const Question = mongoose.model('Question', questionSchema);
export default Question;
