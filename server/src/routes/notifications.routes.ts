import express from 'express';
import { sendWhatsApp, sendSMS } from '../controllers/notifications.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/whatsapp', requireAuth, sendWhatsApp);
router.post('/sms', requireAuth, sendSMS);

export default router;