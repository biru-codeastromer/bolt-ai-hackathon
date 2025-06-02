import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

// In-memory storage for forms and submissions
// In a real app, these would be in a database
interface Form {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: Date;
}

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';
  label: string;
  required: boolean;
  options?: string[]; // For select, radio, etc.
}

interface FormSubmission {
  id: string;
  formId: string;
  userId: string;
  data: Record<string, any>;
  submittedAt: Date;
}

const forms: Record<string, Form> = {};
const submissions: Record<string, FormSubmission[]> = {};

// Schema validation
const formSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  fields: z.array(z.object({
    type: z.enum(['text', 'textarea', 'select', 'checkbox', 'radio', 'date']),
    label: z.string().min(1).max(100),
    required: z.boolean(),
    options: z.array(z.string()).optional()
  })).min(1)
});

const submissionSchema = z.object({
  formId: z.string(),
  data: z.record(z.any())
});

// Controller functions
export const getForms = (_req: Request, res: Response) => {
  const formsList = Object.values(forms);
  
  res.status(200).json({
    status: 'success',
    data: { forms: formsList }
  });
};

export const getForm = (req: Request, res: Response) => {
  const formId = req.params.id;
  const form = forms[formId];
  
  if (!form) {
    return res.status(404).json({ 
      status: 'error', 
      message: 'Form not found' 
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: { form }
  });
};

export const createForm = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Unauthorized' 
      });
    }
    
    const validatedData = formSchema.parse(req.body);
    
    const formId = Date.now().toString();
    
    // Create form with fields
    const form: Form = {
      id: formId,
      title: validatedData.title,
      description: validatedData.description,
      fields: validatedData.fields.map((field, index) => ({
        id: `field_${index}_${Date.now()}`,
        ...field
      })),
      createdAt: new Date()
    };
    
    // Save form
    forms[formId] = form;
    
    res.status(201).json({
      status: 'success',
      data: { form }
    });
  } catch (error) {
    next(error);
  }
};

export const submitForm = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Unauthorized' 
      });
    }
    
    const validatedData = submissionSchema.parse(req.body);
    const { formId, data } = validatedData;
    
    // Check if form exists
    if (!forms[formId]) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Form not found' 
      });
    }
    
    // Create submission
    const submission: FormSubmission = {
      id: Date.now().toString(),
      formId,
      userId,
      data,
      submittedAt: new Date()
    };
    
    // Initialize submissions array if it doesn't exist
    if (!submissions[formId]) {
      submissions[formId] = [];
    }
    
    // Save submission
    submissions[formId].push(submission);
    
    res.status(201).json({
      status: 'success',
      data: { submission }
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissions = (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const formId = req.params.formId;
  
  if (!userId) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Unauthorized' 
    });
  }
  
  // Check if form exists
  if (!forms[formId]) {
    return res.status(404).json({ 
      status: 'error', 
      message: 'Form not found' 
    });
  }
  
  // Get submissions for the form
  const formSubmissions = submissions[formId] || [];
  
  // Filter submissions by user ID (for admin, you might remove this filter)
  const userSubmissions = formSubmissions.filter(sub => sub.userId === userId);
  
  res.status(200).json({
    status: 'success',
    data: { submissions: userSubmissions }
  });
};