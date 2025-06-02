import React, { useRef, useEffect } from 'react';
import { Message } from '../../types';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [message]);

  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={twMerge(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={twMerge(
          "max-w-[80%] sm:max-w-[70%] rounded-lg px-4 py-3 shadow-sm",
          isUser
            ? "bg-indigo-600 text-white rounded-br-none"
            : "bg-gray-100 text-gray-800 rounded-bl-none"
        )}
      >
        <div className="text-sm sm:text-base whitespace-pre-wrap break-words">
          {message.content}
        </div>
        <div
          className={twMerge(
            "text-xs mt-1",
            isUser ? "text-indigo-200" : "text-gray-500"
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </motion.div>
  );
};