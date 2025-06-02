import express from 'express';
import { authorize, getDocuments, getDocument } from '../controllers/digilocker.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/authorize', requireAuth, authorize);
router.get('/documents', requireAuth, getDocuments);
router.get('/documents/:type', requireAuth, getDocument);

export default router;