// src/pages/ForumChat.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  X,
  CornerUpLeft,
  Trash2,
  EyeOff,
  Loader2,
  Check,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Discussion = {
  id: number;
  title: string;
  author: string;
  avatar?: string;
  category: string;
  categoryColor: string;
  replies?: number;
  likes?: number;
  views?: number;
  time?: string;
  isPinned?: boolean;
  isTrending?: boolean;
  createdAt?: number;
};

type MessageItem = {
  id: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  author: string;
  avatar?: string;
  time: number;
  userId?: string;
  replyTo?: {
    id: string;
    text: string;
    author: string;
  };
  isDeleted?: boolean;
  deletedMode?: "permanent" | "private";
  isSending?: boolean;
  isSent?: boolean;
};

const FIVE_MIN = 5 * 60 * 1000;
const DEFAULT_AVATAR = "/default-avatar.png";
const CURRENT_USER_NAME = "You";

const ForumChat: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const discussion: Discussion | undefined = (location.state as any)?.discussion;
  const allDiscussions: Discussion[] = (location.state as any)?.discussions ?? [];

  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedVideo, setAttachedVideo] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<MessageItem | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [mediaViewer, setMediaViewer] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [privatelyDeletedIds, setPrivatelyDeletedIds] = useState<
    Record<string, boolean>
  >({});

  // Map untuk track temp message IDs ke real message IDs
  const tempToRealMap = useRef<Record<string, string>>({});

  const fileRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Cache untuk profiles
  const profilesCache = useRef<Record<string, {username: string, avatar_url: string}>>({});
  const messagesCache = useRef<Record<string, MessageItem>>({});

  // Get current user dan profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", user.id)
            .single();
          
          if (profile) {
            setUserProfile(profile);
            profilesCache.current[user.id] = {
              username: profile.username || "User",
              avatar_url: profile.avatar_url || DEFAULT_AVATAR
            };
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    
    fetchUser();
  }, []);

  // Fetch messages awal
  const fetchMessages = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoadingMessages(true);
      const forumId = parseInt(id, 10);
      
      if (isNaN(forumId)) {
        setIsLoadingMessages(false);
        return;
      }

      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("id, text, image_url, video_url, created_at, reply_to_id, user_id, is_deleted")
        .eq("forum_id", forumId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: true })
        .limit(150);

      if (messagesError) throw messagesError;

      // Reset cache
      messagesCache.current = {};

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        setIsLoadingMessages(false);
        return;
      }

      // Get unique user IDs
      const unknownUserIds = messagesData
        .map(msg => msg.user_id)
        .filter(Boolean)
        .filter(userId => !profilesCache.current[userId as string]) as string[];

      // Fetch profiles yang belum di-cache
      if (unknownUserIds.length > 0) {
        try {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .in("id", unknownUserIds);
          
          if (profilesData) {
            profilesData.forEach(profile => {
              profilesCache.current[profile.id] = {
                username: profile.username || "User",
                avatar_url: profile.avatar_url || DEFAULT_AVATAR
              };
            });
          }
        } catch (profileErr) {
          console.warn("Could not fetch profiles:", profileErr);
        }
      }

      // Process messages
      const messageMap: Record<string, any> = {};
      messagesData.forEach(msg => {
        messageMap[msg.id] = msg;
      });

      const formattedMessages: MessageItem[] = [];
      
      for (const msg of messagesData) {
        const messageId = String(msg.id);
        
        if (messagesCache.current[messageId]) {
          formattedMessages.push(messagesCache.current[messageId]);
          continue;
        }

        let username = "Unknown";
        let avatar = DEFAULT_AVATAR;
        
        if (msg.user_id) {
          const cachedProfile = profilesCache.current[msg.user_id];
          if (cachedProfile) {
            username = cachedProfile.username;
            avatar = cachedProfile.avatar_url;
          } else if (msg.user_id === currentUser?.id) {
            username = CURRENT_USER_NAME;
            avatar = userProfile?.avatar_url || DEFAULT_AVATAR;
          }
        }

        let replyTo = undefined;
        if (msg.reply_to_id && messageMap[msg.reply_to_id]) {
          const repliedMsg = messageMap[msg.reply_to_id];
          let repliedAuthor = "Unknown";
          
          if (repliedMsg.user_id && profilesCache.current[repliedMsg.user_id]) {
            repliedAuthor = profilesCache.current[repliedMsg.user_id].username;
          }
          
          replyTo = {
            id: String(msg.reply_to_id),
            text: repliedMsg.text || "(reply)",
            author: repliedAuthor
          };
        }

        const formattedMessage: MessageItem = {
          id: messageId,
          text: msg.text || undefined,
          imageUrl: msg.image_url || undefined,
          videoUrl: msg.video_url || undefined,
          author: username,
          avatar: avatar,
          userId: msg.user_id,
          time: new Date(msg.created_at).getTime(),
          replyTo,
          isDeleted: msg.is_deleted || false,
          isSent: true,
        };

        messagesCache.current[messageId] = formattedMessage;
        formattedMessages.push(formattedMessage);
      }

      setMessages(formattedMessages);
      
    } catch (error) {
      console.error("Error in fetchMessages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [id, currentUser, userProfile]);

  // Initial fetch
  useEffect(() => {
    if (id) {
      fetchMessages();
    }
  }, [id, fetchMessages]);

  // Setup realtime subscription - SIMPLIFIED VERSION
  useEffect(() => {
    if (!id || !currentUser) return;

    const forumId = parseInt(id, 10);
    if (isNaN(forumId)) return;

    console.log("Setting up realtime for forum:", forumId);

    // Subscribe to new messages
    const channel = supabase
      .channel(`forum-${forumId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `forum_id=eq.${forumId}`,
        },
        async (payload) => {
          console.log("New message detected:", payload.new);
          
          const newMsg = payload.new;
          const messageId = String(newMsg.id);
          
          // Skip jika pesan ini dari user yang sama (kita sudah handle di client side)
          if (newMsg.user_id === currentUser.id) {
            // Cek jika ini adalah konfirmasi untuk temp message kita
            const tempId = Object.keys(tempToRealMap.current).find(
              tempId => tempToRealMap.current[tempId] === messageId
            );
            
            if (tempId) {
              // Update temp message menjadi real message
              setMessages(prev => prev.map(msg => 
                msg.id === tempId 
                  ? { 
                      ...msg, 
                      id: messageId,
                      isSending: false,
                      isSent: true 
                    }
                  : msg
              ));
              // Hapus dari mapping
              delete tempToRealMap.current[tempId];
            }
            return;
          }
          
          // Untuk pesan dari user lain, fetch data lengkap
          let username = "Unknown";
          let avatar = DEFAULT_AVATAR;
          
          if (newMsg.user_id && profilesCache.current[newMsg.user_id]) {
            const profile = profilesCache.current[newMsg.user_id];
            username = profile.username;
            avatar = profile.avatar_url;
          } else if (newMsg.user_id) {
            try {
              const { data: profile } = await supabase
                .from("profiles")
                .select("username, avatar_url")
                .eq("id", newMsg.user_id)
                .single();
              
              if (profile) {
                username = profile.username || "User";
                avatar = profile.avatar_url || DEFAULT_AVATAR;
                profilesCache.current[newMsg.user_id] = { username, avatar_url: avatar };
              }
            } catch (err) {
              console.warn("Failed to fetch profile:", err);
            }
          }
          
          const newMessageItem: MessageItem = {
            id: messageId,
            text: newMsg.text || undefined,
            imageUrl: newMsg.image_url || undefined,
            videoUrl: newMsg.video_url || undefined,
            author: username,
            avatar: avatar,
            userId: newMsg.user_id,
            time: new Date(newMsg.created_at).getTime(),
            isDeleted: newMsg.is_deleted || false,
            isSent: true,
          };
          
          // Add to cache
          messagesCache.current[messageId] = newMessageItem;
          
          // Add to messages state
          setMessages(prev => [...prev, newMessageItem]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `forum_id=eq.${forumId}`,
        },
        (payload) => {
          // Handle message updates (deletions)
          if (payload.new.is_deleted) {
            const messageId = String(payload.new.id);
            setMessages(prev =>
              prev.map((m) =>
                m.id === messageId
                  ? {
                      ...m,
                      isDeleted: true,
                      deletedMode: "permanent",
                      text: "Pesan ini telah dihapus.",
                      imageUrl: undefined,
                      videoUrl: undefined
                    }
                  : m
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, currentUser]);

  // Auto-scroll
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      const shouldScroll = messages.some(msg => msg.isSending);
      if (shouldScroll) {
        setTimeout(() => {
          messagesContainerRef.current?.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [messages]);

  // Close menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Handle attach file
  const handleAttachClick = () => {
    fileRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.type.startsWith("image/")) {
      reader.onload = () => setAttachedImage(reader.result as string);
      reader.readAsDataURL(file);
      setAttachedVideo(null);
    } else if (file.type.startsWith("video/")) {
      reader.onload = () => setAttachedVideo(reader.result as string);
      reader.readAsDataURL(file);
      setAttachedImage(null);
    }

    e.currentTarget.value = "";
  };

  // **FIXED: Send message dengan immediate update**
  const handleSend = async () => {
    if ((!inputText.trim() && !attachedImage && !attachedVideo) || !id || !currentUser || isSending) {
      return;
    }

    setIsSending(true);
    
    try {
      const forumId = parseInt(id, 10);
      if (isNaN(forumId)) {
        setIsSending(false);
        return;
      }

      // 1. Siapkan data
      const textToSend = inputText.trim();
      const imageToSend = attachedImage;
      const videoToSend = attachedVideo;
      const replyToId = replyTarget?.id;
      const tempId = `temp-${Date.now()}`;

      // 2. Buat temp message untuk INSTANT FEEDBACK
      const tempMsg: MessageItem = {
        id: tempId,
        text: textToSend || undefined,
        imageUrl: imageToSend || undefined,
        videoUrl: videoToSend || undefined,
        author: CURRENT_USER_NAME,
        avatar: userProfile?.avatar_url || DEFAULT_AVATAR,
        userId: currentUser.id,
        time: Date.now(),
        replyTo: replyTarget ? {
          id: replyTarget.id,
          text: replyTarget.text ?? "",
          author: replyTarget.author,
        } : undefined,
        isSending: true,
        isSent: false,
      };

      // 3. LANGSUNG TAMBAHKAN KE STATE (INSTANT APPEAR)
      setMessages(prev => [...prev, tempMsg]);
      
      // 4. Clear input fields
      const savedText = inputText;
      const savedImage = attachedImage;
      const savedVideo = attachedVideo;
      const savedReplyTarget = replyTarget;
      
      setInputText("");
      setAttachedImage(null);
      setAttachedVideo(null);
      setReplyTarget(null);
      setOpenMenuId(null);

      // 5. Kirim ke database di background
      setTimeout(async () => {
        try {
          const messageData: any = {
            forum_id: forumId,
            user_id: currentUser.id,
            text: savedText || null,
            reply_to_id: savedReplyTarget?.id ? parseInt(savedReplyTarget.id, 10) : null,
          };

          // Handle image upload
          if (savedImage) {
            if (savedImage.startsWith('data:')) {
              try {
                const fileExt = savedImage.split(';')[0].split('/')[1];
                const fileName = `forum-${forumId}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                  .from('forum-images')
                  .upload(fileName, dataURLtoBlob(savedImage));
                
                if (!uploadError) {
                  const { data: { publicUrl } } = supabase.storage
                    .from('forum-images')
                    .getPublicUrl(fileName);
                  messageData.image_url = publicUrl;
                }
              } catch (uploadErr) {
                console.error("Image upload failed:", uploadErr);
              }
            } else {
              messageData.image_url = savedImage;
            }
          }

          // Handle video upload
          if (savedVideo) {
            if (savedVideo.startsWith('data:')) {
              try {
                const fileExt = savedVideo.split(';')[0].split('/')[1];
                const fileName = `forum-${forumId}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                  .from('forum-videos')
                  .upload(fileName, dataURLtoBlob(savedVideo));
                
                if (!uploadError) {
                  const { data: { publicUrl } } = supabase.storage
                    .from('forum-videos')
                    .getPublicUrl(fileName);
                  messageData.video_url = publicUrl;
                }
              } catch (uploadErr) {
                console.error("Video upload failed:", uploadErr);
              }
            } else {
              messageData.video_url = savedVideo;
            }
          }

          // Insert ke database
          const { data, error } = await supabase
            .from("messages")
            .insert([messageData])
            .select()
            .single();

          if (error) {
            console.error("Database error:", error);
            // Update status jadi failed
            setMessages(prev => prev.map(msg => 
              msg.id === tempId 
                ? { 
                    ...msg, 
                    isSending: false,
                    text: (msg.text || "") + " (failed)",
                    isSent: false 
                  }
                : msg
            ));
          } else {
            console.log("Message sent successfully:", data);
            
            // Map tempId ke real message ID untuk realtime update
            const realMessageId = String(data.id);
            tempToRealMap.current[tempId] = realMessageId;
            
            // Update temp message menjadi sent (nanti realtime akan update ke real ID)
            setMessages(prev => prev.map(msg => 
              msg.id === tempId 
                ? { 
                    ...msg, 
                    isSending: false,
                    isSent: true 
                  }
                : msg
            ));
          }
        } catch (err) {
          console.error("Background send error:", err);
          setMessages(prev => prev.map(msg => 
            msg.id === tempId 
              ? { 
                  ...msg, 
                  isSending: false,
                  text: (msg.text || "") + " (error)",
                  isSent: false 
                }
              : msg
          ));
        }
      }, 0); // Gunakan timeout 0 untuk non-blocking

    } catch (err) {
      console.error("handleSend error:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Helper untuk convert dataURL ke Blob
  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  };

  // Handle key press
  const handleKeyDownOnInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isSending) {
      e.preventDefault();
      handleSend();
    }
  };

  // Navigate ke topic lain
  const openTopic = (d: Discussion) => {
    navigate(`/ForumChat/${d.id}`, {
      state: { discussion: d, discussions: allDiscussions },
    });
  };

  // Cek apakah pesan bisa dihapus permanen
  const canDeletePermanently = (m: MessageItem) => {
    if (!currentUser || m.userId !== currentUser.id || m.id.startsWith('temp-')) return false;
    return Date.now() - m.time <= FIVE_MIN;
  };

  // Handle delete private
  const handleDeletePrivate = (msgId: string) => {
    setPrivatelyDeletedIds((prev) => ({ ...prev, [msgId]: true }));
    setOpenMenuId(null);
  };

  // Handle delete permanent
  const handleDeletePermanent = async (msgId: string) => {
    try {
      if (!msgId || msgId.startsWith('temp-') || !currentUser) return;

      // Update UI
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { 
                ...m, 
                isDeleted: true, 
                deletedMode: "permanent", 
                text: "Pesan ini telah dihapus.",
                imageUrl: undefined,
                videoUrl: undefined
              }
            : m
        )
      );

      // Update database
      const { error } = await supabase
        .from("messages")
        .update({ 
          is_deleted: true,
          text: "Pesan ini telah dihapus.",
          image_url: null,
          video_url: null
        })
        .eq("id", parseInt(msgId, 10))
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Delete error:", error);
      }

      setPrivatelyDeletedIds((prev) => {
        const copy = { ...prev };
        delete copy[msgId];
        return copy;
      });
      setOpenMenuId(null);
      
    } catch (err) {
      console.error("Delete permanent error:", err);
    }
  };

  // Handle reply
  const handleReply = (msg: MessageItem) => {
    setReplyTarget(msg);
    setOpenMenuId(null);
    setTimeout(() => textInputRef.current?.focus(), 100);
  };

  // Filter discussions
  const filteredDiscussions = allDiscussions
    .filter((d) => 
      d.id !== discussion?.id && 
      (searchTerm === "" || 
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .slice(0, 8);

  if (!discussion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Loading discussion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-5" ref={rootRef}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-5">
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            {/* Discussion Info Card */}
            <Card className="shadow-sm border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg font-semibold truncate">{discussion.title}</CardTitle>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                      {discussion.author.charAt(0)}
                    </div>
                    <span className="font-medium">{discussion.author}</span>
                  </div>

                  <Badge 
                    className={`px-3 py-1 text-white text-xs font-medium rounded-full ${discussion.categoryColor}`}
                  >
                    {discussion.category}
                  </Badge>
                  
                  <span className="text-gray-400">•</span>
                  <span>{discussion.time}</span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${discussion.categoryColor}`} />
                    <div>
                      <div className="font-semibold text-blue-800">{discussion.category}</div>
                      <div className="text-sm text-blue-600 mt-1">This is the category for this discussion.</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Related Topics */}
            <Card className="shadow-sm border h-[350px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-gray-600" />
                  <CardTitle className="text-lg font-semibold">Search Related Topics</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden flex flex-col">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search similar topics..."
                    className="pl-10 w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                  {filteredDiscussions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No topics found</p>
                    </div>
                  ) : (
                    filteredDiscussions.map((topic) => (
                      <div
                        key={topic.id}
                        className="p-3 bg-white hover:bg-gray-50 cursor-pointer rounded-lg border border-gray-200 transition-colors"
                        onClick={() => openTopic(topic)}
                      >
                        <div className="font-semibold text-sm text-gray-900 truncate">{topic.title}</div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-xs text-gray-500">{topic.author}</div>
                          <div className="text-xs text-gray-400">{topic.time}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CHAT AREA */}
          <div className="lg:col-span-3 flex flex-col h-[84vh] bg-white rounded-xl border shadow-sm overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {discussion.title.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-gray-900">{discussion.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{messages.filter(m => !m.isSending).length} messages</span>
                      <span>•</span>
                      <span>{discussion.views || 0} views</span>
                    </div>
                  </div>
                </div>
                
                <Badge 
                  className={`px-3 py-1 ${discussion.categoryColor} text-white`}
                >
                  {discussion.category}
                </Badge>
              </div>
            </div>

            {/* Messages Container */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 p-4 md:p-6 overflow-y-auto bg-gradient-to-b from-white to-gray-50"
            >
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="w-14 h-14 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-1">No messages yet</h3>
                    <p className="text-sm">Be the first to start the conversation!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((m) => {
                    const isPrivatelyDeleted = !!privatelyDeletedIds[m.id];
                    const isMine = currentUser ? m.userId === currentUser.id : false;
                    const isPermanentlyDeleted = m.isDeleted && m.deletedMode === "permanent";
                    const isTemp = m.id.startsWith('temp-');
                    const isSendingMsg = m.isSending;

                    return (
                      <div 
                        key={m.id} 
                        className={`flex gap-3 ${isMine ? "flex-row-reverse" : "flex-row"} ${isSendingMsg ? "opacity-90" : ""}`}
                      >
                        <div className="flex-shrink-0">
                          <img 
                            src={m.avatar || DEFAULT_AVATAR} 
                            className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover" 
                            alt={m.author} 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                            }}
                          />
                        </div>

                        <div className={`relative max-w-[75%] ${isMine ? "mr-2" : "ml-2"}`}>
                          {/* Message Bubble - TANPA SEGITIGA */}
                          <div
                            onClick={(e) => { 
                              if (isPermanentlyDeleted || isPrivatelyDeleted || isSendingMsg) return;
                              e.stopPropagation(); 
                              setOpenMenuId(prev => prev === m.id ? null : m.id); 
                            }}
                            className={`rounded-2xl px-4 py-3 break-words shadow-sm ${
                              isPermanentlyDeleted 
                                ? "bg-gray-100 text-gray-500" 
                                : isPrivatelyDeleted
                                ? "bg-gray-100 text-gray-500"
                                : isMine
                                ? isSendingMsg ? "bg-blue-500 text-white" : "bg-blue-600 text-white"
                                : "bg-white text-gray-900 border border-gray-200"
                            } ${!isPermanentlyDeleted && !isSendingMsg ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
                          >
                            {isPrivatelyDeleted && !isPermanentlyDeleted ? (
                              <div className="text-sm italic flex items-center gap-1">
                                <EyeOff className="w-3.5 h-3.5" />
                                Anda menghapus pesan ini.
                              </div>
                            ) : isPermanentlyDeleted ? (
                              <div className="text-sm italic flex items-center gap-1">
                                <Trash2 className="w-3.5 h-3.5" />
                                Pesan ini telah dihapus.
                              </div>
                            ) : (
                              <>
                                {m.replyTo && (
                                  <div 
                                    className={`mb-2 rounded-lg p-2 text-xs border-l-3 ${
                                      isMine 
                                        ? "bg-blue-500/20 border-blue-400" 
                                        : "bg-gray-100 border-gray-300"
                                    }`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="font-semibold truncate">{m.replyTo.author}</div>
                                    <div className="truncate opacity-80 mt-0.5">{m.replyTo.text}</div>
                                  </div>
                                )}

                                <div className={`text-xs font-medium mb-1 flex items-center gap-2 ${isMine ? "text-blue-100" : "text-gray-500"}`}>
                                  {m.author}
                                  {isMine && isSendingMsg && (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  )}
                                  {isMine && m.isSent && !isSendingMsg && (
                                    <Check className="w-3 h-3" />
                                  )}
                                </div>

                                {m.text && (
                                  <div className="text-sm mb-3 whitespace-pre-wrap">{m.text}</div>
                                )}

                                {(m.imageUrl || m.videoUrl) && (
                                  <div className="mt-2">
                                    {m.imageUrl && (
                                      <img 
                                        src={m.imageUrl} 
                                        className="max-h-60 w-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          setMediaViewer(m.imageUrl!); 
                                        }} 
                                        alt="attached" 
                                      />
                                    )}
                                    {m.videoUrl && (
                                      <video 
                                        src={m.videoUrl} 
                                        controls 
                                        className="max-h-60 w-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          setMediaViewer(m.videoUrl!); 
                                        }} 
                                      />
                                    )}
                                  </div>
                                )}

                                <div className={`text-xs opacity-70 mt-2 flex items-center ${isMine ? "justify-end" : "justify-start"}`}>
                                  <span>
                                    {new Date(m.time).toLocaleTimeString([], { 
                                      hour: "2-digit", 
                                      minute: "2-digit" 
                                    })}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Message Menu */}
                          {openMenuId === m.id && !isPermanentlyDeleted && !isPrivatelyDeleted && !isSendingMsg && (
                            <div 
                              className={`absolute top-0 z-50 mt-1 ${isMine ? "right-0" : "left-0"}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[180px] overflow-hidden">
                                <button 
                                  onClick={() => handleReply(m)} 
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                                >
                                  <CornerUpLeft className="w-4 h-4 text-gray-600" />
                                  <span>Reply</span>
                                </button>

                                {isMine && (
                                  <>
                                    {canDeletePermanently(m) ? (
                                      <button 
                                        onClick={() => handleDeletePermanent(m.id)} 
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete permanently</span>
                                      </button>
                                    ) : (
                                      <div className="px-4 py-3 text-xs text-gray-500 border-t">
                                        <div className="flex items-center gap-2">
                                          <Trash2 className="w-3.5 h-3.5" />
                                          <span>Delete (within 5 minutes)</span>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}

                                <button 
                                  onClick={() => handleDeletePrivate(m.id)} 
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 border-t transition-colors"
                                >
                                  <EyeOff className="w-4 h-4 text-gray-600" />
                                  <span>Hide for me</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {replyTarget && (
              <div className="px-6 py-3 bg-blue-50 border-y">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CornerUpLeft className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs font-semibold text-blue-800">Replying to {replyTarget.author}</div>
                      <div className="text-sm text-gray-700 truncate max-w-md">{replyTarget.text}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setReplyTarget(null)} 
                    className="p-1.5 hover:bg-blue-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Attached Media Preview */}
            {(attachedImage || attachedVideo) && (
              <div className="px-6 py-3 bg-gray-50 border-y">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {attachedImage && (
                      <img 
                        src={attachedImage} 
                        className="w-12 h-12 rounded object-cover" 
                        alt="attached" 
                      />
                    )}
                    {attachedVideo && (
                      <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-t-2 border-b-2 border-l-3 border-transparent border-l-white ml-0.5" />
                        </div>
                      </div>
                    )}
                    <span className="text-sm text-gray-600">
                      {attachedImage ? "Image" : "Video"} attached
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setAttachedImage(null);
                      setAttachedVideo(null);
                    }} 
                    className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="px-6 py-4 border-t bg-white">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleAttachClick} 
                  className="p-2.5 rounded-full hover:bg-gray-100 transition-colors"
                  disabled={isSending}
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex-1 relative">
                  <input
                    ref={textInputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDownOnInput}
                    placeholder="Type your message here..."
                    className="w-full px-5 py-3.5 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white border border-transparent focus:border-blue-300 transition-all"
                    disabled={isSending}
                  />
                </div>

                <button 
                  onClick={handleSend}
                  disabled={(!inputText.trim() && !attachedImage && !attachedVideo) || isSending}
                  className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>

                <input 
                  type="file" 
                  ref={fileRef} 
                  className="hidden" 
                  onChange={handleFileChange} 
                  accept="image/*,video/*" 
                  disabled={isSending}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Viewer Modal */}
      {mediaViewer && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setMediaViewer(null)}
        >
          <button 
            onClick={() => setMediaViewer(null)}
            className="absolute top-6 right-6 text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          {mediaViewer.endsWith(".mp4") || mediaViewer.includes("video") ? (
            <video 
              src={mediaViewer} 
              controls 
              autoPlay 
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img 
              src={mediaViewer} 
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl object-contain" 
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ForumChat;