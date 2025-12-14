import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { TrendingUp, BookOpen, MessageCircle, Clock, Award, Zap } from "lucide-react"; // Tambah Icon

interface ModuleProgress {
  id: string;
  title: string;
  lessons_count: number;
  completed: number;
  progress: number;
}

const moduleColors: Record<string, string> = {
  "1": "#4d97f3",
  "2": "#4dbf72",
  "3": "#fcba03",
  "4": "#ff6b6b",
};

// Data Dummy untuk Skills (Bisa nanti diambil dari DB)
const earnedSkills = [
  { name: "Comp. Thinking", color: "bg-blue-100 text-blue-700" },
  { name: "Algorithm", color: "bg-purple-100 text-purple-700" },
  { name: "Problem Solving", color: "bg-green-100 text-green-700" },
];

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [modulesProgress, setModulesProgress] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData);

        const { data: modulesData } = await supabase
          .from("modules")
          .select("id, title, lessons(id)")
          .order("id", { ascending: true });

        const completedLessons: Record<string, number[]> =
          profileData?.completed_lessons || {};

        const modulesWithProgress: ModuleProgress[] = (modulesData || []).map(
          (mod: any) => {
            const totalLessons = mod.lessons?.length || 0;
            const completedCount = completedLessons[mod.id]?.length || 0;
            const progress =
              totalLessons > 0
                ? Math.round((completedCount / totalLessons) * 100)
                : 0;

            return {
              id: mod.id,
              title: mod.title,
              lessons_count: totalLessons,
              completed: completedCount,
              progress,
            };
          }
        );

        setModulesProgress(modulesWithProgress);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const modulesDoneCount = modulesProgress.filter(
    (m) => m.progress === 100
  ).length;

  const modulesTotal = modulesProgress.length;
  const overallPercent =
    modulesTotal > 0 ? Math.round((modulesDoneCount / modulesTotal) * 100) : 0;
  
  // Hitung estimasi jam belajar (Dummy logic: 1 module = 2.5 jam)
  const learningHours = (modulesDoneCount * 2.5) + (overallPercent / 100); 

  // --- SKELETON LOADING STATE ---
  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <div className="bg-white border-r hidden md:block w-[360px] fixed left-0 top-0 h-screen overflow-y-auto p-6 pt-24 pb-10 z-10">
          <Card className="w-full shadow-md border rounded-2xl p-6">
            <div className="flex flex-col items-center animate-pulse">
              <div className="w-28 h-28 rounded-full bg-gray-200" />
              <div className="mt-4 h-8 w-48 bg-gray-200 rounded" />
              <div className="mt-6 w-full space-y-3">
                <div className="h-10 w-full bg-gray-200 rounded" />
                <div className="h-10 w-full bg-gray-200 rounded" />
              </div>
            </div>
          </Card>
        </div>
        <div className="flex-1 md:ml-[360px] p-6 pt-24 pb-6 flex flex-col gap-6 md:h-screen md:overflow-hidden h-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-shrink-0">
            <div className="h-[200px] rounded-3xl bg-gray-200 animate-pulse" />
            <div className="h-[200px] rounded-3xl bg-gray-200 animate-pulse" />
          </div>
          <Card className="shadow-md border rounded-2xl flex-1">
             <div className="h-64 bg-gray-100 rounded-xl animate-pulse m-6" />
          </Card>
        </div>
      </div>
    );
  }

  if (!profile)
    return <div className="p-8 text-center">Profile not found.</div>;

  const sortedModules = [...modulesProgress].sort((a, b) => {
    // Logic sorting tetap sama
    const group = (m: ModuleProgress) =>
      m.progress > 0 && m.progress < 100 ? 0 : m.progress === 100 ? 1 : 2;
    const ga = group(a);
    const gb = group(b);
    if (ga !== gb) return ga - gb;
    if (ga === 0) return b.progress - a.progress;
    if (ga === 1) return a.title.localeCompare(b.title);
    return a.title.localeCompare(b.title);
  });

  // --- MAIN CONTENT ---
  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* --- SIDEBAR --- */}
      <div className="bg-white border-r hidden md:block w-[360px] fixed left-0 top-0 h-screen overflow-y-auto p-6 pt-24 pb-10 z-10">
        <Card className="w-full shadow-md border rounded-2xl p-6">
          <div className="flex flex-col items-center">
            <Avatar className="w-28 h-28 ring-4 ring-offset-2 ring-blue-50">
              {profile.avatar_url ? (
                <AvatarImage
                  src={profile.avatar_url}
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-4xl">
                  {profile.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>

            <h1 className="mt-4 text-2xl font-bold text-center text-gray-800">
              {profile.name}
            </h1>
            <p className="text-gray-500 text-sm font-medium">@{profile.username}</p>

            <div className="mt-6 w-full space-y-3">
              <Link to="/modules">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                    Continue Learning
                </Button>
              </Link>
              <Link to="/profilepage">
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </div>

            {/* --- BARU: BAGIAN SKILLS / ACHIEVEMENTS --- */}
            <div className="mt-8 w-full">
                <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold text-sm uppercase tracking-wider">
                    <Award className="w-4 h-4 text-orange-500" />
                    Skills Acquired
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* Logika dummy: Jika user sudah menyelesaikan setidaknya 1 modul, tampilkan skills */}
                    {modulesDoneCount > 0 ? (
                        earnedSkills.map((skill, idx) => (
                            <span key={idx} className={`px-3 py-1 rounded-full text-xs font-bold border ${skill.color}`}>
                                {skill.name}
                            </span>
                        ))
                    ) : (
                        <div className="text-xs text-gray-400 italic text-center w-full py-2 bg-gray-50 rounded-lg border border-dashed">
                            Complete modules to unlock skills!
                        </div>
                    )}
                </div>
            </div>
            {/* ------------------------------------------ */}

          </div>
        </Card>
      </div>

      {/* --- RIGHT CONTENT --- */}
      <div className="flex-1 md:ml-[360px] p-4 pt-24 pb-6 flex flex-col gap-6 md:h-screen md:overflow-hidden h-auto">
        
        {/* TOP STATS CARDS (GRID KEMBALI JADI 2 KOLOM) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-shrink-0">
          
          {/* CARD 1: MODULE PROGRESS (BIRU) */}
          <div
            className="rounded-3xl overflow-hidden shadow-sm bg-gradient-to-br from-[#4a90e2] to-[#50c9ce]
              transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-200
              h-full flex flex-col relative group"
          >
             {/* Hiasan Background */}
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                <BookOpen size={120} color="white" />
            </div>

            <div className="p-6 flex items-center gap-5 flex-1 z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                <BookOpen className="w-7 h-7 text-white" />
              </div>

              <div className="flex-1 text-white">
                <div className="text-xs font-medium text-blue-100 uppercase tracking-wide">Overall Progress</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {overallPercent}%
                  </span>
                  <span className="text-sm opacity-80">Completed</span>
                </div>
                
                <div className="mt-3 bg-black/10 rounded-full h-2 w-full overflow-hidden backdrop-blur-sm border border-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out bg-white"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-blue-50 text-right">
                    {modulesDoneCount} of {modulesTotal} modules
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: BARU - LEARNING HOURS (UNGU) */}
          <div
            className="rounded-3xl overflow-hidden shadow-sm bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]
              transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-200
              h-full flex flex-col relative group"
          >
            {/* Hiasan Background */}
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:rotate-12 transition-transform">
                <Clock size={120} color="white" />
            </div>

            <div className="p-6 flex items-center gap-5 flex-1 z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                <Clock className="w-7 h-7 text-white" />
              </div>

              <div className="flex-1 text-white">
                <div className="text-xs font-medium text-indigo-100 uppercase tracking-wide">Total Learning Time</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold tracking-tight">
                    {Math.floor(learningHours)}<span className="text-lg">h</span> {(learningHours % 1 * 60).toFixed(0)}<span className="text-lg">m</span>
                  </span>
                </div>
                
                <div className="mt-2 text-xs text-indigo-100/90 leading-relaxed">
                   Great consistency! You've invested quality time in your future skills.
                </div>
                
                <div className="mt-3 flex items-center gap-2">
                    <div className="px-2 py-1 rounded bg-white/20 backdrop-blur text-[10px] font-semibold text-white flex items-center gap-1">
                        <Zap size={10} className="text-yellow-300 fill-yellow-300"/> Productive
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LEARNING PROGRESS LIST */}
        <Card className="shadow-md border rounded-2xl flex flex-col flex-1 min-h-0 overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-white/50 z-20 border-b pb-4 p-4 px-6 flex-shrink-0 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Learning Progress
            </CardTitle>
            {/* Badge kecil info jumlah modul */}
            <span className="text-xs font-medium px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                {modulesTotal} Courses Available
            </span>
          </CardHeader>

          <CardContent className="p-6 space-y-4 overflow-y-auto scroll-smooth custom-scrollbar">
            <div className="grid gap-4">
              {sortedModules.map((m) => (
                <div
                  key={m.id}
                  className="group relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm 
                   hover:shadow-lg hover:border-blue-100 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Icon Container with dynamic color */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300"
                        style={{
                          background: `${moduleColors[m.id] || "#4d97f3"}20`, // 20% opacity for bg
                        }}
                      >
                        <MessageCircle 
                            className="w-6 h-6" 
                            style={{ color: moduleColors[m.id] || "#4d97f3" }}
                        />
                      </div>

                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {m.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                             <span className="text-[11px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-center min-w-[60px]">
                                {m.lessons_count} Lessons
                            </span>
                             {m.progress === 100 && (
                                 <span className="text-[10px] flex items-center gap-1 text-green-600 font-bold">
                                     <Award size={10} /> Completed
                                 </span>
                             )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <span className="font-extrabold text-lg text-gray-700">
                        {m.progress}%
                        </span>
                    </div>
                  </div>

                  {/* Progress Bar Style Baru */}
                  <div className="mt-4 relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${m.progress}%`,
                        background: moduleColors[m.id] || "#4d97f3",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-4"></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;