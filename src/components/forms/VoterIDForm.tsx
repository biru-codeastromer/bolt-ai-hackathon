import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, FileCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { VoterIDFormData } from '../../types';
import { AadhaarVerification } from './AadhaarVerification';

const formSteps = ['personal', 'address', 'verification', 'review'] as const;
type FormStep = typeof formSteps[number];

const personalInfoSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  dateOfBirth: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Use DD/MM/YYYY format'),
  gender: z.enum(['male', 'female', 'other'])
});

const addressSchema = z.object({
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter valid 6-digit pincode')
});

export const VoterIDForm: React.FC = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<FormStep>('personal');
  const [formData, setFormData] = useState<Partial<VoterIDFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: FormStep): boolean => {
    try {
      switch (step) {
        case 'personal':
          personalInfoSchema.parse({
            fullName: formData.fullName,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender
          });
          break;
        case 'address':
          addressSchema.parse({
            street: formData.address?.street,
            city: formData.address?.city,
            state: formData.address?.state,
            pincode: formData.address?.pincode
          });
          break;
        case 'verification':
          if (!formData.aadhaarNumber) {
            throw new Error('Aadhaar verification required');
          }
          break;
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            newErrors[err.path.join('.')] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    const currentIndex = formSteps.indexOf(currentStep);
    if (validateStep(currentStep) && currentIndex < formSteps.length - 1) {
      setCurrentStep(formSteps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = formSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(formSteps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (validateStep('review')) {
      // Submit form data
      console.log('Form submitted:', formData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <div className="space-y-4">
            <Input
              label={t('voterID.fullName')}
              value={formData.fullName || ''}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              error={errors.fullName}
            />
            <Input
              label={t('voterID.dateOfBirth')}
              value={formData.dateOfBirth || ''}
              onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
              placeholder="DD/MM/YYYY"
              error={errors.dateOfBirth}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('voterID.gender')}
              </label>
              <div className="flex space-x-4">
                {['male', 'female', 'other'].map(gender => (
                  <Button
                    key={gender}
                    type="button"
                    variant={formData.gender === gender ? 'primary' : 'outline'}
                    onClick={() => setFormData({ ...formData, gender })}
                  >
                    {t(`voterID.gender_${gender}`)}
                  </Button>
                ))}
              </div>
              {errors.gender && (
                <p className="text-sm text-red-600">{errors.gender}</p>
              )}
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-4">
            <Input
              label={t('voterID.street')}
              value={formData.address?.street || ''}
              onChange={e => setFormData({
                ...formData,
                address: { ...formData.address, street: e.target.value }
              })}
              error={errors['address.street']}
            />
            <Input
              label={t('voterID.city')}
              value={formData.address?.city || ''}
              onChange={e => setFormData({
                ...formData,
                address: { ...formData.address, city: e.target.value }
              })}
              error={errors['address.city']}
            />
            <Input
              label={t('voterID.state')}
              value={formData.address?.state || ''}
              onChange={e => setFormData({
                ...formData,
                address: { ...formData.address, state: e.target.value }
              })}
              error={errors['address.state']}
            />
            <Input
              label={t('voterID.pincode')}
              value={formData.address?.pincode || ''}
              onChange={e => setFormData({
                ...formData,
                address: { ...formData.address, pincode: e.target.value }
              })}
              error={errors['address.pincode']}
            />
          </div>
        );

      case 'verification':
        return (
          <AadhaarVerification
            onVerified={(aadhaarNumber) => {
              setFormData({ ...formData, aadhaarNumber });
            }}
          />
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                {t('voterID.personalInfo')}
              </h3>
              <dl className="space-y-1">
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('voterID.fullName')}</dt>
                  <dd className="text-gray-900">{formData.fullName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('voterID.dateOfBirth')}</dt>
                  <dd className="text-gray-900">{formData.dateOfBirth}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('voterID.gender')}</dt>
                  <dd className="text-gray-900">
                    {t(`voterID.gender_${formData.gender}`)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                {t('voterID.address')}
              </h3>
              <dl className="space-y-1">
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('voterID.street')}</dt>
                  <dd className="text-gray-900">{formData.address?.street}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('voterID.city')}</dt>
                  <dd className="text-gray-900">{formData.address?.city}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('voterID.state')}</dt>
                  <dd className="text-gray-900">{formData.address?.state}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">{t('voterID.pincode')}</dt>
                  <dd className="text-gray-900">{formData.address?.pincode}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                {t('voterID.verification')}
              </h3>
              <div className="flex items-center text-green-600">
                <Check size={16} className="mr-2" />
                {t('voterID.aadhaarVerified')}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('voterID.title')}
        </h2>
        <p className="mt-1 text-gray-600">
          {t('voterID.subtitle')}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center">
          {formSteps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    formSteps.indexOf(currentStep) >= index
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {formSteps.indexOf(currentStep) > index ? (
                    <Check size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {t(`voterID.step_${step}`)}
                </span>
              </div>
              {index < formSteps.length - 1 && (
                <div className="flex-1 border-t border-gray-200 mx-4 my-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === formSteps[0]}
          leftIcon={<ChevronLeft size={16} />}
        >
          {t('common.back')}
        </Button>

        <Button
          variant="primary"
          onClick={currentStep === 'review' ? handleSubmit : handleNext}
          rightIcon={currentStep === 'review' ? <FileCheck size={16} /> : <ChevronRight size={16} />}
        >
          {currentStep === 'review'
            ? t('voterID.submit')
            : t('common.next')}
        </Button>
      </div>
    </div>
  );
};