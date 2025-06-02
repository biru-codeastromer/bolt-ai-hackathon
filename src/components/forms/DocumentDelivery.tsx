import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, Send, Share2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface DocumentDeliveryProps {
  documentUrl: string;
  fileName: string;
}

export const DocumentDelivery: React.FC<DocumentDeliveryProps> = ({
  documentUrl,
  fileName,
}) => {
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = () => {
    window.open(documentUrl, '_blank');
  };

  const handleWhatsAppShare = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber, documentUrl }),
      });

      if (!response.ok) throw new Error('Failed to send WhatsApp message');
      
      setPhoneNumber('');
    } catch (err) {
      setError(t('delivery.whatsappError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSMSShare = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber, documentUrl }),
      });

      if (!response.ok) throw new Error('Failed to send SMS');
      
      setPhoneNumber('');
    } catch (err) {
      setError(t('delivery.smsError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('delivery.title')}
        </h3>

        <div className="space-y-4">
          <Button
            variant="primary"
            onClick={handleDownload}
            fullWidth
            leftIcon={<Download size={18} />}
          >
            {t('delivery.download')} {fileName}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {t('delivery.or')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              label={t('delivery.phoneNumber')}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              error={error}
            />

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleWhatsAppShare}
                isLoading={isLoading}
                disabled={!phoneNumber}
                leftIcon={<Send size={16} />}
              >
                {t('delivery.whatsapp')}
              </Button>

              <Button
                variant="outline"
                onClick={handleSMSShare}
                isLoading={isLoading}
                disabled={!phoneNumber}
                leftIcon={<Share2 size={16} />}
              >
                {t('delivery.sms')}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};