import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AppError } from '../middleware/error.middleware';
import { emailService } from '../services/email.service';

// Simulate database with in-memory storage
const users: Record<string, any> = {};
const otpStore: Record<string, { otp: string, expires: Date }> = {};

// Schema validation
const sendOTPSchema = z.object({
  type: z.enum(['email', 'phone']),
  value: z.string().min(5)
});

const verifyOTPSchema = z.object({
  type: z.enum(['email', 'phone']),
  value: z.string().min(5),
  otp: z.string().length(6)
});

// Helper functions
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (userId: string, userInfo: any): string => {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error('JWT secret not configured');
  }
  
  return jwt.sign(
    { id: userId, ...userInfo },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Send notification based on type
const sendNotification = async (type: 'email' | 'phone', target: string, otp: string): Promise<void> => {
  try {
    if (type === 'email') {
      await emailService.sendOTP(target, otp);
    } else if (type === 'phone' && process.env.TWILIO_ACCOUNT_SID) {
      const twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      
      await twilioClient.messages.create({
        body: `Your CiviAI verification code is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: target
      });
    } else {
      throw new Error(`Notification type ${type} not configured`);
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw new Error('Failed to send verification code');
  }
};

// Controller functions
export const sendOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = sendOTPSchema.parse(req.body);
    const { type, value } = validatedData;
    
    // Generate OTP
    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    
    // Store OTP
    const otpKey = `${type}:${value}`;
    otpStore[otpKey] = { otp, expires };
    
    // Send OTP via email or SMS
    await sendNotification(type, value, otp);
    
    res.status(200).json({ 
      status: 'success', 
      message: `OTP sent to your ${type}`,
      expiresAt: expires
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = verifyOTPSchema.parse(req.body);
    const { type, value, otp } = validatedData;
    
    const otpKey = `${type}:${value}`;
    const storedOTP = otpStore[otpKey];
    
    // Check if OTP exists and is valid
    if (!storedOTP || storedOTP.otp !== otp) {
      const error = new Error('Invalid OTP') as AppError;
      error.statusCode = 401;
      throw error;
    }
    
    // Check if OTP is expired
    if (new Date() > storedOTP.expires) {
      const error = new Error('OTP expired') as AppError;
      error.statusCode = 401;
      throw error;
    }
    
    // Clear OTP from store
    delete otpStore[otpKey];
    
    // Create or get user
    let userId = Object.keys(users).find(id => 
      users[id][type] === value
    );
    
    if (!userId) {
      userId = Date.now().toString();
      users[userId] = { id: userId, [type]: value };
    }
    
    // Generate JWT token
    const token = generateToken(userId, { [type]: value });
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict'
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Authentication successful',
      data: {
        user: {
          id: userId,
          [type]: value
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

export const getMe = (req: Request, res: Response) => {
  // @ts-ignore - user is attached by auth middleware
  const userId = req.user?.id;
  
  if (!userId || !users[userId]) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user: users[userId]
    }
  });
};