import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Shield, Edit2, Check, X } from 'lucide-react';
import { ALL_TEAMS } from '../constants';
import { getMyTeam } from '../utils/myTeamContext';

interface Message {
  id: string;
  userId: string;
  username: string;
  team: string | null;
  text: string;
  timestamp: number;
}

const STORAGE_KEY = 'fanleague_global_chat';
const USERNAME_KEY = 'fanleague_username';
const USER_ID_KEY = 'fanleague_user_id';
const LAST_IDENTITY_KEY = 'fanleague_last_identity';

// Generate or retrieve persistent user ID
const getUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
};

export const MessageBoard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editUsernameValue, setEditUsernameValue] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageText, setEditMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = getUserId();

  useEffect(() => {
    loadMessages();

    // Load saved identity
    const savedUsername = localStorage.getItem(USERNAME_KEY);
    const lastIdentity = localStorage.getItem(LAST_IDENTITY_KEY);

    if (savedUsername) {
      setUsername(savedUsername);
    }

    // Restore last used identity (username + team combo)
    if (lastIdentity) {
      try {
        const { team } = JSON.parse(lastIdentity);
        setSelectedTeam(team || '');
      } catch (e) {
        // Fallback to My Team
        const myTeam = getMyTeam();
        if (myTeam) {
          setSelectedTeam(myTeam);
        }
      }
    } else {
      // First time - default to My Team if exists
      const myTeam = getMyTeam();
      if (myTeam) {
        setSelectedTeam(myTeam);
      }
    }

    // If no username, start in edit mode
    if (!savedUsername) {
      setIsEditingUsername(true);
      setEditUsernameValue('');
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        // Ensure backwards compatibility
        const messagesWithFields = parsed.map((msg: any) => ({
          ...msg,
          userId: msg.userId || 'legacy-user',
          team: msg.team || null,
        }));
        setMessages(messagesWithFields);
      } catch (error) {
        console.error('Failed to parse messages:', error);
        setMessages([]);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const saveIdentity = (user: string, team: string) => {
    localStorage.setItem(USERNAME_KEY, user);
    localStorage.setItem(LAST_IDENTITY_KEY, JSON.stringify({ username: user, team }));
  };

  const handleSaveUsername = () => {
    const trimmed = editUsernameValue.trim();
    if (trimmed) {
      setUsername(trimmed);
      localStorage.setItem(USERNAME_KEY, trimmed);
      setIsEditingUsername(false);
      saveIdentity(trimmed, selectedTeam);
    }
  };

  const handleCancelEditUsername = () => {
    if (username) {
      // Has existing username, just cancel
      setIsEditingUsername(false);
      setEditUsernameValue('');
    }
    // If no username, stay in edit mode
  };

  const handleIdentityChange = (value: string) => {
    if (value === 'edit') {
      setEditUsernameValue(username);
      setIsEditingUsername(true);
    } else if (value === 'no-team') {
      setSelectedTeam('');
      saveIdentity(username, '');
    } else {
      // Team selection
      setSelectedTeam(value);
      saveIdentity(username, value);
    }
  };

  const handlePost = () => {
    if (!username.trim()) {
      alert('Please set your username first');
      return;
    }

    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }

    // Save identity for next time
    saveIdentity(username.trim(), selectedTeam);

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      userId: userId,
      username: username.trim(),
      team: selectedTeam || null,
      text: messageText.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));

    setMessageText('');
  };

  const handleEditMessage = (msgId: string, currentText: string) => {
    setEditingMessageId(msgId);
    setEditMessageText(currentText);
  };

  const handleSaveEdit = (msgId: string) => {
    if (!editMessageText.trim()) {
      alert('Message cannot be empty');
      return;
    }

    const updatedMessages = messages.map((msg) =>
      msg.id === msgId ? { ...msg, text: editMessageText.trim() } : msg
    );

    setMessages(updatedMessages);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages));
    setEditingMessageId(null);
    setEditMessageText('');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditMessageText('');
  };

  const canEditMessage = (msg: Message): boolean => {
    const isOwn = msg.userId === userId;
    const isRecent = Date.now() - msg.timestamp < 5 * 60 * 1000; // 5 minutes
    const isLatest = messages.length > 0 && messages[messages.length - 1].id === msg.id;
    return isOwn && isRecent && isLatest;
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // Relative timestamps for recent messages
    if (seconds < 60) {
      return 'just now';
    } else if (minutes < 60) {
      return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }

    // Absolute timestamps for older messages
    const date = new Date(timestamp);
    const isThisYear = date.getFullYear() === new Date().getFullYear();

    if (isThisYear) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const getDayLabel = (timestamp: number): string => {
    const msgDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    if (isSameDay(msgDate, today)) return 'Today';
    if (isSameDay(msgDate, yesterday)) return 'Yesterday';
    return 'Earlier';
  };

  // Group messages by day
  const groupedMessages = messages.reduce((groups, msg) => {
    const label = getDayLabel(msg.timestamp);
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(msg);
    return groups;
  }, {} as Record<string, Message[]>);

  const dayOrder = ['Today', 'Yesterday', 'Earlier'];
  const sortedDays = dayOrder.filter((day) => groupedMessages[day]);

  const myTeam = getMyTeam();
  const isMyTeamMessage = (messageTeam: string | null) => {
    return myTeam && messageTeam === myTeam;
  };

  const getIdentityOptions = () => {
    const options = [];
    const myTeam = getMyTeam();

    // No team option
    options.push({ value: 'no-team', label: `${username} (no team)` });

    // My Team option (if exists)
    if (myTeam) {
      options.push({ value: myTeam, label: `${username} repping ${myTeam}` });
    }

    // Other teams (showing a few common ones for quick access)
    const quickTeams = ['Cowboys', 'Eagles', 'Giants', 'Commanders', '49ers', 'Packers', 'Chiefs', 'Bills'];
    quickTeams.forEach((team) => {
      if (team !== myTeam) {
        options.push({ value: team, label: `${username} repping ${team}` });
      }
    });

    // Edit username option
    options.push({ value: 'edit', label: '✏️ Edit username' });

    return options;
  };

  const getCurrentIdentityDisplay = () => {
    if (selectedTeam) {
      return `${username} repping ${selectedTeam}`;
    }
    return `${username} (no team)`;
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
            {myTeam ? `Repping ${myTeam} • ` : ''}Global chat for all FanLeague users
          </p>
        </div>

        {/* Message List - Full height on mobile, fixed height on desktop */}
        <div className="flex-1 bg-slate-900 border-x border-t md:border md:rounded-lg overflow-y-auto p-4 md:mb-4 md:h-[500px] md:flex-none">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-center">
              <div>
                <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-lg mb-1">Be the first to rep your team.</p>
                <p className="text-sm">
                  {username ? 'Start the conversation below.' : "Set your name once — we'll remember it."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {sortedDays.map((day) => (
                <div key={day}>
                  {/* Day Header */}
                  <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm py-2 mb-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {day}
                    </h3>
                  </div>

                  {/* Messages for this day */}
                  <div className="space-y-4">
                    {groupedMessages[day].map((msg) => {
                      const isHighlighted = isMyTeamMessage(msg.team);
                      const isOwnMessage = msg.userId === userId;
                      const isEditing = editingMessageId === msg.id;

                      return (
                        <div
                          key={msg.id}
                          className={`bg-slate-800 border rounded-lg p-4 touch-manipulation ${
                            isHighlighted
                              ? 'border-brand-500/30 border-l-4 border-l-brand-500'
                              : 'border-slate-700'
                          }`}
                        >
                          <div className="flex items-baseline justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-brand-400">{msg.username}</span>
                              {isOwnMessage && (
                                <span className="inline-flex items-center px-1.5 py-0.5 bg-brand-500/20 text-brand-400 text-xs rounded border border-brand-500/30">
                                  You
                                </span>
                              )}
                              {msg.team && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded-full border border-slate-600">
                                  <Shield size={10} />
                                  {msg.team}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {canEditMessage(msg) && !isEditing && (
                                <button
                                  onClick={() => handleEditMessage(msg.id, msg.text)}
                                  className="text-slate-500 hover:text-brand-400 transition-colors"
                                  title="Edit message"
                                >
                                  <Edit2 size={14} />
                                </button>
                              )}
                              <span className="text-xs text-slate-500 whitespace-nowrap">
                                {formatTimestamp(msg.timestamp)}
                              </span>
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editMessageText}
                                onChange={(e) => setEditMessageText(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-brand-500"
                                maxLength={500}
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveEdit(msg.id)}
                                  className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white text-sm rounded flex items-center gap-1"
                                >
                                  <Check size={14} />
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded flex items-center gap-1"
                                >
                                  <X size={14} />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-slate-200 break-words">{msg.text}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Section - Fixed at bottom on mobile, static on desktop */}
        <div className="fixed md:relative bottom-16 md:bottom-0 left-0 right-0 bg-slate-900 border-t border-x md:border md:rounded-lg p-4 flex-shrink-0">
          <div className="flex flex-col gap-3">
            {/* Identity Row - "Posting as" */}
            <div className="flex flex-col md:flex-row gap-2 md:items-center">
              <label className="text-sm text-slate-400 md:w-24 flex-shrink-0">Posting as:</label>
              {isEditingUsername ? (
                <div className="flex gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={editUsernameValue}
                    onChange={(e) => setEditUsernameValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveUsername();
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 min-h-[44px] touch-manipulation"
                    maxLength={20}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveUsername}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg min-h-[44px] touch-manipulation"
                  >
                    <Check size={18} />
                  </button>
                  {username && (
                    <button
                      onClick={handleCancelEditUsername}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg min-h-[44px] touch-manipulation"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ) : (
                <select
                  value={selectedTeam || 'no-team'}
                  onChange={(e) => handleIdentityChange(e.target.value)}
                  className="flex-1 px-4 py-3 md:py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500 min-h-[44px] touch-manipulation"
                >
                  {getIdentityOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Message Input and Post Button Row */}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="What's on your mind?"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePost();
                  }
                }}
                className="flex-1 px-4 py-3 md:py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 min-h-[44px] touch-manipulation"
                maxLength={500}
                disabled={!username}
              />
              <button
                onClick={handlePost}
                disabled={!messageText.trim() || !username}
                className="px-6 py-3 md:py-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px] touch-manipulation whitespace-nowrap"
              >
                <Send size={18} />
                <span>Post</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
