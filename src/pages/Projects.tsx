import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  Rocket,
  Search,
  Clock,
  Code2,
  ArrowRight,
  Heart,
  Download,
  GraduationCap,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// --- Tipe Data ---
interface Project {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  tools: string[];
  subject_integration: string;
  duration: string;
  likes_count: number;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE UNTUK SEARCH & FILTER ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Semua");

  // --- Fetch Data Logic ---
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("likes_count", { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        console.error("Gagal memuat proyek:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // --- FILTERING LOGIC ---
  const difficulties = ["Semua", "Pemula", "Menengah", "Lanjut"];

  const filteredProjects = projects.filter((proj) => {
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          proj.subject_integration.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "Semua" || proj.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  // Helper untuk warna badge kesulitan
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "Pemula": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Menengah": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Lanjut": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  // Helper untuk icon tools
  const getToolIcon = (tool: string) => {
    const t = tool.toLowerCase();
    if (t.includes("scratch")) return "🐱";
    if (t.includes("python")) return "🐍";
    if (t.includes("web") || t.includes("html") || t.includes("js")) return "🌐";
    if (t.includes("ai") || t.includes("teachable") || t.includes("machine")) return "🤖";
    if (t.includes("tinkercad") || t.includes("arduino")) return "🔌";
    return "💻";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 font-sans">
        <div className="container mx-auto px-4 max-w-6xl animate-pulse">
           <div className="h-64 bg-slate-200 rounded-[2.5rem] mb-12 w-full" />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                 <div key={i} className="h-80 bg-white rounded-3xl border border-slate-100" />
              ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 selection:bg-indigo-500 selection:text-white pt-24 pb-20">
      {/* Background decoration */}
      <div className="fixed inset-0 h-full w-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        
        {/* --- HERO HEADER (Desain Konsisten dengan Modules.tsx) --- */}
        <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-2xl shadow-slate-900/20 text-white">
          {/* Background Blobs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-600 rounded-full blur-3xl opacity-20" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6 text-sm font-medium text-blue-200">
                <Rocket className="w-4 h-4 text-yellow-300" />
                <span>Project Based Learning (PBL)</span>
              </div>
              
              {/* Title Gradient */}
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                Eksplorasi Proyek & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                  Studi Kasus Nyata
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
                Kumpulan referensi proyek siap ajar yang mengintegrasikan Koding & AI dengan mata pelajaran sekolah (Matematika, IPA, Seni, dll).
              </p>
            </div>
            
            {/* Illustration (Icon 3D Style) */}
            <div className="hidden md:block">
                <div className="w-32 h-32 bg-white/5 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500 group">
                    <Code2 className="w-16 h-16 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
                </div>
            </div>
          </div>
        </div>

        {/* --- FILTERS & SEARCH --- */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
            {/* Difficulty Tabs */}
            <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                {difficulties.map((diff) => (
                    <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${selectedDifficulty === diff 
                                ? "bg-slate-900 text-white shadow-md" 
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                    >
                        {diff}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Cari topik atau mapel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
            </div>
        </div>

        {/* --- PROJECTS GRID --- */}
        {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => (
                    <Card key={project.id} className="group relative border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 rounded-[2rem] overflow-hidden bg-white flex flex-col h-full hover:-translate-y-1">
                        
                        {/* Header Gradient */}
                        <div className="h-32 bg-gradient-to-br from-slate-50 to-slate-100 relative p-6 border-b border-slate-100 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <Badge className={`shadow-none border-0 ${getDifficultyColor(project.difficulty)}`}>
                                    {project.difficulty}
                                </Badge>
                                <button className="p-2 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 transition-colors shadow-sm">
                                    <Heart className="w-4 h-4" />
                                </button>
                            </div>
                            {/* Tools Icons */}
                            <div className="flex -space-x-2 overflow-hidden">
                                {project.tools.map((tool, idx) => (
                                    <div key={idx} className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-sm shadow-sm" title={tool}>
                                        {getToolIcon(tool)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                                {project.title}
                            </h3>
                            
                            <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded-md border border-slate-100">
                                <GraduationCap className="w-3.5 h-3.5" />
                                Integrasi: {project.subject_integration}
                            </div>

                            <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                                {project.description}
                            </p>

                            <div className="mt-auto space-y-4">
                                {/* Metadata */}
                                <div className="flex items-center justify-between text-xs text-slate-400 font-medium py-3 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {project.duration}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                                        {project.likes_count} Guru
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" className="w-full text-xs h-10 border-slate-200 hover:bg-slate-50 text-slate-600">
                                        <Download className="w-3.5 h-3.5 mr-2" /> RPP
                                    </Button>
                                    
                                    {/* Link Navigasi ke Detail */}
                                    <Link to={`/project/${project.id}`} className="w-full">
                                        <Button className="w-full text-xs h-10 bg-slate-900 hover:bg-blue-600 text-white shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20">
                                            Lihat Detail <ArrowRight className="w-3.5 h-3.5 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                    <Palette className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Belum ada proyek yang cocok</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">Coba ganti kata kunci pencarian atau ubah filter kesulitan untuk menemukan inspirasi lainnya.</p>
                <Button 
                    variant="outline"
                    onClick={() => {setSearchQuery(""); setSelectedDifficulty("Semua")}}
                >
                    Reset Filter
                </Button>
            </div>
        )}

      </div>
    </div>
  );
};

export default Projects;