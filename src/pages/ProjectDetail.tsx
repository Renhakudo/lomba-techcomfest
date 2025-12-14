import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  ArrowLeft,
  Clock,
  Heart,
  Share2,
  Download,
  CheckCircle2,
  Code2,
  BookOpen,
  User,
  GraduationCap,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Swal from "sweetalert2";

// --- Tipe Data ---
interface ProjectStep {
  title: string;
  desc: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  tools: string[];
  subject_integration: string;
  duration: string;
  likes_count: number;
  image_url: string | null;
  author_name: string;
  learning_objectives: string[];
  steps: ProjectStep[];
  download_url: string;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      setLoading(true);
      try {
        // Ambil data project berdasarkan ID
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (err) {
        console.error("Gagal memuat proyek:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetail();
  }, [projectId]);

  const handleLike = () => {
    // Simulasi Like (Optimistic UI)
    setIsLiked(!isLiked);
    if (project) {
        setProject({
            ...project,
            likes_count: isLiked ? project.likes_count - 1 : project.likes_count + 1
        });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    Swal.fire({
        icon: 'success',
        title: 'Tautan Disalin!',
        text: 'Bagikan tautan ini ke rekan guru lainnya.',
        timer: 1500,
        showConfirmButton: false
    });
  };

  // Helper Warna Badge
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "Pemula": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Menengah": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Lanjut": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 flex justify-center items-center">
         <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-200 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-slate-200 rounded"></div>
         </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 flex flex-col justify-center items-center text-center px-4">
         <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 max-w-md">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Proyek Tidak Ditemukan</h2>
            <p className="text-slate-500 mb-6">Mungkin proyek ini sudah dihapus atau tautannya salah.</p>
            <Button onClick={() => navigate("/projects")} className="bg-slate-900 text-white">
                Kembali ke Daftar Proyek
            </Button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pt-24 pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 pb-12 pt-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            {/* Breadcrumb */}
            <Link
                to="/projects"
                className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-8 group transition-colors"
            >
                <div className="p-2 rounded-full bg-slate-100 border border-slate-200 mr-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Kembali ke Ruang Proyek
            </Link>

            <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Badge className={`shadow-none px-3 py-1 ${getDifficultyColor(project.difficulty)}`}>
                            {project.difficulty}
                        </Badge>
                        <span className="text-sm text-slate-500 flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5" /> {project.duration}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                        {project.title}
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed mb-6">
                        {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                {project.author_name.charAt(0)}
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-slate-900">Oleh {project.author_name}</p>
                                <p className="text-slate-500">Kontributor Tera</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                        <div className="flex gap-2">
                            {project.tools.map((tool, idx) => (
                                <Badge key={idx} variant="outline" className="bg-white text-slate-600 border-slate-300">
                                    {tool}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
                    <Button 
                        onClick={() => Swal.fire('Mengunduh...', 'RPP sedang diunduh ke perangkat Anda.', 'success')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 h-12 px-6 rounded-xl font-bold"
                    >
                        <Download className="w-4 h-4 mr-2" /> Unduh RPP & Modul
                    </Button>
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            onClick={handleLike}
                            className={`flex-1 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors ${isLiked ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-slate-600'}`}
                        >
                            <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-rose-600' : ''}`} /> 
                            {project.likes_count}
                        </Button>
                        <Button variant="outline" onClick={handleShare} className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-600">
                            <Share2 className="w-4 h-4 mr-2" /> Bagikan
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl mt-12">
        <div className="grid lg:grid-cols-3 gap-10">
            
            {/* --- LEFT CONTENT: DETAIL --- */}
            <div className="lg:col-span-2 space-y-10">
                
                {/* 1. Learning Objectives */}
                <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-indigo-600" />
                        Tujuan Pembelajaran
                    </h3>
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <ul className="space-y-4">
                            {project.learning_objectives?.map((obj, idx) => (
                                <li key={idx} className="flex gap-4">
                                    <div className="mt-1 min-w-[24px]">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <p className="text-slate-600 leading-relaxed font-medium">{obj}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* 2. Step-by-Step Guide */}
                <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-indigo-600" />
                        Langkah Kegiatan Proyek
                    </h3>
                    <div className="space-y-6">
                        {project.steps?.map((step, idx) => (
                            <div key={idx} className="flex gap-6 group">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                        {idx + 1}
                                    </div>
                                    {idx !== (project.steps.length - 1) && (
                                        <div className="w-0.5 h-full bg-slate-200 my-2 group-hover:bg-indigo-100"></div>
                                    )}
                                </div>
                                <Card className="flex-1 border-slate-200 hover:border-indigo-200 transition-colors shadow-sm rounded-2xl">
                                    <CardContent className="p-6">
                                        <h4 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h4>
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            {step.desc}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </section>

            </div>

            {/* --- RIGHT CONTENT: SIDEBAR INFO --- */}
            <aside className="space-y-6">
                <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-indigo-300" /> Integrasi Mapel
                        </h4>
                        <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                            Proyek ini sangat cocok untuk diintegrasikan dalam mata pelajaran:
                        </p>
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                            <p className="font-bold text-lg text-center">{project.subject_integration}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Perangkat yang Dibutuhkan</h4>
                    <ul className="space-y-3">
                        {project.tools.map((tool, i) => (
                            <li key={i} className="flex items-center justify-between text-sm text-slate-600 border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                                <span>{tool}</span>
                                <CheckCircle2 className="w-4 h-4 text-slate-300" />
                            </li>
                        ))}
                        <li className="flex items-center justify-between text-sm text-slate-600 pt-2">
                            <span>Koneksi Internet</span>
                            <CheckCircle2 className="w-4 h-4 text-slate-300" />
                        </li>
                    </ul>
                </div>
            </aside>

        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;