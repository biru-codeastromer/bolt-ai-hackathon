import React, { useState, useEffect, useCallback } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { t, i18n } = useTranslation();

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        setMessage(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [i18n.language]);

  const toggleListening = useCallback(() => {
    if (!recognition) {
      alert(t('chat.browserNotSupported'));
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  }, [recognition, isListening, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    if (isListening) {
      recognition?.stop();
    }
    
    onSendMessage(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-t border-gray-200 p-4"
    >
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <TextArea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.messagePlaceholder')}
          className="flex-1"
          rows={2}
          disabled={isLoading}
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={isListening ? 'listening' : 'not-listening'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              type="button"
              variant={isListening ? 'danger' : 'outline'}
              onClick={toggleListening}
              disabled={isLoading}
              className="mr-2"
              aria-label={isListening ? t('chat.stopListening') : t('chat.startListening')}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
          </motion.div>
        </AnimatePresence>

        <Button 
          type="submit" 
          variant="primary"
          isLoading={isLoading}
          disabled={!message.trim() || isLoading}
          className="self-end"
          aria-label={t('chat.send')}
        >
          <Send size={18} />
        </Button>
      </form>
    </motion.div>
  );
};