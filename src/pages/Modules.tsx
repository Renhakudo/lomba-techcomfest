import { useEffect, useState, useMemo } from "react";
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
  Search,
  Filter,
  Check,
} from "lucide-react";

// --- Tipe Data ---
interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string;
  lessons_count: number;
  duration_string: string;
  progress: number;
  topics: string[]; // Field baru untuk poin materi
}

// Helper untuk generate poin materi dummy (karena di DB belum ada)
const generateTopics = (title: string, category: string) => {
  const t = title.toLowerCase();
  if (t.includes("python")) return ["Syntax Dasar", "Loops & Functions", "Data Structures"];
  if (t.includes("html") || t.includes("web")) return ["Structure HTML5", "CSS Styling", "Responsive Layout"];
  if (t.includes("ai") || t.includes("machine")) return ["Konsep Dasar AI", "Model Training", "Prompt Engineering"];
  if (t.includes("scratch") || t.includes("visual")) return ["Block Logic", "Animation", "Interactive Games"];
  if (t.includes("computational") || t.includes("berpikir")) return ["Decomposition", "Pattern Recognition", "Algorithmic Design"];
  if (t.includes("security") || t.includes("siber")) return ["Data Privacy", "Phishing Awareness", "Secure Passwords"];
  return ["Fundamental Concepts", "Practical Exercises", "Final Project"];
};

