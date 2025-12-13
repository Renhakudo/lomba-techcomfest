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

  // === LIST HALAMAN YANG FOOTER-NYA DISUMBUNYIKAN ===
  const hiddenFooterRoutes = [
    "/dashboard",
    "/modules",
    "/aiassistent",
  ];

  // cek apakah pathname dimulai dengan salah satu route di atas
  const hideFooter = hiddenFooterRoutes.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      if (event === "SIGNED_OUT") {
        localStorage.removeItem("skillup_chat_history");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navigation />

      <main className="flex-1">{children}</main>

      {/* FOOTER HANYA MUNCUL JIKA hideFooter === false */}
      {!hideFooter && (
        <footer className="bg-card border-t border-border py-8 mt-20">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p>© 2025 SkillUp. Empowering students with essential soft skills.</p>
          </div>
        </footer>
      )}

      {session && <ChatBotBubble key={session.user?.id} />}
    </div>
  );
};

export default Layout;
