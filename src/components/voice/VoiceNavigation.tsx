import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const VoiceNavigation: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript.toLowerCase())
          .join(' ');

        // Handle navigation commands
        if (transcript.includes('go to chat') || transcript.includes('चैट पर जाएं')) {
          navigate('/');
        } else if (transcript.includes('go to forms') || transcript.includes('फॉर्म पर जाएं')) {
          navigate('/forms');
        }
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [i18n.language, navigate]);

  const toggleVoiceNavigation = () => {
    if (!recognition) {
      alert(t('accessibility.voiceNotSupported'));
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <Button
      variant={isListening ? 'primary' : 'outline'}
      size="sm"
      onClick={toggleVoiceNavigation}
      aria-label={t('accessibility.voiceNavigation')}
      leftIcon={isListening ? <MicOff size={16} /> : <Mic size={16} />}
    >
      {t('accessibility.voiceControl')}
    </Button>
  );
};