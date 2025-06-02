import express from 'express';
import { getMessages, sendMessage, clearHistory } from '../controllers/chat.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();

// All chat routes require authentication
router.use(requireAuth);

router.get('/messages', getMessages);
router.post('/send', sendMessage);
router.delete('/clear', clearHistory);

export default router;