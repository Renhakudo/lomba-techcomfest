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
  Zap,
} from "lucide-react";

// --- Tipe Data ---
interface Module {
  id: string;
  title: string;
  description: string;
  color: string;
  lessons: { id: number }[];
  lessons_count: number;
  duration: string;
  level: string;
  progress: number;
}

const Modules = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProgress, setTotalProgress] = useState(0);

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

        const { data: modulesData } = await supabase
          .from("modules")
          .select("id, title, description, color, lessons(id)")
          .order("id", { ascending: true });

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

        let totalPercentage = 0;

        const modulesWithProgress = modulesData.map((mod: any) => {
          const totalLessons = mod.lessons?.length || 0;
          const completedCount = userCompletedLessons[mod.id]?.length || 0;
          const progress =
            totalLessons > 0
              ? Math.round((completedCount / totalLessons) * 100)
              : 0;

          totalPercentage += progress;

          return {
            ...mod,
            lessons_count: totalLessons,
            duration: `${totalLessons * 15} min`,
            level: "Beginner",
            progress,
          };
        });

        // Hitung rata-rata progress keseluruhan untuk ditampilkan di header
        if (modulesData.length > 0) {
          setTotalProgress(Math.round(totalPercentage / modulesData.length));
        }

        setModules(modulesWithProgress);
      } catch (err) {
        console.error("Unexpected error:", err);
        setModules([]);
      }
      setLoading(false);
    };

    fetchModules();
  }, []);

  // --- Helper: Badge Status Minimalis ---
  const getStatusIndicator = (progress: number) => {
    if (progress === 100)
      return (
        <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50">
          <CheckCircle2 className="w-5 h-5" />
        </span>
      );
    return null;
  };

  // --- Loading Skeleton Modern ---
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

  // --- Main Render ---
  return (
    <div className="mt-10 min-h-screen bg-[#F8FAFC] font-sans text-slate-800 relative selection:bg-indigo-500 selection:text-white">
      <div className="fixed inset-0 h-full w-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 lg:px-8 max-w-7xl pt-10 pb-20">
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
                Akses modul premium dan lacak perkembangan belajarmu secara
                real-time. Mulai langkah pertamamu hari ini.
              </p>
            </div>

            {/* Stats Card Kecil di Kanan Header */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl w-full md:w-auto min-w-[200px]">
              <div className="flex items-center gap-3 mb-2 text-slate-400 text-sm font-medium">
                <Trophy className="w-4 h-4 text-yellow-400" />
                Overall Progress
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{totalProgress}%</span>
                <span className="text-slate-500 mb-1">completed</span>
              </div>
              {/* Mini Progress Bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- 3. GRID MODULES (Cards) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module) => (
            <div
              key={module.id}
              className="group relative bg-white rounded-[2rem] p-2 hover:-translate-y-2 transition-transform duration-300 ease-out shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 border border-slate-100"
            >
              {/* Card Inner Content */}
              <div className="h-full bg-white rounded-[1.5rem] p-6 flex flex-col relative overflow-hidden">
                {/* Header Card: Icon & Title */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    {/* Modern Glassy Icon */}
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} p-0.5 shadow-lg`}
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
                          {module.level}
                        </span>
                        {module.progress > 0 && module.progress < 100 && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Checkmark jika selesai */}
                  {getStatusIndicator(module.progress)}
                </div>

                {/* Description */}
                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2">
                  {module.description}
                </p>

                {/* Footer Section */}
                <div className="mt-auto">
                  {/* Progress Info */}
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-3">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <LayoutGrid className="w-3.5 h-3.5" />{" "}
                        {module.lessons_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {module.duration}
                      </span>
                    </div>
                    <span
                      className={
                        module.progress === 100
                          ? "text-emerald-600"
                          : "text-blue-600"
                      }
                    >
                      {module.progress}%
                    </span>
                  </div>

                  {/* Progress Bar Line */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full mb-6 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        module.progress === 100
                          ? "bg-emerald-500"
                          : `bg-gradient-to-r ${module.color}`
                      }`}
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>

                  {/* Big Button */}
                  <Link to={`/module/${module.id}`}>
                    <button
                      className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn
                         ${
                           module.progress === 100
                             ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                             : "bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20"
                         }`}
                    >
                      {module.progress === 100
                        ? "Review Module"
                        : module.progress > 0
                        ? "Continue Lesson"
                        : "Start Learning"}
                      {module.progress !== 100 && (
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      )}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Modules;
