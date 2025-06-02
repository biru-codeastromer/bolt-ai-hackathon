import React, { useEffect, useRef } from 'react';
import { ChatInput } from '../components/chat/ChatInput';
import { ChatMessage } from '../components/chat/ChatMessage';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

const ChatPage: React.FC = () => {
  const { messages, isLoading, sendMessage, loadMessages, clearChat } = useChat();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages on component mount and when authentication state changes
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadMessages();
    }
  }, [loadMessages, isAuthenticated, authLoading]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!isAuthenticated) {
      console.error('Cannot send message: Not authenticated');
      return;
    }
    await sendMessage(content);
  };

  const handleClearChat = async () => {
    if (!isAuthenticated) {
      console.error('Cannot clear chat: Not authenticated');
      return;
    }
    if (window.confirm('Are you sure you want to clear all messages?')) {
      await clearChat();
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to use the chat feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex items-center justify-between bg-white p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Chat with CiviAI</h1>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            leftIcon={<Trash2 size={16} />}
          >
            Clear Chat
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-md"
            >
              <div className="bg-indigo-100 p-4 rounded-full inline-block mb-4">
                <svg
                  className="w-12 h-12 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to CiviAI</h2>
              <p className="text-gray-600 mb-4">
                Ask questions about civic services, community resources, or government programs.
              </p>
              <p className="text-gray-500 text-sm">
                Your conversation history is private and stored securely.
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatPage;