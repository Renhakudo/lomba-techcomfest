import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Calendar, TrendingUp, BookOpen, MessageCircle } from "lucide-react";

interface ModuleProgress {
  id: string;
  title: string;
  lessons_count: number;
  completed: number;
  progress: number;
}

// interface WeeklyActivity {
//   day: string;
//   hours: number;
// }

// interface Achievement {
//   name: string;
//   date: string;
//   icon: string;
// }

const moduleColors: Record<string, string> = {
  "1": "#4d97f3",
  "2": "#4dbf72",
  "3": "#fcba03",
  "4": "#ff6b6b",
};

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [modulesProgress, setModulesProgress] = useState<ModuleProgress[]>([]);
  // const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]); 
  // const [achievements, setAchievements] = useState<Achievement[]>([]); 
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

        // Fetch activity & badges kept if needed later
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const getDayStreak = () => {
    if (!profile?.created_at) return 1;
    const createdAt = new Date(profile.created_at);
    const now = new Date();
    const diffTime = now.getTime() - createdAt.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const modulesDoneCount = modulesProgress.filter(
    (m) => m.progress === 100
  ).length;

  const modulesTotal = modulesProgress.length;
  const overallPercent =
    modulesTotal > 0 ? Math.round((modulesDoneCount / modulesTotal) * 100) : 0;

  // --- SKELETON LOADING STATE ---
  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        {/* Skeleton Sidebar */}
        <div className="bg-white border-r hidden md:block w-[360px] fixed left-0 top-0 h-screen overflow-y-auto p-6 pt-24 pb-10 z-10">
          <Card className="w-full shadow-md border rounded-2xl p-6">
            <div className="flex flex-col items-center animate-pulse">
              {/* Avatar Skeleton */}
              <div className="w-28 h-28 rounded-full bg-gray-200" />
              
              {/* Name & Username Skeleton */}
              <div className="mt-4 h-8 w-48 bg-gray-200 rounded" />
              <div className="mt-2 h-4 w-32 bg-gray-200 rounded" />

              {/* Stats Skeleton */}
              <div className="mt-6 w-full space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                  <div className="h-4 w-8 bg-gray-200 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-12 bg-gray-200 rounded" />
                </div>
              </div>

              {/* Buttons Skeleton */}
              <div className="mt-6 w-full space-y-3">
                <div className="h-10 w-full bg-gray-200 rounded" />
                <div className="h-10 w-full bg-gray-200 rounded" />
              </div>
            </div>
          </Card>
        </div>

        {/* Skeleton Right Content */}
        <div className="flex-1 md:ml-[360px] p-6 pt-24 pb-6 flex flex-col gap-6 md:h-screen md:overflow-hidden h-auto">
          {/* Top Stats Skeleton */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-shrink-0">
             {/* Card 1 Skeleton */}
            <div className="h-[200px] rounded-3xl bg-gray-200 animate-pulse" />
             {/* Card 2 Skeleton */}
            <div className="h-[200px] rounded-3xl bg-gray-200 animate-pulse" />
          </div>

          {/* List Skeleton */}
          <Card className="shadow-md border rounded-2xl flex flex-col flex-1 min-h-0 overflow-hidden">
            <CardHeader className="bg-white z-20 border-b pb-4 pt-6 px-6 flex-shrink-0">
               <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="p-6 space-y-4 overflow-y-hidden">
               {/* List Items Skeleton (3 items) */}
               {[1, 2, 3].map((i) => (
                 <div key={i} className="h-24 w-full bg-gray-100 rounded-xl animate-pulse" />
               ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile)
    return <div className="p-8 text-center">Profile not found.</div>;

  // --- MAIN CONTENT ---
  return (
    <div className="flex bg-gray-50 min-h-screen">
      
      {/* --- SIDEBAR --- */}
      <div className="bg-white border-r hidden md:block w-[360px] fixed left-0 top-0 h-screen overflow-y-auto p-6 pt-24 pb-10 z-10">
        <Card className="w-full shadow-md border rounded-2xl p-6">
          <div className="flex flex-col items-center">
            <Avatar className="w-28 h-28">
              {profile.avatar_url ? (
                <AvatarImage
                  src={profile.avatar_url}
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <AvatarFallback className="bg-primary text-white text-4xl">
                  {profile.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>

            <h1 className="mt-4 text-2xl font-bold text-center">
              {profile.name}
            </h1>
            <p className="text-gray-500 text-sm">@{profile.username}</p>

            <div className="mt-6 w-full space-y-4 text-sm">
              <div className="flex justify-between">
                <span>Streak</span>
                <span className="font-semibold">{getDayStreak()} 🔥</span>
              </div>
              <div className="flex justify-between">
                <span>Modules Completed</span>
                <span className="font-semibold">
                  {modulesDoneCount}/{modulesTotal}
                </span>
              </div>
            </div>

            <div className="mt-6 w-full space-y-3">
              <Link to="/modules">
                <Button className="w-full">Continue Learning</Button>
              </Link>

              <Link to="/profilepage">
                <Button variant="outline" className="w-full mt-3">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* --- RIGHT CONTENT --- */}
      <div className="flex-1 md:ml-[360px] p-6 pt-24 pb-6 flex flex-col gap-6 md:h-screen md:overflow-hidden h-auto">
        
        {/* TOP STATS CARDS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-shrink-0">
          {/* Module Progress Card (Blue) */}
          <div
            className="rounded-3xl overflow-hidden shadow-lg bg-gradient-to-br from-[#4a90e2] to-[#50c9ce]
             transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-200/50 hover:-translate-y-1"
          >
            <div className="p-6 flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-inner">
                <BookOpen className="w-7 h-7 text-white" />
              </div>

              <div className="flex-1 text-white">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold">
                    {modulesDoneCount}/{modulesTotal}
                  </span>
                  <span className="text-sm opacity-90">Modules Done</span>
                </div>

                <p className="text-xs opacity-90 mt-1">
                  Overall completion: {overallPercent}%
                </p>

                <div className="mt-4 bg-white/30 rounded-full h-2 w-full overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${overallPercent}%`,
                      background: "linear-gradient(90deg,#A2D2FF,#CDB4DB)",
                    }}
                  />
                </div>
              </div>

              <div className="text-right text-white/90 text-xs">
                <div className="font-semibold">{overallPercent}%</div>
                <div className="opacity-80">Progress</div>
              </div>
            </div>

            <Link to="/modules">
              <div className="bg-white/10 backdrop-blur-md p-3 text-xs text-gray-100 text-center cursor-pointer hover:bg-white/20 transition-colors">
                Klik untuk melihat modul atau lanjutkan belajar.
              </div>
            </Link>
          </div>

          {/* Streak Card (Orange) */}
          <div
            className="rounded-3xl overflow-hidden shadow-lg bg-gradient-to-br from-[#ff8a3d] to-[#ff7f50]
             transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-200/50 hover:-translate-y-1"
          >
            <div className="p-6 flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-inner">
                <Calendar className="w-7 h-7 text-white" />
              </div>

              <div className="flex-1 text-white">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold">
                    {getDayStreak()} 🔥
                  </span>
                  <span className="text-sm opacity-90">Day Streak</span>
                </div>

                <p className="text-xs opacity-90 mt-1">
                  Great job! teruskan kebiasaan belajarmu.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] bg-white/30 backdrop-blur-md px-3 py-1 rounded-full">
                    +1 hari jika belajar hari ini
                  </span>
                  <span className="text-[11px] bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                    Target: 10 hari
                  </span>
                </div>
              </div>

              <div className="text-right text-white/90 text-xs">
                <div className="font-semibold">Streak</div>
                <div className="opacity-80">Keep it up!</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3 text-xs text-gray-100 text-center cursor-default">
              Tetap konsisten setiap hari!
            </div>
          </div>
        </div>

        {/* LEARNING PROGRESS LIST */}
        <Card className="shadow-md border rounded-2xl flex flex-col flex-1 min-h-0 overflow-hidden">
          <CardHeader className="bg-white z-20 border-b pb-4 pt-6 px-6 flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-5 h-5" />
              Learning Progress
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-4 overflow-y-auto scroll-smooth">
            <div className="grid gap-4">
              {modulesProgress.map((m) => (
                <div
                  key={m.id}
                  className="group relative bg-white border border-gray-100 rounded-xl p-4 shadow-sm 
               hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  {/* HEADER */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* 🔵 ICON MODULE */}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
                        style={{
                          background: moduleColors[m.id] || "#4d97f3",
                        }}
                      >
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>

                      <div className="flex flex-col leading-tight">
                        <span className="font-semibold text-sm text-gray-900">
                          {m.title}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {m.lessons_count} Lessons
                        </span>
                      </div>
                    </div>

                    <span className="font-semibold text-primary text-sm">
                      {m.progress}%
                    </span>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="mt-3 relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${m.progress}%`,
                        background: `linear-gradient(90deg, #3b82f6, #06b6d4)`,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-gray-600">
                      {m.completed}/{m.lessons_count} completed
                    </span>

                    <span
                      className={`px-2 py-[2px] rounded-full text-[10px] font-medium 
                        ${
                          m.progress === 100
                            ? "bg-green-100 text-green-700"
                            : m.progress > 0
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {m.progress === 100
                        ? "Completed"
                        : m.progress > 0
                        ? "In Progress"
                        : "Not Started"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Spacer di bawah agar item terakhir tidak terlalu mepet saat discroll */}
            <div className="h-4"></div>
          </CardContent>
        </Card>
      </div>

      {/* MOBILE PROFILE (Visible only on mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t p-4 z-50">
        <Link to="/profilepage">
           <Button className="w-full">View My Profile</Button>
        </Link>
      </div>
      
    </div>
  );
};

export default Dashboard;