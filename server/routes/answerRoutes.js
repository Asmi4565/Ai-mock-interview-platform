import express from 'express';
import {
  evaluateAnswer,
  retryAnswer,
  getSessionFeedback,
} from '../controllers/answerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected AI evaluation and feedback routes
router.post('/sessions/:id/answers/:questionIndex/evaluate', protect, evaluateAnswer);
router.post('/sessions/:id/answers/:questionIndex/retry', protect, retryAnswer);
router.get('/sessions/:id/feedback', protect, getSessionFeedback);

export default router;
