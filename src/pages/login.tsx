import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Mail, 
  Lock, 
  ArrowLeft, 
  AlertCircle,
  LogIn
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const location = useLocation();

  const getRedirectPath = () => {
    const params = new URLSearchParams(location.search);
    const target = params.get("redirect") || params.get("redirectTo");
    return target || "/dashboard";
  };

  const targetPath = getRedirectPath();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      console.log("Login sukses, mengarahkan ke:", targetPath);
      window.location.replace(targetPath);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(targetPath)}`,
      },
    });

    setLoading(false);
    if (error) setErrorMsg(error.message);
  };

  return (
    // h-screen & overflow-hidden membuat halaman ini terkunci satu layar (unscrolled)
    <div className="h-screen w-full relative flex items-center justify-center bg-slate-50 overflow-hidden font-sans">
      
      {/* --- ANIMATED BACKGROUND (Minimalist Motion) --- */}
      <div className="absolute inset-0 w-full h-full bg-white z-0">
         {/* Dot Pattern Overlay untuk tekstur halus */}
         <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
         
         {/* Blob 1 (Top Left - Biru) */}
         <motion.div
            animate={{ 
              x: [0, 100, 0], 
              y: [0, -50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px]"
         />
         
         {/* Blob 2 (Bottom Right - Ungu) */}
         <motion.div
            animate={{ 
              x: [0, -100, 0], 
              y: [0, 50, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-[120px]"
         />

         {/* Blob 3 (Center - Cyan/Primary - Subtle) */}
         <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]"
         />
      </div>

      {/* --- BACK BUTTON --- */}
      <Link to="/" className="absolute top-8 left-8 z-20">
        <Button variant="ghost" className="group text-slate-500 hover:text-primary hover:bg-white/50">
          <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Button>
      </Link>

      {/* --- MAIN LOGIN CARD --- */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[400px] relative z-10 px-4"
      >
        <Card className="border-slate-200/60 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center pb-6 pt-8">
            <motion.div 
               initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
               className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3 text-primary"
            >
              <LogIn className="w-6 h-6" />
            </motion.div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome Back
            </CardTitle>
            <CardDescription>
              Sign in to continue your learning journey
            </CardDescription>

            {targetPath !== "/dashboard" && (
               <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100"
               >
                 You'll be redirected after login
               </motion.div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-9 h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 h-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4"/>
                  {errorMsg}
                </motion.div>
              )}

              <Button
                className="w-full h-10 font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-10 hover:bg-slate-50"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            
             <p className="text-center text-sm text-muted-foreground pt-2">
              New here? <Link to="/register" className="text-primary hover:underline font-medium">Create account</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;