import { useEffect, useState } from "react";
import { Camera, User, AtSign, Save, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; // Pastikan path import ini sesuai struktur foldermu
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function EditProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
      setName(data?.name || "");
      setUsername(data?.username || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const ext = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: img } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      await supabase
        .from("profiles")
        .update({ avatar_url: img.publicUrl })
        .eq("id", user.id);

      setProfile({ ...profile, avatar_url: img.publicUrl });
    } catch (err) {
      console.error(err);
      alert("Error uploading avatar!");
    } finally {
      setUploading(false);
    }
  }

async function updateProfile() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  // Tampilkan Loading Spinner sebelum proses dimulai
  Swal.fire({
    title: 'Menyimpan...',
    text: 'Mohon tunggu sebentar',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading(); // Animasi loading bawaan SweetAlert
    }
  });

  try {
    await supabase
      .from("profiles")
      .update({ name, username })
      .eq("id", user.id);
    
    // Sukses! Ganti alert biasa dengan ini
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Profil kamu sudah diperbarui.',
      confirmButtonColor: '#4F46E5', // Ungu SkillUp (sesuai header)
      confirmButtonText: 'Mantap'
    }).then(() => {
      // Redirect jalan setelah user klik tombol "Mantap"
      navigate("/dashboard");
    });

  } catch (error) {
    // Error!
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Terjadi kesalahan saat update profil.',
      confirmButtonColor: '#4F46E5'
    });
  }
}
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 relative flex items-center justify-center p-4 selection:bg-blue-900/10 selection:text-blue-900">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 h-full w-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-slate-800/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* --- MAIN CONTAINER (Lebih Kecil: max-w-3xl) --- */}
      <div className="relative z-10 w-full max-w-3xl">
        
        {/* TOMBOL BACK DIHAPUS DI SINI */}

        {/* --- CARD DESIGN --- */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-white/50 overflow-hidden my-auto">
          
          {/* Tinggi minimum dikurangi sedikit agar lebih kompak */}
          <div className="grid md:grid-cols-12 min-h-[450px]">
            
            {/* LEFT SIDE (5 Columns) */}
            <div className="md:col-span-5 bg-slate-50 relative flex flex-col border-r border-slate-100">
                {/* Cover Area - Tinggi dikurangi menjadi h-28 */}
                <div className="h-28 bg-gradient-to-b from-[#0f172a] via-[#1e3a8a] to-[#1e40af] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10" />
                </div>

                {/* Avatar Section - Margin top disesuaikan (-mt-16) */}
                <div className="px-6 -mt-16 mb-6 flex flex-col items-center md:items-start relative z-10">
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-blue-900 rounded-full blur-md opacity-30 group-hover:opacity-50 transition duration-500"></div>
                        {/* Ukuran avatar sedikit diperkecil (w-32 h-32) */}
                        <img
                            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&background=0f172a`}
                            alt="Avatar"
                            className="relative w-32 h-32 rounded-full object-cover border-[5px] border-white shadow-xl bg-white"
                        />
                        <label className="absolute bottom-1 right-1 cursor-pointer group-hover:scale-105 transition-transform">
                            <div className="bg-[#0f172a] text-white p-2.5 rounded-full shadow-md border-[3px] border-white hover:bg-blue-700 transition-colors">
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                            </div>
                            <input type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} className="hidden" />
                        </label>
                    </div>

                    <div className="mt-4 text-center md:text-left">
                        <h2 className="text-lg font-bold text-slate-900">{name || "Your Name"}</h2>
                        <p className="text-sm text-slate-500 font-medium flex items-center justify-center md:justify-start gap-1">
                            <AtSign size={14} className="text-blue-500" />
                            {username || "username"}
                        </p>
                    </div>
                </div>

                {/* Decorative Info (Disembunyikan di layar kecil agar lebih ringkas) */}
                <div className="mt-auto p-6 hidden lg:block">
                    <div className="bg-[#f1f5f9] p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-1 text-blue-800">
                            <Sparkles size={14} className="fill-blue-800" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Profile Tip</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Square images work best for avatars.
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: FORM INPUTS (7 Columns) - Padding dikurangi */}
            <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-center bg-white">
                
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Edit Profile</h1>
                    <p className="text-slate-500 text-sm">Update your personal details.</p>
                </div>

                <div className="space-y-6 max-w-sm">
                    
                    {/* Name Input - Padding vertikal dikurangi (py-3) */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                            <User size={16} className="text-blue-900" />
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Sarah Connor"
                            className="w-full px-4 py-3 bg-[#f8fafc] border-2 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-400 focus:bg-white focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 outline-none transition-all duration-200 shadow-sm"
                        />
                    </div>

                    {/* Username Input - Padding vertikal dikurangi (py-3) */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                            <AtSign size={16} className="text-blue-900" />
                            Username
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="sarah.c"
                                className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border-2 border-slate-100 rounded-xl text-slate-900 font-medium text-sm placeholder:text-slate-400 focus:bg-white focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 outline-none transition-all duration-200 shadow-sm"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</div>
                        </div>
                    </div>

                    {/* Action Buttons - Padding dikurangi */}
                    <div className="pt-4 flex items-center gap-3">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={updateProfile}
                            className="flex-1 px-6 py-3 rounded-xl bg-[#0f172a] text-white font-bold text-sm shadow-lg shadow-blue-900/20 hover:bg-blue-800 hover:shadow-blue-800/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>

                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}