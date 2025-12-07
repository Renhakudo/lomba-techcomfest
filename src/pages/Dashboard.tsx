import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import {
  BarChart,
  Calendar,
  TrendingUp,
  BookOpen,
  Trophy,
} from "lucide-react";

interface ModuleProgress {
  id: string;
  title: string;
  lessons_count: number;
  completed: number;
  progress: number;
}

interface WeeklyActivity {
  day: string;
  hours: number;
}

interface Achievement {
  name: string;
  date: string;
  icon: string;
}

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [modulesProgress, setModulesProgress] = useState<ModuleProgress[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        // Ambil user
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) {
          setLoading(false);
          return;
        }

        // Ambil profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData);

        // Ambil modules
        const { data: modulesData } = await supabase
          .from("modules")
          .select("id, title, lessons(id)")
          .order("id", { ascending: true });

        // Ambil completed lessons dari profile
        const completedLessons: Record<string, number[]> = profileData?.completed_lessons || {};

        // Hitung progress per module
        const modulesWithProgress: ModuleProgress[] = (modulesData || []).map((mod: any) => {
          const totalLessons = mod.lessons?.length || 0;
          const completedCount = completedLessons[mod.id]?.length || 0;
          const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
          return {
            id: mod.id,
            title: mod.title,
            lessons_count: totalLessons,
            completed: completedCount,
            progress,
          };
        });
        setModulesProgress(modulesWithProgress);

        // Weekly activity
        const { data: activityData } = await supabase
          .from("user_activity")
          .select("day, hours")
          .eq("user_id", user.id);
        setWeeklyActivity(activityData || []);

        // Achievements / Badges
        const { data: badgesData } = await supabase
          .from("user_badges")
          .select("name, date, icon")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(5);
        setAchievements(badgesData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const Skeleton = ({ className }: { className: string }) => (
    <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
  );

  const getDayStreak = () => {
    if (!profile?.created_at) return 1;
    const createdAt = new Date(profile.created_at);
    const now = new Date();
    const diffTime = now.getTime() - createdAt.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!profile) return <div className="p-8 text-center">Profile not found.</div>;

  const maxHours = Math.max(...weeklyActivity.map((d) => d.hours), 1);

  return (
    <div className="flex bg-gray-50 h-screen max-h-screen overflow-hidden">
      {/* LEFT PROFILE */}
      <div className="bg-white shadow-xl border p-6 pt-20 rounded-none w-full md:w-[360px] md:fixed md:left-0 md:top-0 md:h-screen md:overflow-hidden">
        <Card className="w-full shadow-md border rounded-2xl p-6">
          <div className="flex flex-col items-center">
            <Avatar className="w-28 h-28">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} className="object-cover" referrerPolicy="no-referrer" />
              ) : (
                <AvatarFallback className="bg-primary text-white text-4xl">
                  {profile.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>

            <h1 className="mt-4 text-2xl font-bold">{profile.name}</h1>
            <p className="text-gray-500 text-sm">@{profile.username}</p>

            <div className="mt-3 px-4 py-1 text-sm rounded-full bg-blue-600 text-white shadow">
              Level {profile.level ?? 1}
            </div>

            <div className="mt-6 w-full space-y-4">
              <div className="flex justify-between text-sm">
                <span>Total Points</span>
                <span className="font-semibold">{profile.total_points ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Streak</span>
                <span className="font-semibold">{getDayStreak()} 🔥</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Modules Completed</span>
                <span className="font-semibold">
                  {modulesProgress.filter((m) => m.progress === 100).length}/{modulesProgress.length}
                </span>
              </div>
            </div>

            <div className="mt-6 w-full space-y-3">
              <Link to="/modules">
                <Button className="w-full">Continue Learning</Button>
              </Link>
            <div className="mt-6 w-full space-y-3">
              <Link to="/profilepage">
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </div>
            </div>
          </div>
        </Card>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 md:ml-[360px] overflow-y-scroll p-6 space-y-8 max-h-screen">
        {/* Stats Row */}
        <div className="grid sm:grid-cols-3 gap-6">
          <Card className="p-5 shadow-md border rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">
                  {modulesProgress.filter((m) => m.progress === 100).length}/{modulesProgress.length}
                </p>
                <p className="text-sm text-gray-500">Modules Done</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 shadow-md border rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-secondary">{achievements.length}</p>
                <p className="text-sm text-gray-500">Badges</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 shadow-md border rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-500">{getDayStreak()} 🔥</p>
                <p className="text-sm text-gray-500">Day Streak</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Learning Progress */}
        <Card className="shadow-md border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-5 h-5" />
              Learning Progress
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {modulesProgress.map((m) => (
              <div key={m.id}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{m.title}</span>
                  <span className="text-primary font-semibold">{m.progress}%</span>
                </div>
                <Progress value={m.progress} className="h-3" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Learning Hours */}
        <Card className="shadow-md border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart className="w-5 h-5" />
              Weekly Learning Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-4 h-48">
              {weeklyActivity.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-3">
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className="w-full bg-primary rounded-t-lg"
                      style={{ height: `${(d.hours / maxHours) * 100}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-500">{d.day}</div>
                    <div className="text-xs text-primary font-bold">{d.hours}h</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card className="shadow-md border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievements.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-accent/10 border rounded-xl">
                <div className="text-3xl">{a.icon}</div>
                <div>
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
