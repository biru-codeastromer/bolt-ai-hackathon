import express from 'express';
import { 
  getForms, 
  getForm, 
  createForm, 
  submitForm, 
  getSubmissions 
} from '../controllers/forms.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getForms);
router.get('/:id', getForm);

// Protected routes
router.post('/', requireAuth, createForm);
router.post('/submit', requireAuth, submitForm);
router.get('/:formId/submissions', requireAuth, getSubmissions);

export default router;