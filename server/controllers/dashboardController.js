import mongoose from 'mongoose';
import InterviewSession from '../models/InterviewSession.js';
import Feedback from '../models/Feedback.js';

// @desc    Get aggregated dashboard stats for authenticated student
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Return empty stats immediately if database is offline, avoiding buffering timeout
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        stats: {
          totalSessions: 0,
          completedSessions: 0,
          averageOverallScore: null,
          totalEvaluatedAnswers: 0,
          rubricAverages: {
            relevance: 0,
            clarity: 0,
            completeness: 0,
            technicalCorrectness: 0,
            examplesAndReasoning: 0,
          },
          recentSessions: [],
          databaseStatus: 'disconnected',
        },
      });
    }

    // 1. Total and completed sessions count
    const totalSessions = await InterviewSession.countDocuments({ userId });
    const completedSessions = await InterviewSession.countDocuments({
      userId,
      status: 'completed',
    });

    // 2. Fetch all feedbacks for this student to compute average rubric scores
    const feedbacks = await Feedback.find({ userId });

    let avgOverall = 0;
    const rubricTotals = {
      relevance: 0,
      clarity: 0,
      completeness: 0,
      technicalCorrectness: 0,
      examplesAndReasoning: 0,
    };

    if (feedbacks.length > 0) {
      feedbacks.forEach((f) => {
        avgOverall += f.overallScore || 0;
        if (f.rubricScores) {
          rubricTotals.relevance += f.rubricScores.relevance || 0;
          rubricTotals.clarity += f.rubricScores.clarity || 0;
          rubricTotals.completeness += f.rubricScores.completeness || 0;
          rubricTotals.technicalCorrectness += f.rubricScores.technicalCorrectness || 0;
          rubricTotals.examplesAndReasoning += f.rubricScores.examplesAndReasoning || 0;
        }
      });

      avgOverall = Math.round(avgOverall / feedbacks.length);
      Object.keys(rubricTotals).forEach((k) => {
        rubricTotals[k] = parseFloat((rubricTotals[k] / feedbacks.length).toFixed(1));
      });
    }

    // 3. Fetch 5 most recent sessions with their score
    const recentSessions = await InterviewSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Map each recent session with its average feedback score
    for (const sess of recentSessions) {
      const sessFeedbacks = await Feedback.find({ sessionId: sess._id });
      if (sessFeedbacks.length > 0) {
        sess.avgScore = Math.round(
          sessFeedbacks.reduce((sum, f) => sum + (f.overallScore || 0), 0) /
            sessFeedbacks.length
        );
      } else {
        sess.avgScore = null;
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        totalSessions,
        completedSessions,
        totalEvaluatedAnswers: feedbacks.length,
        averageOverallScore: feedbacks.length > 0 ? avgOverall : null,
        rubricAverages: rubricTotals,
        recentSessions,
      },
    });
  } catch (error) {
    next(error);
  }
};
