// src/pages/LessonDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Lock,
  PlayCircle,
  Trophy,
  ArrowRight,
  BookOpen,
  Clock,
  BarChart,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LessonContent {
  id: number;
  lesson_id: number;
  content: string;
  video_url: string;
}

interface Lesson {
  id: number;
  module_id: number;
  title: string;
  lesson_order: number;
  duration: string | null; 
  difficulty_level: string | null; 
}

const LessonDetail = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [moduleTitle, setModuleTitle] = useState<string | null>(null);
  const [lessonContents, setLessonContents] = useState<LessonContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Record<string, number[]>>({});
  const [moduleLessons, setModuleLessons] = useState<Lesson[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndLesson = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id ?? null;
        setUserId(uid);

        if (uid) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("completed_lessons")
            .eq("id", uid)
            .single();
          setCompletedLessons(profileData?.completed_lessons || {});
        }

        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("id, module_id, title, lesson_order, duration, difficulty_level")
          .eq("id", lessonId)
          .single();

        if (lessonError || !lessonData) {
          console.error("Lesson not found");
          setLesson(null);
          setLoading(false);
          return;
        }

        setLesson(lessonData);

        const { data: moduleData } = await supabase
          .from("modules")
          .select("title")
          .eq("id", lessonData.module_id)
          .single();
        
        setModuleTitle(moduleData?.title || null);

        const { data: moduleLessonsData } = await supabase
          .from("lessons")
          .select("id, module_id, title, lesson_order, duration, difficulty_level")
          .eq("module_id", lessonData.module_id)
          .order("lesson_order", { ascending: true });

        setModuleLessons(moduleLessonsData || []);

        const { data: contentData } = await supabase
          .from("lesson_contents")
          .select("id, lesson_id, content, video_url")
          .eq("lesson_id", lessonId)
          .order("id");

        setLessonContents(contentData || []);

        const completedData = uid ? (await fetchCompletedLessonsForUser(uid)) : {};
        const moduleCompletedArr = completedData[lessonData.module_id] || [];
        setCompleted(moduleCompletedArr.includes(lessonData.id));

        if (lessonData.lesson_order === 1) {
          setUnlocked(true);
        } else {
          const prevLessonOrder = lessonData.lesson_order - 1;
          const prevLesson = moduleLessonsData?.find(l => l.lesson_order === prevLessonOrder);
          
          if (prevLesson && moduleCompletedArr.includes(prevLesson.id)) {
            setUnlocked(true);
          } else {
            setUnlocked(false);
          }
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchUserAndLesson();
  }, [lessonId]);

  const fetchCompletedLessonsForUser = async (uid: string) => {
    const { data } = await supabase.from("profiles").select("completed_lessons").eq("id", uid).single();
    return data?.completed_lessons || {};
  };

  const handleCompleteLesson = async () => {
    if (!lesson || !userId || !unlocked) return;

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("completed_lessons")
        .eq("id", userId)
        .single();

      const prevCompleted = profileData?.completed_lessons || {};
      const moduleLessonsArr = prevCompleted[lesson.module_id] || [];
      
      const updatedModuleLessons = Array.from(new Set([...moduleLessonsArr, lesson.id]));
      const updatedCompletedLessons = { ...prevCompleted, [lesson.module_id]: updatedModuleLessons };

      await supabase.from("profiles").update({ completed_lessons: updatedCompletedLessons }).eq("id", userId);

      setCompleted(true);
      setCompletedLessons(updatedCompletedLessons);
      goToNextLesson();
    } catch (err) {
      console.error("Gagal menyelesaikan pelajaran:", err);
    }
  };

  const goToNextLesson = async () => {
     if (!lesson) return;
     const nextLesson = moduleLessons.find(l => l.lesson_order === lesson.lesson_order + 1);

      if (nextLesson) {
        navigate(`/module/${lesson.module_id}/lesson/${nextLesson.id}`);
      } else {
        navigate(`/module/${lesson.module_id}`);
      }
  }

  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    return (
        <div className="space-y-4 text-slate-700 leading-relaxed">
            {lines.map((line, idx) => {
                const cleanLine = line.trim();
                if (!cleanLine) return null;

                // --- HEADING 1 (#) ---
                if (cleanLine.startsWith('# ')) {
                    return (
                        <h2 key={idx} className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-8 mb-4 flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-blue-700 rounded-full inline-block"></span>
                            {cleanLine.replace('# ', '')}
                        </h2>
                    );
                }

                // --- HEADING 2 (##) ---
                if (cleanLine.startsWith('## ')) {
                    return (
                        <h3 key={idx} className="text-lg md:text-xl font-bold text-slate-800 mt-6 mb-2 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full inline-block"></span>
                            {cleanLine.replace('## ', '')}
                        </h3>
                    );
                }

                // --- BOLD TRIGGER (**) ---
                const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
                return (
                    <p key={idx}>
                        {parts.map((part, i) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                    <span key={i} className="mx-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-semibold text-sm border border-blue-100 shadow-sm inline-block">
                                        {part.slice(2, -2)}
                                    </span>
                                );
                            }
                            return part;
                        })}
                    </p>
                )
            })}
        </div>
    );
  };

  if (loading) return <div className="min-h-screen bg-gray-50 pt-32 text-center">Memuat...</div>;
  if (!lesson) return <div className="min-h-screen bg-gray-50 pt-32 text-center">Pelajaran Tidak Ditemukan</div>;

  const moduleCompletedArr = completedLessons[lesson.module_id] || [];
  const completedCount = moduleCompletedArr.length;
  const totalCount = moduleLessons.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const getStatus = (l: Lesson) => {
    if (moduleCompletedArr.includes(l.id)) return "completed";
    if (l.lesson_order === 1) return "in-progress";
    const prev = moduleLessons.find(m => m.lesson_order === l.lesson_order - 1);
    if (prev && moduleCompletedArr.includes(prev.id)) return "in-progress";
    return "locked";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "in-progress":
        return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case "locked":
        return <Lock className="w-4 h-4 text-slate-300" />;
      default:
        return <Circle className="w-4 h-4 text-slate-300" />;
    }
  };

  const nextLesson = moduleLessons.find(l => l.lesson_order === lesson.lesson_order + 1);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* --- HEADER --- */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to={`/module/${lesson.module_id}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Kembali
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-300 mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-2">
               <BookOpen className="w-5 h-5 text-blue-600 hidden sm:block" />
               <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight line-clamp-1">
                 {moduleTitle || "Memuat Modul..."}
               </h1>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="hidden md:flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Progres Modul</span>
                <div className="flex items-center gap-3">
                    <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${progressPercent}%` }} 
                        />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{progressPercent}%</span>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- MAIN CONTENT (KIRI) --- */}
          <main className="lg:col-span-2 space-y-8">
            <Card className={`${!unlocked ? "opacity-60 pointer-events-none" : ""} border-0 shadow-lg`}>
              <CardHeader className="border-b bg-white rounded-t-xl pb-4">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-xl md:text-2xl text-slate-900">
                      {lesson.title}
                    </CardTitle>
                    {completed && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Selesai</Badge>}
                 </div>
              </CardHeader>

              <CardContent className="space-y-8 p-6 md:p-8">
                {/* VIDEO PLAYER */}
                {lessonContents.length > 0 && lessonContents[0].video_url && (
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg ring-1 ring-black/5">
                    <iframe
                      className="w-full h-full"
                      src={lessonContents[0].video_url.replace("watch?v=", "embed/")}
                      title={lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* TEXT CONTENT */}
                {lessonContents.length > 0 ? (
                  lessonContents.map((content) => (
                    <article key={content.id} className="prose prose-slate max-w-none">
                      {renderFormattedContent(content.content)}
                      
                      {/* Additional Videos */}
                      {content.video_url && content !== lessonContents[0] && (
                        <div className="aspect-video w-full mt-6 rounded-xl overflow-hidden shadow-md">
                          <iframe
                            className="w-full h-full"
                            src={content.video_url.replace("watch?v=", "embed/")}
                            allowFullScreen
                          />
                        </div>
                      )}
                    </article>
                  ))
                ) : (
                   <div className="py-10 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <p className="text-muted-foreground">Belum ada materi untuk pelajaran ini.</p>
                  </div>
                )}

                {/* MOBILE BUTTON */}
                {!completed && unlocked && (
                  <div className="md:hidden pt-4 border-t">
                    <Button className="w-full py-6 text-lg shadow-lg shadow-blue-500/20" onClick={handleCompleteLesson}>
                      Selesaikan Pelajaran <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}
                
                {/* LOCKED STATE */}
                {!unlocked && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
                    <Lock className="w-5 h-5" />
                    <span className="font-semibold">Pelajaran Terkunci. Selesaikan pelajaran sebelumnya.</span>
                  </div>
                )}

                {/* SUCCESS MESSAGE */}
                {completed && (
                  <div className="mt-6">
                    <Card className="border-0 bg-transparent p-0 shadow-none">
                      <CardContent className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                             <Trophy className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-bold text-emerald-800">Pelajaran Selesai!</div>
                          <div className="text-sm text-emerald-600/80">
                             Anda telah menyelesaikan materi ini. Lanjutkan ke materi berikutnya.
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

          </main>

          {/* --- SIDEBAR (KANAN) --- */}
          <aside className="lg:col-span-1 space-y-6">
            
            {/* LESSON INSIGHTS CARD */}
            <Card className="border-0 shadow-lg bg-white overflow-hidden">
                <div className="bg-blue-600 p-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" /> Wawasan Pelajaran
                    </h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Tingkat Kesulitan</div>
                        <div className="font-semibold text-slate-700 capitalize flex items-center gap-1">
                            <BarChart className="w-4 h-4 text-blue-500" />
                            {lesson.difficulty_level || "Pemula"}
                        </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Durasi</div>
                        <div className="font-semibold text-slate-700 flex items-center gap-1">
                            <Clock className="w-4 h-4 text-orange-500" />
                            {lesson.duration || "15 mnt"}
                        </div>
                    </div>
                </div>
            </Card>

            {/* COURSE CONTENT LIST */}
            <div className="sticky top-24">
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="bg-slate-900 p-4 text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <BookOpen className="w-5 h-5" /> Konten Kursus
                    </h3>
                    <div className="text-slate-400 text-sm mt-1 flex justify-between items-center">
                       <span>{completedCount}/{totalCount} selesai</span>
                       <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded">{Math.round((completedCount/totalCount)*100)}%</span>
                    </div>
                    <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                <div className="p-2 bg-white max-h-[calc(100vh-400px)] overflow-y-auto">
                  <div className="space-y-1">
                    {moduleLessons.map((l) => {
                      const status = getStatus(l);
                      const isCurrent = l.id === Number(lessonId);
                      return (
                        <div
                          key={l.id}
                          onClick={() => {
                            if (status !== "locked") navigate(`/module/${l.module_id}/lesson/${l.id}`);
                          }}
                          className={`
                            relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group
                            ${isCurrent ? "bg-blue-50 border border-blue-100 shadow-sm z-10" : "hover:bg-slate-50 border border-transparent"}
                            ${status === "locked" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                          `}
                        >
                          {isCurrent && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full" />}
                          
                          <div className={`flex-shrink-0 ml-1 ${isCurrent ? 'scale-110' : ''}`}>
                            {getStatusIcon(status)}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-medium truncate ${isCurrent ? "text-blue-700" : "text-slate-700"}`}>
                              {l.title}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-2">
                               <span>Pelajaran {l.lesson_order}</span>
                               <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                               <span>{l.duration || "15m"}</span>
                            </div>
                          </div>
                          
                          {status !== 'locked' && !isCurrent && (
                              <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="p-4 border-t bg-slate-50">
                  {!completed && unlocked ? (
                    <Button className="w-full shadow-md shadow-blue-500/10" onClick={handleCompleteLesson}>
                      Selesaikan & Lanjut
                    </Button>
                  ) : completed ? (
                    <Button
                      className={`w-full ${nextLesson ? "bg-blue-600 hover:bg-blue-700" : "bg-white text-slate-700 border hover:bg-slate-50"}`}
                      variant={nextLesson ? "default" : "outline"}
                      onClick={() => nextLesson ? navigate(`/module/${lesson.module_id}/lesson/${nextLesson.id}`) : navigate(`/module/${lesson.module_id}`)}
                    >
                      {nextLesson ? <>Pelajaran Berikutnya <ArrowRight className="w-4 h-4 ml-2" /></> : "Selesaikan Modul"}
                    </Button>
                  ) : (
                    <Button className="w-full bg-slate-200 text-slate-400 hover:bg-slate-200 cursor-not-allowed">
                      <Lock className="w-4 h-4 mr-2" /> Terkunci
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;