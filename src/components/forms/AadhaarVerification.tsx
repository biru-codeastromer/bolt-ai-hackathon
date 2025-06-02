import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Send, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ekycAPI } from '../../services/api';

interface AadhaarVerificationProps {
  onVerified: (aadhaarNumber: string) => void;
}

export const AadhaarVerification: React.FC<AadhaarVerificationProps> = ({ onVerified }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOTP] = useState('');
  const [hash, setHash] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await ekycAPI.sendOTP(aadhaarNumber);
      setHash(response.data.hash);
      setStep('otp');
    } catch (err) {
      setError(t('voterID.aadhaarError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setIsLoading(true);
      setError('');
      await ekycAPI.verifyOTP(aadhaarNumber, otp, hash);
      onVerified(aadhaarNumber);
    } catch (err) {
      setError(t('voterID.otpError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {step === 'input' ? (
          <div className="space-y-4">
            <Input
              label={t('voterID.aadhaarNumber')}
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value)}
              placeholder="XXXX XXXX XXXX"
              maxLength={12}
              error={error}
            />
            <Button
              variant="primary"
              onClick={handleSendOTP}
              isLoading={isLoading}
              disabled={aadhaarNumber.length !== 12}
              fullWidth
              rightIcon={<Send size={16} />}
            >
              {t('voterID.sendOTP')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label={t('voterID.enterOTP')}
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              placeholder="XXXXXX"
              maxLength={6}
              error={error}
            />
            <Button
              variant="primary"
              onClick={handleVerifyOTP}
              isLoading={isLoading}
              disabled={otp.length !== 6}
              fullWidth
              rightIcon={<Check size={16} />}
            >
              {t('voterID.verifyOTP')}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};