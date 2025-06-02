import React, { createContext, useContext, useState, useCallback } from 'react';
import { Message, ChatState } from '../types';
import { chatAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface ChatContextType extends ChatState {
  sendMessage: (content: string) => Promise<void>;
  loadMessages: () => Promise<void>;
  clearChat: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
  });

  const loadMessages = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const { data } = await chatAPI.getMessages();
      setState({
        messages: data.messages,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isAuthenticated, authLoading]);

  const sendMessage = useCallback(async (content: string) => {
    if (!isAuthenticated || authLoading) {
      console.error('Cannot send message: Not authenticated');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Optimistic update
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        content,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, tempUserMessage],
      }));
      
      // Send to API
      const { data } = await chatAPI.sendMessage(content);
      
      // Update with real data
      setState(prev => {
        // Remove temporary message
        const filteredMessages = prev.messages.filter(
          msg => msg.id !== tempUserMessage.id
        );
        
        // Add actual messages from the API
        return {
          messages: [
            ...filteredMessages, 
            data.data.userMessage,
            data.data.aiMessage
          ],
          isLoading: false,
        };
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isAuthenticated, authLoading]);

  const clearChat = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      console.error('Cannot clear chat: Not authenticated');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await chatAPI.clearHistory();
      setState({
        messages: [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isAuthenticated, authLoading]);

  return (
    <ChatContext.Provider
      value={{
        ...state,
        sendMessage,
        loadMessages,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};