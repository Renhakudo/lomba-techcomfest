import { useEffect, useState } from "react";
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setName(data.name || "");
      setUsername(data.username || "");
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

      const { data: { user } } = await supabase.auth.getUser();

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrlData.publicUrl });
      alert("Avatar updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  }

  async function updateProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          username,
        })
        .eq("id", user.id);

      if (error) throw error;

      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  }

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Profile</h1>

        <div className="bg-white shadow-md rounded-xl p-6 border">
          
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={profile?.avatar_url || "/default-avatar.png"}
              alt="avatar"
              className="w-32 h-32 rounded-full object-cover border shadow-sm"
            />

            <label className="mt-4 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm border transition">
              {uploading ? "Uploading..." : "Change Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                hidden
              />
            </label>
          </div>

          {/* Form */}
          <div className="space-y-5">

            {/* Name */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="@username"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button className="px-5 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 transition">
              Cancel
            </button>
            <button
              onClick={updateProfile}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow"
            >
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
