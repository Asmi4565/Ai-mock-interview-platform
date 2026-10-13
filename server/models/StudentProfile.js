import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    educationLevel: {
      type: String,
      enum: [
        'High School',
        'Undergraduate - 1st Year',
        'Undergraduate - 2nd Year',
        'Undergraduate - 3rd Year',
        'Undergraduate - Final Year',
        'Postgraduate / Masters',
        'Recent Graduate',
        'Other',
      ],
      default: 'Undergraduate - Final Year',
    },
    targetRole: {
      type: String,
      default: 'Full Stack Developer',
      trim: true,
    },
    skills: {
      type: [String],
      default: ['JavaScript', 'React', 'Node.js'],
    },
    projectDescriptions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
export default StudentProfile;
