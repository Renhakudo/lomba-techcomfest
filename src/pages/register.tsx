import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // 1️⃣ SIGN UP USER
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("SIGNUP RESULT:", signUpData, signUpError);

    if (signUpError) {
      setErrorMsg(signUpError.message);
      setLoading(false);
      return;
    }

    const user = signUpData.user;
    if (!user) {
      setErrorMsg("Registrasi gagal. Coba lagi.");
      setLoading(false);
      return;
    }

    // 2️⃣ INSERT PROFILE DEFAULT
    const { error: profileErr } = await supabase.from("profiles").insert({
      id: user.id,
      name: email.split("@")[0],
      avatar_url: null,
      level: 1,
      total_points: 0,
      completed_modules: 0,
      total_modules: 0,
      streak: 0,
    });

    console.log("PROFILE INSERT RESULT:", profileErr);

    if (profileErr) {
      setErrorMsg(profileErr.message);
    } else {
      alert("Registration success! Cek email untuk verifikasi.");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });

    if (error) {
      setErrorMsg(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Create your account
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="your password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm text-center">{errorMsg}</p>
            )}

            <Button
              className="btn-gradient-primary w-full mt-1"
              type="submit"
              disabled={loading}
            >
              {loading ? "Loading..." : "Register"}
            </Button>
          </form>

          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="w-full h-px bg-border"></div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              Continue with Google
            </Button>

            <p className="text-center text-sm mt-2">
              Already have an account?
              <a href="/login" className="text-primary ml-1 hover:underline">
                Login
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
