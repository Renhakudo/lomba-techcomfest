import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  PlayCircle,
  BookOpen,
  Trophy,
  BrainCircuit,
  SkipForward,
  Clock,
  BarChart,
  ChevronRight,
  Sparkles,
  Zap,
  MoreVertical,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  lesson_order: number;
  difficulty_level: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  color: string;
  lessons: Lesson[];
}

const ModuleDetail = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  // State
  const [module, setModule] = useState<Module | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // State Adaptive Learning
  const [hasTakenPretest, setHasTakenPretest] = useState(false);
  const [assignedLevel, setAssignedLevel] = useState<string | null>(null);

  // State Baru: Durasi & Sertifikat
  const [totalDuration, setTotalDuration] = useState<string>("0 Menit");
  const [userName, setUserName] = useState<string>("");
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);

  useEffect(() => {
    const fetchModuleAndUser = async () => {
      setLoading(true);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          console.error("Pengguna belum login");
          setLoading(false);
          return;
        }

        const uid = session.user.id;
        setUserId(uid);

        // 1. Ambil Module & Lessons
        const { data: moduleData, error: moduleError } = await supabase
          .from("modules")
          .select(
            "id, title, description, category, color, lessons(id, title, duration, lesson_order, difficulty_level)"
          )
          .eq("id", moduleId)
          .single();

        if (moduleError || !moduleData) {
          console.error("Modul tidak ditemukan:", moduleError);
          setModule(null);
          setLoading(false);
          return;
        }
        setModule(moduleData as unknown as Module);

        // --- HITUNG TOTAL DURASI REAL ---
        if (moduleData.lessons) {
          let totalMinutes = 0;
          moduleData.lessons.forEach((l: any) => {
            // Ambil angka dari string durasi (misal: "15 Menit" -> 15)
            const minutes = parseInt(l.duration?.replace(/\D/g, "") || "0");
            totalMinutes += minutes;
          });

          const hours = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;
          const formattedDuration =
            hours > 0 ? `${hours} Jam ${mins} Menit` : `${mins} Menit`;
          setTotalDuration(formattedDuration);
        }

        // 2. Ambil Completed Lessons & Nama User dari Profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("completed_lessons, name") // Tambah select 'name'
          .eq("id", uid)
          .single();

        const userCompleted = profileData?.completed_lessons?.[moduleId!] || [];
        setCompletedLessons(userCompleted);
        setUserName(profileData?.name || "Peserta Didik");

        // 3. Ambil Status Pre-Test
        const { data: progressData } = await supabase
          .from("user_module_progress")
          .select("has_taken_pretest, assigned_level")
          .eq("user_id", uid)
          .eq("module_id", moduleId)
          .single();

        if (progressData) {
          setHasTakenPretest(progressData.has_taken_pretest);
          setAssignedLevel(progressData.assigned_level);
        } else {
          setHasTakenPretest(false);
          setAssignedLevel(null);
        }
      } catch (err) {
        console.error(err);
        setModule(null);
      }

      setLoading(false);
    };

    fetchModuleAndUser();
  }, [moduleId]);

  // --- FUNGSI GENERATE CERTIFICATE ---
  const handleDownloadCertificate = () => {
    if (!module) return;
    setIsGeneratingCert(true);

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [842, 595], // A4 Landscape (px approx)
    });

    // Template Sertifikat Kosong (Background)
    const certTemplateUrl = "https://i.imgur.com/Yj8k9Hk.png"; 

    const img = new Image();
    img.src = certTemplateUrl;
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      // 1. Draw Background
      doc.addImage(img, "PNG", 0, 0, 842, 595);

      // 2. Add Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(48);
      doc.setTextColor(51, 65, 85);
      doc.text(userName, 421, 280, { align: "center" });

      // 3. Add Module Title
      doc.setFont("helvetica", "normal");
      doc.setFontSize(24);
      doc.setTextColor(100, 116, 139);
      doc.text("Telah berhasil menyelesaikan modul:", 421, 330, { align: "center" });
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235); // Blue-600
      doc.text(module.title, 421, 360, { align: "center" });

      // 4. Add Date
      const dateStr = new Date().toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric"
      });
      doc.setFontSize(16);
      doc.setTextColor(100);
      doc.text(`Diselesaikan pada: ${dateStr}`, 421, 450, { align: "center" });

      // 5. Save
      doc.save(`Sertifikat-Tera-${module.title.replace(/\s+/g, '-')}.pdf`);
      setIsGeneratingCert(false);
    };

    img.onerror = () => {
      alert("Gagal membuat sertifikat. Silakan coba lagi.");
      setIsGeneratingCert(false);
    };
  };

  // Helper Warna Badge Level
  const getLevelBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-emerald-100 text-emerald-700 border-emerald-200/50";
      case "intermediate":
        return "bg-blue-100 text-blue-700 border-blue-200/50";
      case "advanced":
        return "bg-violet-100 text-violet-700 border-violet-200/50";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // --- SKELETON LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 font-sans">
        <div className="container mx-auto px-4 max-w-6xl animate-pulse">
          <div className="h-64 bg-slate-200 rounded-[2.5rem] mb-10 w-full" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-white rounded-2xl border border-slate-100"
                />
              ))}
            </div>
            <div className="hidden lg:block h-80 bg-white rounded-3xl border border-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!module)
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex flex-col items-center justify-center font-medium text-slate-500">
        <BookOpen className="w-12 h-12 mb-4 text-slate-300" />
        Modul Tidak Ditemukan
      </div>
    );

  const sortedLessons = [...module.lessons].sort(
    (a, b) => a.lesson_order - b.lesson_order
  );

  const isLessonSkipped = (lessonLevel: string | undefined) => {
    if (!assignedLevel || !lessonLevel) return false;
    const uLvl = assignedLevel.toLowerCase();
    const lLvl = lessonLevel.toLowerCase();
    if (uLvl === "intermediate" && lLvl === "beginner") return true;
    if (uLvl === "advanced" && (lLvl === "beginner" || lLvl === "intermediate"))
      return true;
    return false;
  };

  const getLessonStatus = (lesson: Lesson, index: number) => {
    if (!hasTakenPretest) return "locked";
    if (completedLessons.includes(lesson.id)) return "completed";
    if (isLessonSkipped(lesson.difficulty_level)) return "completed";
    if (index === 0) return "in-progress";

    const prevLesson = sortedLessons[index - 1];
    const isPrevDone =
      completedLessons.includes(prevLesson.id) ||
      isLessonSkipped(prevLesson.difficulty_level);

    if (isPrevDone) return "in-progress";
    return "locked";
  };

  const handleLessonClick = (lesson: Lesson, status: string) => {
    if (!hasTakenPretest) return;
    if (status === "in-progress" || status === "completed") {
      navigate(`/module/${moduleId}/lesson/${lesson.id}`);
    }
  };

  const calculateVisualProgress = () => {
    if (sortedLessons.length === 0) return 0;
    const doneCount = sortedLessons.filter(
      (l) =>
        completedLessons.includes(l.id) || isLessonSkipped(l.difficulty_level)
    ).length;
    return Math.round((doneCount / sortedLessons.length) * 100);
  };
  const progressPercent = calculateVisualProgress();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20 font-sans text-slate-800 selection:bg-indigo-500 selection:text-white">
      {/* 1. Background Pattern */}
      <div className="fixed inset-0 h-full w-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Breadcrumb / Back */}
        <Link
          to="/modules"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-8 transition-all group"
        >
          <div className="p-2 rounded-full bg-white border border-slate-200 mr-3 group-hover:border-slate-300 shadow-sm group-hover:shadow-md transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Kembali ke Semua Modul
        </Link>

        {/* --- HERO HEADER SECTION (Dark Theme) --- */}
        <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-2xl shadow-slate-900/20 text-white">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600 rounded-full blur-3xl opacity-25 animate-pulse" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-64 h-64 bg-violet-600 rounded-full blur-3xl opacity-20" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <div
              className={`w-24 h-24 rounded-[1.5rem] bg-gradient-to-br ${module.color} p-0.5 shadow-2xl shrink-0 hidden md:block`}
            >
              <div className="w-full h-full bg-white/10 backdrop-blur-md rounded-[1.3rem] flex items-center justify-center border border-white/10">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex md:hidden items-center justify-center shadow-lg`}
                >
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                {hasTakenPretest && assignedLevel && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-blue-200 shadow-inner">
                    <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    Level Awal:{" "}
                    <span className="text-white font-bold uppercase tracking-wider">
                      {assignedLevel}
                    </span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                {module.title}
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
                {module.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* --- LEFT COLUMN: CONTENT (8 cols) --- */}
          <div className="lg:col-span-8 space-y-8">
            {/* --- PRE-TEST CTA CARD --- */}
            {!hasTakenPretest && (
              <div className="relative group overflow-hidden rounded-[2rem] p-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 shadow-xl shadow-blue-500/20">
                <div className="bg-white rounded-[1.8rem] p-6 sm:p-8 relative z-10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="p-4 bg-blue-50 rounded-2xl shrink-0">
                        <BrainCircuit className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          Personalisasi Jalur Belajar
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                          Ikuti tes adaptif singkat. Jika skor Anda tinggi, kami akan 
                          membuka materi lanjutan secara otomatis!
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(`/module/${module.id}/pre-test`)}
                      className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-bold shadow-lg transition-all hover:scale-[1.02] hover:shadow-blue-500/25 shrink-0 w-full sm:w-auto"
                    >
                      Mulai Pre-Test
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* --- LESSONS TIMELINE --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <MoreVertical className="w-6 h-6 text-slate-300" />
                  Silabus Modul
                </h2>
                <span className="px-3 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {sortedLessons.length} Pelajaran
                </span>
              </div>

              <div className="relative space-y-6">
                <div className="absolute left-[35px] top-6 bottom-6 w-[2px] bg-slate-100 hidden sm:block" />

                {sortedLessons.map((lesson, index) => {
                  const status = getLessonStatus(lesson, index);
                  const skipped = isLessonSkipped(lesson.difficulty_level);

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson, status)}
                      className={`group relative flex gap-5 sm:gap-6 items-center p-4 rounded-[1.5rem] border-2 transition-all duration-300
                        ${
                          status === "locked"
                            ? "border-transparent bg-slate-50/50 opacity-60 grayscale cursor-not-allowed"
                            : "border-slate-100 bg-white hover:border-blue-100 hover:bg-blue-50/30 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer hover:-translate-y-1"
                        }
                        ${
                          status === "in-progress"
                            ? "ring-2 ring-blue-500/10 border-blue-500/20"
                            : ""
                        }
                      `}
                    >
                      <div
                        className={`
                          relative z-10 w-[70px] h-[70px] rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 border
                          ${
                            status === "completed"
                              ? "bg-emerald-50 border-emerald-100"
                              : status === "in-progress"
                              ? "bg-blue-600 border-blue-500 shadow-blue-500/30"
                              : "bg-white border-slate-100"
                          }
                        `}
                      >
                        {status === "completed" ? (
                          skipped ? (
                            <SkipForward className="w-8 h-8 text-emerald-500" />
                          ) : (
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                          )
                        ) : status === "in-progress" ? (
                          <PlayCircle className="w-8 h-8 text-white fill-white/20" />
                        ) : (
                          <Lock className="w-6 h-6 text-slate-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                          <h3
                            className={`text-lg font-bold truncate pr-4 ${
                              status === "locked"
                                ? "text-slate-400"
                                : "text-slate-800"
                            }`}
                          >
                            {lesson.title}
                          </h3>
                          {lesson.difficulty_level && (
                            <Badge
                              className={`w-fit h-6 text-[10px] uppercase tracking-wider font-bold shadow-none ${getLevelBadgeColor(
                                lesson.difficulty_level
                              )}`}
                            >
                              {lesson.difficulty_level}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {lesson.duration}
                          </div>
                          {skipped && status === "completed" && (
                            <span className="text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">
                              <Sparkles className="w-3 h-3" /> Lewati Otomatis
                            </span>
                          )}
                        </div>
                      </div>

                      {status !== "locked" && (
                        <div className="hidden sm:flex self-center w-10 h-10 rounded-full bg-slate-50 items-center justify-center text-slate-300 group-hover:bg-blue-500 group-hover:text-white transition-colors ml-2">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: STICKY SIDEBAR (4 cols) --- */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <Card className="rounded-[2rem] border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
              <div className="bg-slate-50/50 p-6 border-b border-slate-100 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-blue-500" />
                  Progres Belajar
                </h3>
              </div>
              <div className="p-8">
                <div className="flex items-end justify-between mb-4">
                  <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                    {progressPercent}%
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Selesai
                  </span>
                </div>

                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-8">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm py-3 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Pelajaran</span>
                    <span className="font-bold text-slate-900">
                      {
                        sortedLessons.filter(
                          (l) =>
                            completedLessons.includes(l.id) ||
                            isLessonSkipped(l.difficulty_level)
                        ).length
                      }
                      <span className="text-slate-300 mx-1">/</span>
                      {sortedLessons.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm py-3 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">
                      Estimasi Waktu
                    </span>
                    {/* UPDATE: Durasi Real */}
                    <span className="font-bold text-slate-900">
                      ~{totalDuration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Certificate Teaser */}
              <div
                className={`p-6 text-center transition-colors duration-300 ${
                  progressPercent === 100
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500"
                    : "bg-slate-50"
                }`}
              >
                {progressPercent === 100 ? (
                  <div className="text-white">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                      <Trophy className="w-7 h-7 text-yellow-300 fill-yellow-300" />
                    </div>
                    <h4 className="font-bold text-lg mb-1">
                      Sertifikat Terbuka!
                    </h4>
                    <p className="text-white/80 text-sm mb-4">
                      Selamat! Anda telah menguasai modul ini.
                    </p>
                    <Button
                      onClick={handleDownloadCertificate}
                      disabled={isGeneratingCert}
                      className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl shadow-lg border-0"
                    >
                      {isGeneratingCert ? (
                        "Memproses..."
                      ) : (
                        <span className="flex items-center gap-2">
                          <Download className="w-4 h-4" /> Unduh Sertifikat
                        </span>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-200/50 rounded-full flex items-center justify-center mb-3">
                      <Trophy className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
                      Selesaikan modul untuk klaim sertifikat
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;