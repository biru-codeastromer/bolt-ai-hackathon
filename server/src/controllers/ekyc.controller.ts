import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto-js';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

// Validation schemas
const aadhaarSchema = z.object({
  aadhaarNumber: z.string().length(12).regex(/^\d+$/)
});

const verifySchema = z.object({
  aadhaarNumber: z.string().length(12).regex(/^\d+$/),
  otp: z.string().length(6).regex(/^\d+$/),
  hash: z.string()
});

// Mock UIDAI API integration
const generateHash = (aadhaarNumber: string): string => {
  return crypto.SHA256(aadhaarNumber + process.env.UIDAI_SECRET).toString();
};

const mockUidaiApi = async (aadhaarNumber: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return '123456'; // Mock OTP
};

export const sendOTP = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = aadhaarSchema.parse(req.body);
    const { aadhaarNumber } = validatedData;

    // Generate hash for verification
    const hash = generateHash(aadhaarNumber);

    // Send OTP via UIDAI API (mocked)
    await mockUidaiApi(aadhaarNumber);

    res.status(200).json({
      status: 'success',
      message: 'OTP sent successfully',
      data: { hash }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = verifySchema.parse(req.body);
    const { aadhaarNumber, otp, hash } = validatedData;

    // Verify hash
    const expectedHash = generateHash(aadhaarNumber);
    if (hash !== expectedHash) {
      const error = new Error('Invalid verification request') as AppError;
      error.statusCode = 400;
      throw error;
    }

    // Mock OTP verification (in production, verify with UIDAI)
    if (otp !== '123456') {
      const error = new Error('Invalid OTP') as AppError;
      error.statusCode = 401;
      throw error;
    }

    // Update user with verified Aadhaar status
    if (req.user) {
      req.user.aadhaarLastFour = aadhaarNumber.slice(-4);
      req.user.isAadhaarVerified = true;
    }

    res.status(200).json({
      status: 'success',
      message: 'Aadhaar verified successfully',
      data: {
        lastFour: aadhaarNumber.slice(-4)
      }
    });
  } catch (error) {
    next(error);
  }
};