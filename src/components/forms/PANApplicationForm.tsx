import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileCheck, Upload, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { digiLockerAPI } from '../../services/api';

interface PANFormData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  aadhaarNumber: string;
  fatherName: string;
  email: string;
  mobile: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  incomeProof?: File;
}

export const PANApplicationForm: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<PANFormData>({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    aadhaarNumber: '',
    fatherName: '',
    email: '',
    mobile: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [gstin, setGstin] = useState('');
  const [gstinDetails, setGstinDetails] = useState<any>(null);

  const handleDigiLockerFetch = async () => {
    try {
      setIsLoading(true);
      const { data } = await digiLockerAPI.getDocuments();
      const aadhaarDoc = data.documents.find(doc => doc.type === 'aadhaar');
      
      if (aadhaarDoc) {
        // Auto-fill form with DigiLocker data
        setFormData(prev => ({
          ...prev,
          fullName: aadhaarDoc.name,
          dateOfBirth: aadhaarDoc.dob,
          gender: aadhaarDoc.gender,
          aadhaarNumber: aadhaarDoc.number,
          address: {
            street: aadhaarDoc.address.street,
            city: aadhaarDoc.address.city,
            state: aadhaarDoc.address.state,
            pincode: aadhaarDoc.address.pincode
          }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch DigiLocker documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGSTINLookup = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/gstin/validate/${gstin}`);
      const data = await response.json();
      setGstinDetails(data);
    } catch (error) {
      console.error('Failed to validate GSTIN:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('pan.title')}
          </h2>
          <Button
            variant="outline"
            onClick={handleDigiLockerFetch}
            leftIcon={<FileCheck size={18} />}
            isLoading={isLoading}
          >
            {t('pan.fetchFromDigiLocker')}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('pan.personalInfo')}
            </h3>
            
            <Input
              label={t('pan.fullName')}
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('pan.dateOfBirth')}
                type="date"
                value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pan.gender')}
                </label>
                <div className="flex space-x-4">
                  {['male', 'female', 'other'].map(gender => (
                    <Button
                      key={gender}
                      type="button"
                      variant={formData.gender === gender ? 'primary' : 'outline'}
                      onClick={() => setFormData({ ...formData, gender })}
                    >
                      {t(`pan.gender_${gender}`)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('pan.contactInfo')}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('pan.email')}
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Input
                label={t('pan.mobile')}
                type="tel"
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                required
              />
            </div>
          </div>

          {/* GSTIN Validation */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('pan.gstinValidation')}
            </h3>
            
            <div className="flex space-x-4">
              <Input
                label={t('pan.gstin')}
                value={gstin}
                onChange={e => setGstin(e.target.value)}
                className="flex-1"
              />
              
              <Button
                type="button"
                variant="outline"
                onClick={handleGSTINLookup}
                isLoading={isLoading}
                leftIcon={<Search size={18} />}
                className="self-end"
              >
                {t('pan.validate')}
              </Button>
            </div>

            {gstinDetails && (
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm">{JSON.stringify(gstinDetails, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Income Proof Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('pan.incomeProof')}
            </h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="income-proof"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => setFormData({ 
                  ...formData, 
                  incomeProof: e.target.files?.[0] 
                })}
              />
              
              <label
                htmlFor="income-proof"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {formData.incomeProof
                    ? formData.incomeProof.name
                    : t('pan.uploadInstructions')}
                </p>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            leftIcon={<FileCheck size={18} />}
          >
            {t('pan.submit')}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};