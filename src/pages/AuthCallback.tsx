import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error during auth callback:", error);
        navigate("/login");
        return;
      }

      if (data.session) {
        // --- LOGIKA REDIRECT DI SINI ---
        // 1. Cek apakah ada parameter 'redirect' di URL (query params)
        const params = new URLSearchParams(window.location.search);
        const redirectTarget = params.get("redirect");

        console.log("AuthCallback target:", redirectTarget);

        if (redirectTarget) {
          // Decode URI component untuk memastikan URL bersih
          navigate(decodeURIComponent(redirectTarget), { replace: true });
        } else {
          // Default jika tidak ada target
          navigate("/dashboard", { replace: true });
        }
      } else {
        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-gray-500">Memverifikasi sesi Anda...</p>
      </div>
    </div>
  );
};

export default AuthCallback;