import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function EditProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [uploading, setUploading] = useState(false);

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

  async function uploadAvatar(e) {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

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
    } finally {
      setUploading(false);
    }
  }

  async function updateProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("profiles")
      .update({ name, username })
      .eq("id", user.id);

    alert("Profile updated!");
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#f8f9fc] pt-16 px-6 relative overflow-hidden">
      {/* Decorative lights */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-300/20 blur-[140px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-300/20 blur-[150px] rounded-full -z-10" />

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-500 mt-2 text-lg">
          Manage your personal information
        </p>
      </div>

      {/* Card */}
      <div className="max-w-2xl mx-auto bg-white/70 backdrop-blur-xl border border-gray-300/40 shadow-xl rounded-3xl p-10">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <img
              src={profile?.avatar_url || "/default-avatar.png"}
              className="w-40 h-40 rounded-full object-cover shadow-xl border
              transition-all group-hover:scale-105 group-hover:shadow-2xl"
            />

            {/* Glow */}
            <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-2xl -z-10"></div>

            {/* Camera Button */}
            <label
              className="absolute bottom-2 right-2 bg-white p-3 rounded-full shadow-md cursor-pointer
              hover:bg-gray-100 transition flex items-center justify-center"
            >
              <Camera size={20} className="text-gray-700" />
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
              />
            </label>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Full Name */}
          <div className="relative">
            <label className="block font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 bg-white/70
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
              placeholder="Your full name"
            />
          </div>

          {/* Username */}
          <div className="relative">
            <label className="block font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 bg-white/70
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
              placeholder="Your username"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-10">
          <button
            onClick={updateProfile}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600
            text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
