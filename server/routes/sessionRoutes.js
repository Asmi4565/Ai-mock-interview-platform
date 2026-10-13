import express from 'express';
import {
  getInterviewOptions,
  createSession,
  getUserSessions,
  getSessionById,
  saveAnswer,
  completeSession,
  deleteSession,
} from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Options endpoint can be reached with auth
router.get('/interview-options', protect, getInterviewOptions);

// Session endpoints
router.post('/sessions', protect, createSession);
router.get('/sessions', protect, getUserSessions);
router.get('/sessions/:id', protect, getSessionById);
router.post('/sessions/:id/answers', protect, saveAnswer);
router.post('/sessions/:id/complete', protect, completeSession);
router.delete('/sessions/:id', protect, deleteSession);

export default router;
