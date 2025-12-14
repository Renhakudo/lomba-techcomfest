import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  BookOpen,
  Clock,
  LayoutGrid,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Trophy,
  BarChart3,
  Zap,
  Target,
} from "lucide-react";

// --- Tipe Data ---
interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string; // Bisa HEX (#...) atau Tailwind class (from-x to-y)
  lessons_count: number;
  duration_string: string;
  progress: number;
}

const Modules = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState({
    completed: 0,
    inProgress: 0,
    enrolled: 0,
    totalHours: 0,
  });

  // --- Fetch Data Logic ---
  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const uid = session.user.id;

        const { data: modulesData, error } = await supabase
          .from("modules")
          .select("id, title, description, category, color, lessons(id)")
          .order("id", { ascending: true });

        if (error) {
          console.error("Supabase Error:", error);
          setModules([]);
          setLoading(false);
          return;
        }

        if (!modulesData) {
          setModules([]);
          setLoading(false);
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("completed_lessons")
          .eq("id", uid)
          .single();

        const userCompletedLessons = profileData?.completed_lessons || {};

        let countCompleted = 0;
        let countInProgress = 0;
        let totalMinutesAll = 0;

        const modulesWithProgress = modulesData.map((mod: any) => {
          const totalLessons = mod.lessons?.length || 0;
          const completedCount = userCompletedLessons[mod.id]?.length || 0;

          // Hitung Progress
          const progress =
            totalLessons > 0
              ? Math.round((completedCount / totalLessons) * 100)
              : 0;

          // Update Counter Stats
          if (progress === 100) countCompleted++;
          else if (progress > 0) countInProgress++;

          // ESTMASI DURASI (Asumsi 1 lesson = 15 menit)
          const totalMinutes = totalLessons * 15;
          totalMinutesAll += totalMinutes;

          const hours = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;
          const durationStr =
            hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

          return {
            ...mod,
            lessons_count: totalLessons,
            duration_string: durationStr,
            progress,
            // Fallback warna default jika kosong
            color: mod.color || "from-blue-500 to-indigo-500", 
          };
        });

        const totalEnrolled = countCompleted + countInProgress;

        setStats({
          completed: countCompleted,
          inProgress: countInProgress,
          enrolled: totalEnrolled,
          totalHours: Math.round(totalMinutesAll / 60),
        });

        setModules(modulesWithProgress);
      } catch (err) {
        console.error("Unexpected error:", err);
        setModules([]);
      }
      setLoading(false);
    };

    fetchModules();
  }, []);

  const getStatusIndicator = (progress: number) => {
    if (progress === 100)
      return (
        <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50">
          <CheckCircle2 className="w-5 h-5" />
        </span>
      );
    return null;
  };

  // --- Helper: Handle Color untuk Icon & Progress Bar ---
  const isHexColor = (color: string) => color.startsWith("#") || color.startsWith("rgb");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-10 pb-12 font-sans">
        <div className="container mx-auto px-4 max-w-6xl animate-pulse">
          <div className="h-64 bg-slate-200 rounded-[2.5rem] mb-12 w-full" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 bg-white rounded-3xl border border-slate-100 p-6"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 min-h-screen bg-[#F8FAFC] font-sans text-slate-800 relative selection:bg-indigo-500 selection:text-white">
      <div className="fixed inset-0 h-full w-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 lg:px-8 max-w-7xl pt-10 pb-20">
        
        {/* --- HEADER --- */}
        <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 mb-16 shadow-2xl shadow-slate-900/20 text-white">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-20" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6 text-sm font-medium text-blue-200">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Interactive Learning Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
                Upgrade Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                  Future Skills.
                </span>
              </h1>
              <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
                Track your real progress. Complete modules to unlock new abilities.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl min-w-[140px]">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Completed
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    {stats.completed}
                  </span>
                  <span className="text-sm text-slate-500">
                    / {stats.enrolled} Enrolled
                  </span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl min-w-[140px]">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Learning Focus
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">
                    {stats.inProgress}
                  </span>
                  <span className="text-sm text-slate-500">Active Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- GRID MODULES --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module) => {
            // Cek tipe warna untuk rendering yang benar
            const isHex = isHexColor(module.color);

            return (
              <div
                key={module.id}
                className="group relative bg-white rounded-[2rem] p-2 hover:-translate-y-2 transition-transform duration-300 ease-out shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 border border-slate-100"
              >
                <div className="h-full bg-white rounded-[1.5rem] p-6 flex flex-col relative overflow-hidden">
                  
                  {/* HEADER */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                      {/* Icon Box */}
                      <div
                        className={`w-16 h-16 rounded-2xl p-0.5 shadow-lg ${
                            !isHex ? `bg-gradient-to-br ${module.color}` : ''
                        }`}
                        style={isHex ? { background: module.color } : {}}
                      >
                        <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-[14px] flex items-center justify-center">
                          <BookOpen className="w-7 h-7 text-slate-700" />
                        </div>
                      </div>

                      <div className="pt-1">
                        <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                          {module.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            {module.category}
                          </span>
                          {module.progress > 0 && module.progress < 100 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Zap className="w-3 h-3" /> Active
                            </span>
                          )}
                          {module.progress === 0 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Target className="w-3 h-3" /> Start
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {getStatusIndicator(module.progress)}
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">
                    {module.description}
                  </p>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-3">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <LayoutGrid className="w-3.5 h-3.5" />{" "}
                          {module.lessons_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />{" "}
                          {module.duration_string}
                        </span>
                      </div>
                      {module.progress > 0 && (
                        <span
                          className={
                            module.progress === 100
                              ? "text-emerald-600"
                              : "text-blue-600"
                          }
                        >
                          {module.progress}%
                        </span>
                      )}
                    </div>

                    {/* PROGRESS BAR LOGIC - UPDATED */}
                    {/* Muncul jika progress > 0 (Enroll) */}
                    {module.progress > 0 ? (
                      <div className="h-1.5 w-full bg-slate-100 rounded-full mb-6 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                             module.progress === 100 
                                ? "bg-emerald-500" 
                                : !isHex ? `bg-gradient-to-r ${module.color}` : '' 
                          }`}
                          style={{ 
                              width: `${module.progress}%`,
                              // Jika Hex, pakai style. Jika tidak (class), style background undefined
                              background: (module.progress !== 100 && isHex) ? module.color : undefined
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-px w-full bg-slate-100 mb-6"></div>
                    )}

                    <Link to={`/module/${module.id}`}>
                      <button
                        className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn
                          ${
                            module.progress === 100
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              : module.progress > 0
                              ? "bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20"
                              : "bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
                          }`}
                      >
                        {module.progress === 100
                          ? "Review Module"
                          : module.progress > 0
                          ? "Continue Lesson"
                          : "Start Learning"}

                        {module.progress !== 100 && (
                          <ArrowRight
                            className={`w-4 h-4 transition-transform ${
                              module.progress === 0
                                ? "group-hover/btn:translate-x-1"
                                : ""
                            }`}
                          />
                        )}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Modules;