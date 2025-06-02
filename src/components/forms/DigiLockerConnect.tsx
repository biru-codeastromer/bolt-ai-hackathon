import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileCheck, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { digiLockerAPI } from '../../services/api';
import { DigiLockerDocument } from '../../types';

export const DigiLockerConnect: React.FC = () => {
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(false);
  const [documents, setDocuments] = useState<DigiLockerDocument[]>([]);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError('');
      
      // Get authorization QR code
      const { data } = await digiLockerAPI.authorize();
      
      // Open DigiLocker app if on mobile
      if (/Android|iPhone/i.test(navigator.userAgent)) {
        window.location.href = data.authUrl;
      }
      
      // Fetch documents after authorization
      const response = await digiLockerAPI.getDocuments();
      setDocuments(response.data.documents);
    } catch (err) {
      setError(t('digilocker.error'));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDownload = async (docType: string) => {
    try {
      const { data } = await digiLockerAPI.getDocument(docType);
      window.open(data.document.url, '_blank');
    } catch (err) {
      setError(t('digilocker.downloadError'));
    }
  };

  return (
    <div className="space-y-6">
      {documents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="bg-indigo-50 rounded-full p-4 inline-block mb-4">
            <FileCheck className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('digilocker.title')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('digilocker.description')}
          </p>
          <Button
            variant="primary"
            onClick={handleConnect}
            isLoading={isConnecting}
            leftIcon={<FileCheck size={18} />}
          >
            {t('digilocker.connect')}
          </Button>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <h3 className="font-medium text-gray-900">
            {t('digilocker.documents')}
          </h3>
          <div className="grid gap-4">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{doc.name}</h4>
                    <p className="text-sm text-gray-500">
                      {t('digilocker.issuedBy', { issuer: doc.issuer })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {t('digilocker.issuedOn', {
                        date: new Date(doc.issuedOn).toLocaleDateString()
                      })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc.type)}
                    leftIcon={<Download size={16} />}
                  >
                    {t('digilocker.download')}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};