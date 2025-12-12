import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient'; // Pastikan path ini benar
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  X, 
  Minimize2, 
  Send, 
  Bot, 
  User,
  RefreshCw,
  AlertCircle,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBotBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  
  // State untuk nama user dari database
  const [dbUsername, setDbUsername] = useState<string>("Teman");

  const STORAGE_KEY = 'skillup_chat_history';

  // --- Ambil Nama dari Tabel Profiles ---
  useEffect(() => {
    const fetchProfileName = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        let displayName = session.user.user_metadata?.full_name;

        if (!displayName) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            displayName = profile.full_name || profile.username;
          }
        }

        if (!displayName && session.user.email) {
          displayName = session.user.email.split('@')[0];
        }

        setDbUsername(displayName || "Teman");
      }
    };

    fetchProfileName();
  }, []);

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY);
      if (savedMessages) {
        return JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error("Gagal memuat riwayat chat:", error);
    }
    
    return [
      {
        id: 1,
        text: "Halo! Saya SkillUp AI Assistant. Saya di sini untuk membantu Anda mengembangkan soft skills seperti komunikasi, leadership, dan kerja tim. Ada yang bisa saya bantu hari ini?",
        sender: 'bot',
        timestamp: new Date()
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // --- Efek Sapaan ---
  useEffect(() => {
    if (!isOpen && messages.length <= 1) {
      const greetingTimer = setTimeout(() => {
        setShowGreeting(true);
      }, 1000);

      const hideTimer = setTimeout(() => {
        setShowGreeting(false);
      }, 9000); 

      return () => {
        clearTimeout(greetingTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      checkBackendConnection();
      setShowGreeting(false);
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const checkBackendConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
      if (response.data.status === 'OK') {
        setConnectionStatus('connected');
        setError(null);
      } else {
        setConnectionStatus('disconnected');
        setError('Backend tidak responsif');
      }
    } catch (err: any) {
      setConnectionStatus('disconnected');
      setError('Backend tidak terhubung.');
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setError(null);
    setShowGreeting(false);

    setTimeout(() => inputRef.current?.focus(), 100);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/chat`, {
        message: inputText,
        sessionId: 'skillup-session'
      });

      let botResponse = '';
      if (response.data.success) {
        botResponse = response.data.response;
      } else if (response.data.fallbackResponse) {
        botResponse = response.data.fallbackResponse;
        setError(`Menggunakan fallback: ${response.data.error}`);
      } else {
        throw new Error(response.data.error || 'Unknown error');
      }

      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
    } catch (err: any) {
      console.error('Error sending message:', err);
      let errorMessage = 'Maaf, terjadi kesalahan.';
      let detailedError = err.message;
      if (err.response?.data) {
        detailedError = err.response.data.error || err.response.data.message;
      }
      const fallbackMessage: Message = {
        id: messages.length + 2,
        text: `Saya mengalami kesalahan: "${detailedError}".`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setError(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (topic: string) => {
    const quickMessages: Record<string, string> = {
      'communication': 'Bagaimana cara meningkatkan kemampuan komunikasi?',
      'leadership': 'Apa karakteristik pemimpin efektif?',
      'time': 'Tips manajemen waktu',
      'teamwork': 'Cara membangun kerjasama tim solid'
    };
    setInputText(quickMessages[topic] || topic);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const clearChat = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([{
        id: 1,
        text: `Halo, ${dbUsername}! Percakapan baru dimulai. Ada yang bisa saya bantu?`,
        sender: 'bot',
        timestamp: new Date()
    }]);
    setError(null);
  };

  const formatTime = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const renderWithLinks = (text: string, sender: 'user' | 'bot') => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.substring(lastIndex, match.index));
      parts.push(
        <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 font-semibold underline decoration-2 underline-offset-2 transition-colors mx-1 ${sender === 'user' ? 'text-white decoration-white/50 hover:decoration-white' : 'text-blue-600 decoration-blue-300 hover:text-blue-800 hover:decoration-blue-600'}`}>
          {match[1]} <ExternalLink size={12} />
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) parts.push(text.substring(lastIndex));
    return parts.length > 0 ? parts : text;
  };

  return (
    <>
      {/* Bubble Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
          
          {/* Greeting Bubble */}
          {showGreeting && (
            <div className="mb-4 mr-2 bg-white px-4 py-3 rounded-2xl rounded-br-sm shadow-xl border border-blue-100 max-w-[250px] animate-in fade-in slide-in-from-bottom-4 duration-500 relative group">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-full shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">
                        Hi {dbUsername}! 👋 <br/>
                        <span className="text-xs text-gray-500 font-normal">Butuh bantuan belajar hari ini?</span>
                    </p>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowGreeting(false); }}
                    className="absolute -top-2 -left-2 bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <div 
            // [MODIFIKASI] Animasi lebih lambat (3s)
            style={{ animationDuration: '3s' }}
            className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center cursor-pointer shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 animate-bounce"
            onClick={() => { setIsOpen(true); setShowGreeting(false); }}
          >
            <div className="text-2xl">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white animate-pulse ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col z-[9999] border border-gray-200 animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white/20">
                <AvatarFallback className="bg-white/20">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">SkillUp Assistant</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${connectionStatus === 'connected' ? 'bg-green-400' : connectionStatus === 'disconnected' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                  <p className="text-xs opacity-80">{connectionStatus === 'connected' ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setIsMinimized(true)}><Minimize2 className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => { setIsOpen(false); setIsMinimized(false); }}><X className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Connection Status */}
          {connectionStatus !== 'connected' && (
            <div className="bg-yellow-50 border-b border-yellow-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    {connectionStatus === 'disconnected' 
                      ? 'Backend offline, menggunakan mode lokal' 
                      : 'Mengecek koneksi server...'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={checkBackendConnection}>
                  <RefreshCw className="h-3 w-3 mr-1" /> Coba Lagi
                </Button>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-b border-red-200 p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 flex-1">{error}</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gray-50 p-3 border-b">
            <p className="text-xs text-gray-600 mb-2 font-medium">Tanya cepat:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'communication', label: '💬 Komunikasi', color: 'from-blue-500 to-blue-600' },
                { key: 'leadership', label: '👑 Leadership', color: 'from-purple-500 to-purple-600' },
                { key: 'time', label: '⏰ Manajemen Waktu', color: 'from-green-500 to-green-600' },
                { key: 'teamwork', label: '🤝 Kerja Tim', color: 'from-orange-500 to-orange-600' }
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => handleQuickAction(key)}
                  className={`px-3 py-1.5 text-xs bg-gradient-to-r ${color} text-white rounded-full hover:opacity-90 transition-all duration-200 flex items-center gap-1 shadow-sm`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 bg-gray-50/50">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className={`h-8 w-8 ${msg.sender === 'user' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                      <AvatarFallback className={msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}>
                        {msg.sender === 'user' ? <User className="h-4 w-4"/> : <Bot className="h-4 w-4"/>}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${msg.sender === 'user' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border'}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{renderWithLinks(msg.text, msg.sender)}</p>
                      <span className={`text-xs mt-1 block ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                   <Avatar className="h-8 w-8 bg-purple-100"><AvatarFallback className="bg-purple-500 text-white"><Bot className="h-4 w-4"/></AvatarFallback></Avatar>
                   <div className="bg-white border rounded-2xl rounded-bl-none px-4 py-3"><div className="flex gap-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div></div></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 bg-white border-t">
             <div className="flex gap-2">
                <Textarea ref={inputRef} value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={handleKeyPress} placeholder="Tanya sesuatu..." className="min-h-[44px] max-h-32 resize-none" rows={1} disabled={isTyping} />
                <Button onClick={handleSend} disabled={!inputText.trim() || isTyping} className="bg-gradient-to-r from-blue-600 to-purple-600 h-[44px] px-4"><Send className="h-4 w-4" /></Button>
             </div>
             <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-400">{connectionStatus === 'connected' ? '🟢 Online' : '🔴 Offline'}</span>
                <button onClick={clearChat} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"><RefreshCw className="h-3 w-3"/> Chat Baru</button>
             </div>
          </div>
        </div>
      )}

      {/* Minimized Chat */}
      {isOpen && isMinimized && (
        <div className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center cursor-pointer shadow-2xl z-[9999]" onClick={() => setIsMinimized(false)}>
           <MessageCircle className="h-8 w-8 text-white" />
        </div>
      )}
    </>
  );
};

export default ChatBotBubble;