import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Send, Bot, User, Loader2 } from "lucide-react";

const AIAssistant: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // ============================
  // GET USER PROFILE
  // ============================
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setUserProfile(profile);
    };

    fetchUserProfile();
  }, []);

  // ============================
  // LOAD LOCAL HISTORY
  // ============================
  useEffect(() => {
    const stored = localStorage.getItem("ai_fullpage_history");
    if (stored) setMessages(JSON.parse(stored));
  }, []);

  // SAVE TO LOCAL
  useEffect(() => {
    localStorage.setItem("ai_fullpage_history", JSON.stringify(messages));
  }, [messages]);

  // AUTO SCROLL
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ============================
  // HANDLE SEND MESSAGE
  // ============================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage.content,
          uid: userProfile?.id,
          username: userProfile?.username,
        }),
      });

      const data = await res.json();
      const botReply = {
        role: "assistant",
        content: data.reply || "Maaf, ada gangguan jaringan.",
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: server tidak merespons." },
      ]);
    }

    setLoading(false);
  };

  // Send on Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // ============================
  // QUICK ACTIONS
  // ============================
  const quickActions = [
    "Rekomendasikan materi belajar",
    "Bantu buat rangkuman",
    "Buatkan soal latihan",
    "Kasih ide project sederhana",
  ];

  const handleQuickAction = (text: string) => {
    setInput(text);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-white">

      {/* TOP BAR */}
      <div className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md flex items-center gap-3">
        <Bot className="w-6 h-6" />
        <h1 className="text-lg font-semibold">AI Assistant</h1>
      </div>

      {/* QUICK ACTIONS */}
      <div className="px-4 py-3 flex gap-2 flex-wrap">
        {quickActions.map((item, i) => (
          <button
            key={i}
            onClick={() => handleQuickAction(item)}
            className="px-3 py-2 text-sm bg-gray-100 rounded-lg border hover:bg-gray-200 transition"
          >
            {item}
          </button>
        ))}
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${
              msg.role === "assistant" ? "flex-row" : "flex-row-reverse"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                msg.role === "assistant"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-300 text-gray-800"
              }`}
            >
              {msg.role === "assistant" ? <Bot size={20} /> : <User size={20} />}
            </div>

            <div
              className={`max-w-[75%] px-4 py-3 rounded-xl text-sm whitespace-pre-line ${
                msg.role === "assistant"
                  ? "bg-purple-100 text-gray-900"
                  : "bg-indigo-500 text-white"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-500 text-white flex items-center justify-center">
              <Bot size={20} />
            </div>

            <div className="px-4 py-3 bg-purple-100 rounded-xl text-sm text-gray-700 flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4" />
              Sedang mengetik...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="w-full p-4 border-t bg-white flex items-center gap-3">
        <input
          className="flex-1 px-4 py-3 border rounded-xl shadow-sm focus:outline-none"
          placeholder="Tulis pesan..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
