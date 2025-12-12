import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Session } from "@supabase/supabase-js";
import Navigation from "./Navigation";
import ChatBotBubble from "./ChatBot/ChatBotBubble"; 

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { pathname } = useLocation();
  const [session, setSession] = useState<Session | null>(null);

  // Sembunyikan footer hanya di dashboard
  const hideFooter = pathname.startsWith("/dashboard");

  useEffect(() => {
    // 1. Cek status login saat halaman dimuat pertama kali
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Pantau perubahan status (Login/Logout) secara real-time
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      // --- PERBAIKAN DISINI ---
      // Jika event adalah 'SIGNED_OUT' (Logout), hapus riwayat chat
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('skillup_chat_history');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Navigation tetap di atas */}
      <Navigation />

      {/* Konten utama */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      {!hideFooter && (
        <footer className="bg-card border-t border-border py-8 mt-20">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>© 2025 SkillUp. Empowering students with essential soft skills.</p>
          </div>
        </footer>
      )}

      {/* AI Assistant */}
      {/* Trik 'key={session?.user?.id}': 
          Ini memaksa React untuk menghancurkan dan membuat ulang komponen Chatbot 
          setiap kali User ID berubah (misal ganti akun).
          Jadi chat history di memori (state) pasti bersih.
      */}
      {session && <ChatBotBubble key={session.user.id} />}
    </div>
  );
};

export default Layout;