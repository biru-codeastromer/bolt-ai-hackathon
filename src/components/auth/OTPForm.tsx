import React, { useState } from 'react';
import { Mail, Smartphone, Check, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AuthMethod } from '../../types';
import { motion } from 'framer-motion';

interface OTPFormProps {
  onSendOTP: (type: AuthMethod, value: string) => Promise<void>;
  onVerifyOTP: (type: AuthMethod, value: string, otp: string) => Promise<void>;
}

export const OTPForm: React.FC<OTPFormProps> = ({ onSendOTP, onVerifyOTP }) => {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [value, setValue] = useState('');
  const [otp, setOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setIsLoading(true);
      await onSendOTP(authMethod, value);
      setOtpSent(true);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setIsLoading(true);
      await onVerifyOTP(authMethod, value, otp);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <motion.div
        key={otpSent ? 'verify' : 'send'}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white p-8 rounded-lg shadow-lg"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {otpSent ? 'Enter Verification Code' : 'Sign In / Sign Up'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {otpSent 
              ? `We've sent a verification code to your ${authMethod}` 
              : 'Use your email or phone number to continue'}
          </p>
        </div>
        
        {!otpSent ? (
          <form onSubmit={handleSendOTP}>
            <div className="mb-6">
              <div className="flex gap-3 mb-4">
                <Button
                  type="button"
                  variant={authMethod === 'email' ? 'primary' : 'outline'}
                  onClick={() => setAuthMethod('email')}
                  fullWidth
                  leftIcon={<Mail size={16} />}
                >
                  Email
                </Button>
                <Button
                  type="button"
                  variant={authMethod === 'phone' ? 'primary' : 'outline'}
                  onClick={() => setAuthMethod('phone')}
                  fullWidth
                  leftIcon={<Smartphone size={16} />}
                >
                  Phone
                </Button>
              </div>
              
              <Input
                label={authMethod === 'email' ? 'Email address' : 'Phone number'}
                type={authMethod === 'email' ? 'email' : 'tel'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={authMethod === 'email' ? 'you@example.com' : '+1 (555) 000-0000'}
                leftIcon={authMethod === 'email' ? <Mail size={16} className="text-gray-400" /> : <Smartphone size={16} className="text-gray-400" />}
                required
                fullWidth
                autoFocus
                error={error}
              />
            </div>
            
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              isLoading={isLoading}
              rightIcon={<ArrowRight size={16} />}
            >
              Continue
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-6">
              <Input
                label="Verification Code"
                type="text"
                value={otp}
                onChange={(e) => setOTP(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                fullWidth
                autoFocus
                error={error}
              />
              
              <p className="mt-2 text-sm text-gray-500">
                Didn't receive a code?{' '}
                <button
                  type="button"
                  onClick={() => handleSendOTP}
                  className="text-indigo-600 hover:text-indigo-500"
                  disabled={isLoading}
                >
                  Resend
                </button>
              </p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                isLoading={isLoading}
                leftIcon={<Check size={16} />}
              >
                Verify
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                fullWidth 
                onClick={() => setOtpSent(false)}
                disabled={isLoading}
              >
                Back
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};