import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface ConsentBannerProps {
  onAccept: (limitedPurpose: boolean) => void;
  onDecline: () => void;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({ onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [limitedPurpose, setLimitedPurpose] = useState(true);

  useEffect(() => {
    const hasConsent = localStorage.getItem('privacyConsent');
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('privacyConsent', JSON.stringify({
      accepted: true,
      limitedPurpose,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
    onAccept(limitedPurpose);
  };

  const handleDecline = () => {
    setIsVisible(false);
    onDecline();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50"
        >
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-indigo-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Privacy & Data Protection Notice
                  </h2>
                </div>
                
                <p className="text-gray-600 mb-4">
                  We value your privacy and comply with the Digital Personal Data Protection Act 2023. 
                  We collect and process your data to provide our services. Your data is encrypted and 
                  automatically deleted after 90 days.
                </p>

                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="limitedPurpose"
                    checked={limitedPurpose}
                    onChange={(e) => setLimitedPurpose(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="limitedPurpose" className="ml-2 text-sm text-gray-600">
                    Enable Purpose Limited Processing (recommended)
                  </label>
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    variant="primary"
                    onClick={handleAccept}
                    leftIcon={<Shield size={16} />}
                  >
                    Accept & Continue
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDecline}
                  >
                    Decline
                  </Button>
                </div>
              </div>

              <button
                onClick={handleDecline}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};