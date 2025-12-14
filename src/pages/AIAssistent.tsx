import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { supabase } from '@/lib/supabaseClient'; 
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import Swal from 'sweetalert2';
import { 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const AIAssistant = () => {
  // State untuk nama user dari database
  const [dbUsername, setDbUsername] = useState<string>("Teman");
  const STORAGE_KEY = 'skillup_chat_history_fullpage';

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  // Cek koneksi saat halaman dimuat
  useEffect(() => {
    checkBackendConnection();
  }, []);

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

    setTimeout(() => inputRef.current?.focus(), 100);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/chat`, {
        message: inputText,
        sessionId: 'skillup-session-fullpage'
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
  Swal.fire({
    title: 'Hapus Riwayat?',
    text: "Semua percakapan akan hilang permanen!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444', // Merah (Warna danger Tailwind)
    cancelButtonColor: '#6b7280', // Abu-abu (Netral)
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
    reverseButtons: true // Posisi tombol dibalik biar lebih ergonomis
  }).then((result) => {
    if (result.isConfirmed) {
      // --- LOGIKA ASLI KAMU MULAI DARI SINI ---
      localStorage.removeItem(STORAGE_KEY);
      setMessages([{
        id: 1,
        text: `Halo, ${dbUsername}! Percakapan baru dimulai. Ada yang bisa saya bantu?`,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setError(null);
      // --- LOGIKA ASLI SELESAI ---

      // Feedback visual tambahan (biar makin keren)
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Chat berhasil direset.',
        timer: 1500, // Otomatis tutup dalam 1.5 detik
        showConfirmButton: false
      });
    }
  });
};

  const formatTime = (date: Date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // --- LOGIKA UTAMA UNTUK REDIRECT LINK ---
  const handleLinkClick = async (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    // 1. Cek apakah ini link eksternal (http/https). Jika ya, biarkan default (tab baru).
    const isExternal = url.startsWith('http') || url.startsWith('https');
    
    if (isExternal) return;

    // 2. Jika link internal (modul/halaman lain dalam app), cegah navigasi default
    e.preventDefault();

    // 3. Cek status login user saat ini
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        // Jika sudah login, navigasi langsung
        window.location.href = url;
    } else {
        // Jika belum login, arahkan ke login dengan parameter ?redirect=
        // encodeURIComponent penting agar URL tujuan aman dibaca browser
        const targetUrl = encodeURIComponent(url);
        window.location.href = `/login?redirect=${targetUrl}`;
    }
  };

  const renderWithLinks = (text: string, sender: 'user' | 'bot') => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.substring(lastIndex, match.index));
      
      const linkLabel = match[1];
      const linkUrl = match[2];
      const isExternal = linkUrl.startsWith('http');

      parts.push(
        <a 
          key={match.index} 
          href={linkUrl} 
          onClick={(e) => handleLinkClick(e, linkUrl)}
          target={isExternal ? "_blank" : "_self"} // Internal link jangan buka tab baru agar redirect mulus
          rel="noopener noreferrer" 
          className={`inline-flex items-center gap-1 font-semibold underline decoration-2 underline-offset-2 transition-colors mx-1 ${
            sender === 'user' 
              ? 'text-white decoration-white/50 hover:decoration-white' 
              : 'text-blue-600 decoration-blue-300 hover:text-blue-800 hover:decoration-blue-600 cursor-pointer'
          }`}
        >
          {linkLabel} 
          {isExternal ? <ExternalLink size={12} /> : <ArrowRight size={12} />}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) parts.push(text.substring(lastIndex));
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto h-[85vh] grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* --- SIDEBAR KIRI --- */}
        <Card className="lg:col-span-1 border-none shadow-xl flex flex-col h-full overflow-hidden bg-white">
            <div className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        <Bot className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">SkillUp AI</h2>
                        <p className="text-blue-100 text-xs flex items-center gap-1.5 mt-1">
                            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}/>
                            {connectionStatus === 'connected' ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
                <p className="text-sm text-blue-50 leading-relaxed">
                    Halo, <strong>{dbUsername}</strong>! Gunakan asisten ini untuk mempertajam soft skills Anda.
                </p>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Zap className="w-3 h-3" /> Topik Populer
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { key: 'communication', label: '💬 Komunikasi Efektif', desc: 'Tips berbicara & mendengar' },
                            { key: 'leadership', label: '👑 Jiwa Kepemimpinan', desc: 'Menjadi leader yang baik' },
                            { key: 'time', label: '⏰ Manajemen Waktu', desc: 'Produktifitas harian' },
                            { key: 'teamwork', label: '🤝 Kerja Sama Tim', desc: 'Kolaborasi sukses' }
                        ].map(({ key, label, desc }) => (
                            <button
                                key={key}
                                onClick={() => handleQuickAction(key)}
                                className="text-left group p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
                            >
                                <div className="font-semibold text-gray-700 group-hover:text-blue-700 text-sm">{label}</div>
                                <div className="text-xs text-gray-400 group-hover:text-blue-500 mt-0.5">{desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100">
                    <Button 
                        variant="outline" 
                        onClick={clearChat} 
                        className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> 
                        Reset Percakapan
                    </Button>
                </div>
            </div>
        </Card>

        {/* --- MAIN CHAT AREA --- */}
        <Card className="lg:col-span-3 border-none shadow-xl flex flex-col h-full bg-gray-50/50 overflow-hidden">
            
            {/* Header Area Chat */}
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-700">Sesi Percakapan</span>
                </div>
                {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-medium">
                        <AlertCircle className="w-3 h-3" />
                        {error}
                    </div>
                )}
            </div>

            {/* Chat Scroll Area */}
            <ScrollArea className="flex-1 p-6">
                <div className="space-y-6 max-w-4xl mx-auto">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-4 max-w-[85%] lg:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                
                                {/* Avatar */}
                                <Avatar className={`h-10 w-10 shadow-sm border-2 border-white ${msg.sender === 'user' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                                    <AvatarFallback className={msg.sender === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'}>
                                        {msg.sender === 'user' ? <User className="h-5 w-5"/> : <Bot className="h-5 w-5"/>}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Message Bubble */}
                                <div>
                                    <div className={`rounded-2xl px-6 py-4 shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                                        msg.sender === 'user' 
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-none' 
                                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                    }`}>
                                        {renderWithLinks(msg.text, msg.sender)}
                                    </div>
                                    <span className={`text-[10px] mt-1.5 block px-1 ${msg.sender === 'user' ? 'text-right text-gray-400' : 'text-left text-gray-400'}`}>
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex gap-4">
                            <Avatar className="h-10 w-10 shadow-sm border-2 border-white bg-purple-100">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                    <Bot className="h-5 w-5"/>
                                </AvatarFallback>
                            </Avatar>
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm flex items-center gap-1">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-6 bg-white border-t">
                <div className="max-w-4xl mx-auto relative">
                    <Textarea 
                        ref={inputRef} 
                        value={inputText} 
                        onChange={e => setInputText(e.target.value)} 
                        onKeyDown={handleKeyPress} 
                        placeholder="Ketik pesan Anda di sini... (Tekan Enter untuk kirim)" 
                        className="min-h-[60px] max-h-32 resize-none pr-16 py-4 px-5 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-100 bg-gray-50 focus:bg-white transition-all shadow-inner text-base" 
                        rows={1} 
                        disabled={isTyping} 
                    />
                    <div className="absolute right-2 bottom-2.5">
                        <Button 
                            onClick={handleSend} 
                            disabled={!inputText.trim() || isTyping} 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-10 w-10 rounded-xl p-0 hover:shadow-lg hover:scale-105 transition-all"
                        >
                            <Send className="h-5 w-5 text-white" />
                        </Button>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto mt-2 text-center">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" /> 
                        SkillUp AI
                    </p>
                </div>
            </div>

        </Card>
      </div>
    </div>
  );
};

export default AIAssistant;