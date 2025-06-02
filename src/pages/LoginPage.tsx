import React from 'react';
import { Navigate } from 'react-router-dom';
import { OTPForm } from '../components/auth/OTPForm';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { AuthMethod } from '../types';
import { Button } from '../components/ui/Button';
import { Shield } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading, sendOTP, verifyOTP, bypassAuth } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" replace />;
  }

  const handleSendOTP = async (type: AuthMethod, value: string) => {
    await sendOTP(type, value);
  };

  const handleVerifyOTP = async (type: AuthMethod, value: string, otp: string) => {
    await verifyOTP(type, value, otp);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50">
      <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">
            CiviAI
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your AI assistant for civic engagement
          </p>

          <div className="flex justify-center mb-8">
            <Button
              variant="outline"
              onClick={bypassAuth}
              leftIcon={<Shield size={18} />}
              className="bg-white"
            >
              Access as Admin
            </Button>
          </div>
        </motion.div>

        <OTPForm 
          onSendOTP={handleSendOTP}
          onVerifyOTP={handleVerifyOTP}
        />
      </div>
    </div>
  );
};

export default LoginPage;