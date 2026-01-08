import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send } from 'lucide-react';

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: number;
}

const STORAGE_KEY = 'fanleague_global_chat';

export const MessageBoard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState('');
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      setMessages(parsed);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePost = () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      username: username.trim(),
      text: messageText.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));

    setMessageText('');
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 md:p-8">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-0 md:mb-6 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="text-brand-500" size={32} />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
              MESSAGE BOARD
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Global chat for all FanLeague users
          </p>
        </div>

        {/* Message List - Full height on mobile, fixed height on desktop */}
        <div className="flex-1 bg-slate-900 border-x border-t md:border md:rounded-lg overflow-y-auto p-4 md:mb-4 md:h-[500px] md:flex-none">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-center">
              <div>
                <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p>No messages yet. Be the first to post!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-4 touch-manipulation"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <span className="font-bold text-brand-400">
                      {msg.username}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-slate-200 break-words">{msg.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Section - Fixed at bottom on mobile, static on desktop */}
        <div className="fixed md:relative bottom-16 md:bottom-0 left-0 right-0 bg-slate-900 border-t border-x md:border md:rounded-lg p-4 flex-shrink-0">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-3 md:py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 md:w-48 min-h-[44px] touch-manipulation"
              maxLength={20}
            />
            <input
              type="text"
              placeholder="Type your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handlePost();
                }
              }}
              className="flex-1 px-4 py-3 md:py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 min-h-[44px] touch-manipulation"
              maxLength={500}
            />
            <button
              onClick={handlePost}
              className="px-6 py-3 md:py-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px] touch-manipulation"
            >
              <Send size={18} />
              <span>Post</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
