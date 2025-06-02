import express from 'express';
import { sendOTP, verifyOTP } from '../controllers/ekyc.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/send-otp', requireAuth, sendOTP);
router.post('/verify-otp', requireAuth, verifyOTP);

export default router;