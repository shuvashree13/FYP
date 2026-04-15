'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../../lib/api';
import DoctorLayout from '../../../components/DoctorLayout';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import ICONS from '../../../constants/icons';

export default function DoctorChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patient');

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'doctor') {
        router.push('/');
      } else {
        fetchChats();
        if (patientId) {
          openChat(patientId);
        }
      }
    }
  }, [user, loading, router, patientId]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  // Auto-refresh messages every 5 seconds
  useEffect(() => {
    if (selectedChat) {
      const interval = setInterval(() => {
        refreshCurrentChat();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChat?._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const { data } = await api.get('/chats');
      setChats(data.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  const openChat = async (patientIdParam) => {
    try {
      const { data } = await api.get(`/chats/${patientIdParam}`);
      setSelectedChat(data.data);
      markAsRead(data.data._id);
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Failed to open chat');
    }
  };

  const refreshCurrentChat = async () => {
    if (!selectedChat) return;
    try {
      const { data } = await api.get(`/chats/${selectedChat.patient._id}`);
      setSelectedChat(data.data);
    } catch (error) {
      console.error('Error refreshing chat:', error);
    }
  };

  const markAsRead = async (chatId) => {
    try {
      await api.put(`/chats/${chatId}/read`);
      fetchChats();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    setSending(true);
    try {
      const { data } = await api.post(`/chats/${selectedChat._id}/messages`, {
        message: message.trim()
      });
      setSelectedChat(data.data);
      setMessage('');
      fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading || loadingChats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lightBlue">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'doctor') {
    return null;
  }

  return (
    <DoctorLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <div className="card p-0 overflow-hidden">
              <div className="p-4 bg-primary text-white">
                <h2 className="font-semibold">Conversations</h2>
              </div>

              <div className="divide-y max-h-[600px] overflow-y-auto">
                {chats.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No conversations yet
                  </div>
                ) : (
                  chats.map((chat) => (
                    <button
                      key={chat._id}
                      onClick={() => {
                        setSelectedChat(chat);
                        markAsRead(chat._id);
                      }}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedChat?._id === chat._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white overflow-hidden flex-shrink-0">
                          {chat.patient?.avatar ? (
                            <img
                              src={chat.patient.avatar}
                              alt={chat.patient.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{ICONS.PATIENT}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900 truncate">
                              {chat.patient?.name}
                            </p>
                            {chat.unreadCount.doctor > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {chat.unreadCount.doctor}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {chat.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedChat ? (
              <div className="card p-0 overflow-hidden flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="p-4 bg-primary text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                    {selectedChat.patient?.avatar ? (
                      <img
                        src={selectedChat.patient.avatar}
                        alt={selectedChat.patient.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">{ICONS.PATIENT}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedChat.patient?.name}</h3>
                    <p className="text-xs opacity-90">Patient</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {selectedChat.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    selectedChat.messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.sender._id === user._id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            msg.sender._id === user._id
                              ? 'bg-primary text-white'
                              : 'bg-white text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender._id === user._id
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            {format(new Date(msg.timestamp), 'hh:mm a')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 bg-white border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={sending || !message.trim()}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="card h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">{ICONS.CHAT}</div>
                  <p className="text-xl">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}