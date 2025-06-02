import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

// In-memory storage for messages
// In a real app, this would be in a database
interface Message {
  id: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

const conversations: Record<string, Message[]> = {};

// Schema validation
const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000)
});

// Mock AI service
const generateAIResponse = async (message: string): Promise<string> => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simple responses based on user input
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    return "Hello! How can I assist you today?";
  }
  
  if (message.toLowerCase().includes('help')) {
    return "I'm here to help! You can ask me questions about civic matters, government services, or community resources.";
  }
  
  if (message.toLowerCase().includes('thank')) {
    return "You're welcome! Is there anything else you'd like to know?";
  }
  
  // Default response
  return "Thank you for your message. As CiviAI, I'm here to help with civic matters. How can I assist you further?";
};

// Controller functions
export const getMessages = (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Unauthorized' 
    });
  }
  
  // Get or initialize user's conversation
  const userMessages = conversations[userId] || [];
  
  res.status(200).json({
    status: 'success',
    data: { messages: userMessages }
  });
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Unauthorized' 
      });
    }
    
    const validatedData = sendMessageSchema.parse(req.body);
    const { content } = validatedData;
    
    // Initialize conversation if it doesn't exist
    if (!conversations[userId]) {
      conversations[userId] = [];
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      userId,
      content,
      role: 'user',
      createdAt: new Date()
    };
    
    conversations[userId].push(userMessage);
    
    // Generate AI response
    const aiResponseContent = await generateAIResponse(content);
    
    // Add AI message
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      userId,
      content: aiResponseContent,
      role: 'assistant',
      createdAt: new Date()
    };
    
    conversations[userId].push(aiMessage);
    
    res.status(200).json({
      status: 'success',
      data: {
        userMessage,
        aiMessage
      }
    });
  } catch (error) {
    next(error);
  }
};

export const clearHistory = (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Unauthorized' 
    });
  }
  
  // Clear user's conversation
  conversations[userId] = [];
  
  res.status(200).json({
    status: 'success',
    message: 'Conversation history cleared'
  });
};