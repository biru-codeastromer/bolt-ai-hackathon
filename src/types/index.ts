import { z } from 'zod';

// User-related types
export interface User {
  id: string;
  email?: string;
  phone?: string;
  aadhaarLastFour?: string;
  isAadhaarVerified?: boolean;
  isAdmin?: boolean;
}

// Authentication types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AuthMethod = 'email' | 'phone';

export interface OTPRequest {
  type: AuthMethod;
  value: string;
}

export interface OTPVerification extends OTPRequest {
  otp: string;
}

// Chat types
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

// Forms types
export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';
  label: string;
  required: boolean;
  options?: string[];
  validation?: z.ZodType<any>;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: string;
}

// Voter ID Form types
export interface VoterIDFormData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  aadhaarNumber: string;
  photo?: File;
}

// eKYC types
export interface EKYCRequest {
  aadhaarNumber: string;
}

export interface EKYCResponse {
  status: string;
  hash: string;
  lastFour: string;
}

// DigiLocker types
export interface DigiLockerDocument {
  id: string;
  type: string;
  name: string;
  issuer: string;
  issuedOn: string;
  url: string;
}

// Add Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}