const Modules = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE UNTUK SEARCH & FILTER ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const uid = session.user.id;

        const { data: modulesData, error } = await supabase
          .from("modules")
          .select("id, title, description, category, color, lessons(id)")
          .order("id", { ascending: true });

        if (error) throw error;
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

          const progress = totalLessons > 0
              ? Math.round((completedCount / totalLessons) * 100)
              : 0;

          if (progress === 100) countCompleted++;
          else if (progress > 0) countInProgress++;

          const totalMinutes = totalLessons * 15;
          totalMinutesAll += totalMinutes;
          const hours = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;
          const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

          return {
            ...mod,
            lessons_count: totalLessons,
            duration_string: durationStr,
            progress,
            color: mod.color || "from-blue-500 to-indigo-500",
            // Generate topik otomatis biar tampilan tidak kosong
            topics: generateTopics(mod.title, mod.category) 
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
        console.error("Error:", err);
      }
      setLoading(false);
    };

    fetchModules();
  }, []);

  // --- FILTERING LOGIC ---
  // 1. Ambil list kategori unik untuk tombol filter
  const categories = useMemo(() => {
    const cats = modules.map(m => m.category);
    return ["All", ...new Set(cats)];
  }, [modules]);

  // 2. Filter modules berdasarkan search & category
  const filteredModules = modules.filter((mod) => {
    const matchesSearch = mod.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || mod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Helper Styling
  const getStatusIndicator = (progress: number) => {
    if (progress === 100)
      return (
        <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50">
          <CheckCircle2 className="w-5 h-5" />
        </span>
      );
    return null;
  };
  
  const isHexColor = (color: string) => color.startsWith("#") || color.startsWith("rgb");

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-10 pb-12 font-sans">
        <div className="container mx-auto px-4 max-w-6xl animate-pulse">
           {/* Skeleton Loading */}
           <div className="h-64 bg-slate-200 rounded-[2.5rem] mb-12 w-full" />
           <div className="h-12 w-64 bg-slate-200 rounded-xl mb-8" />
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="h-64 bg-white rounded-3xl border border-slate-100" />
              ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 min-h-screen bg-[#F8FAFC] font-sans text-slate-800 relative selection:bg-indigo-500 selection:text-white">
      {/* Background decoration */}
      <div className="fixed inset-0 h-full w-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 lg:px-8 max-w-7xl pt-10 pb-20">
        
        {/* --- HEADER STATS --- */}
        <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-2xl shadow-slate-900/20 text-white">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-20" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6 text-sm font-medium text-blue-200">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Interactive Learning Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                Upgrade Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                  Future Skills.
                </span>
              </h1>
              <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
                Track your real progress. Complete modules to unlock new abilities.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl min-w-[140px]">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                  <Trophy className="w-4 h-4 text-yellow-400" /> Completed
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{stats.completed}</span>
                  <span className="text-sm text-slate-500">/ {stats.enrolled} Enrolled</span>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl min-w-[140px]">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" /> Active
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{stats.inProgress}</span>
                  <span className="text-sm text-slate-500">Learning</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SEARCH & FILTER SECTION --- */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
            {/* Filter Categories */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                                ${selectedCategory === cat 
                                    ? "bg-slate-900 text-white shadow-md" 
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
            </div>
        </div>

        {/* --- GRID MODULES (2 COLUMNS) --- */}
        {filteredModules.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredModules.map((module) => {
            const isHex = isHexColor(module.color);

            return (
              <div
                key={module.id}
                className="group relative bg-white rounded-[2rem] p-2 hover:-translate-y-1 transition-transform duration-300 ease-out shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/5 border border-slate-100 flex flex-col"
              >
                <div className="h-full bg-white rounded-[1.5rem] p-7 flex flex-col relative overflow-hidden">
                  
                  {/* --- CARD HEADER --- */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-5">
                      {/* Icon */}
                      <div
                        className={`w-16 h-16 shrink-0 rounded-2xl p-0.5 shadow-md ${!isHex ? `bg-gradient-to-br ${module.color}` : ''}`}
                        style={isHex ? { background: module.color } : {}}
                      >
                        <div className="w-full h-full bg-white/95 backdrop-blur-sm rounded-[14px] flex items-center justify-center">
                          <BookOpen className="w-7 h-7 text-slate-700" />
                        </div>
                      </div>

                      <div className="pt-1">
                        <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                          {module.title}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                           {/* Category Badge */}
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {module.category}
                          </span>

                           {/* Status Badge */}
                          {module.progress > 0 && module.progress < 100 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md flex items-center gap-1">
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

                  {/* --- DESCRIPTION & TOPICS --- */}
                  <div className="mb-8 space-y-4">
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                        {module.description}
                      </p>
                      
                      {/* Topics List (Detail tambahan) */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">What you'll learn:</p>
                          <ul className="space-y-1">
                              {module.topics.map((topic, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                      <Check className="w-3.5 h-3.5 text-blue-500" />
                                      {topic}
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>

                  {/* --- FOOTER (Progress & Action) --- */}
                  <div className="mt-auto pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                          <LayoutGrid className="w-3.5 h-3.5 text-slate-500" /> {module.lessons_count} Lessons
                        </span>
                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> {module.duration_string}
                        </span>
                      </div>
                      {module.progress > 0 && (
                        <span className={module.progress === 100 ? "text-emerald-600" : "text-blue-600"}>
                          {module.progress}%
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {module.progress > 0 && (
                      <div className="h-1.5 w-full bg-slate-100 rounded-full mb-6 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                             module.progress === 100 ? "bg-emerald-500" : !isHex ? `bg-gradient-to-r ${module.color}` : '' 
                          }`}
                          style={{ 
                              width: `${module.progress}%`,
                              background: (module.progress !== 100 && isHex) ? module.color : undefined
                          }}
                        />
                      </div>
                    )}

                    <Link to={`/module/${module.id}`}>
                      <button
                        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn
                          ${
                            module.progress === 100
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              : module.progress > 0
                              ? "bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/20"
                              : "bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
                          }`}
                      >
                        {module.progress === 100 ? "Review Module" : module.progress > 0 ? "Continue Lesson" : "Start Learning"}
                        {module.progress !== 100 && (
                          <ArrowRight className={`w-4 h-4 transition-transform ${module.progress === 0 ? "group-hover/btn:translate-x-1" : ""}`} />
                        )}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        ) : (
            // EMPTY STATE (Kalau search tidak ketemu)
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No modules found</h3>
                <p className="text-slate-500">Try adjusting your search or filter to find what you're looking for.</p>
                <button 
                    onClick={() => {setSearchQuery(""); setSelectedCategory("All")}}
                    className="mt-4 text-blue-600 font-semibold hover:underline"
                >
                    Clear Filters
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Modules;