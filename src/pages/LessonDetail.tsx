// src/pages/LessonDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Lock,
  PlayCircle,
  Notebook,
  Trophy,
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
}

interface Note {
  id: number;
  user_id: string | null;
  lesson_id: number;
  content: string;
  created_at: string;
}

const LessonDetail = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessonContents, setLessonContents] = useState<LessonContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<
    Record<string, number[]>
  >({});
  const [moduleLessons, setModuleLessons] = useState<Lesson[]>([]);
  const navigate = useNavigate();

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);

  useEffect(() => {
    const fetchUserAndLesson = async () => {
      setLoading(true);

      try {
        // Ambil session user
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const uid = session?.user?.id ?? null;
        setUserId(uid);

        // Ambil profiles user untuk completed lessons
        if (uid) {
          try {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("xp, level, completed_lessons")
              .eq("id", uid)
              .single();

            const completedData = profileData?.completed_lessons || {};
            setCompletedLessons(completedData);
          } catch (err) {
            console.error("Error fetching profile data:", err);
          }
        }

        // Ambil lesson
        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("id, module_id, title, lesson_order")
          .eq("id", lessonId)
          .single();

        if (lessonError || !lessonData) {
          console.error("Lesson not found:", lessonError);
          setLesson(null);
          setLessonContents([]);
          setLoading(false);
          return;
        }

        setLesson(lessonData);
        const { data: moduleLessonsData } = await supabase
          .from("lessons")
          .select("id, module_id, title, lesson_order")
          .eq("module_id", lessonData.module_id)
          .order("lesson_order", { ascending: true });

        setModuleLessons(moduleLessonsData || []);

        const { data: contentData } = await supabase
          .from("lesson_contents")
          .select("id, lesson_id, content, video_url")
          .eq("lesson_id", lessonId)
          .order("id");

        setLessonContents(contentData || []);

        const completedLessonsModule =
          (session?.user &&
            (await fetchCompletedLessonsForUser(session.user.id))) ||
          {};
        
        const moduleCompletedArr =
          completedLessonsModule[lessonData.module_id] ||
          completedLessons[lessonData.module_id] ||
          [];
        setCompleted(moduleCompletedArr.includes(lessonData.id));

        if (lessonData.lesson_order === 1) {
          setUnlocked(true);
        } else {
          const prevLessonOrder = lessonData.lesson_order - 1;
          const { data: prevLesson } = await supabase
            .from("lessons")
            .select("id")
            .eq("module_id", lessonData.module_id)
            .eq("lesson_order", prevLessonOrder)
            .single();

          if (prevLesson && moduleCompletedArr.includes(prevLesson.id)) {
            setUnlocked(true);
          } else {
            setUnlocked(false);
          }
        }

        // fetch notes for this lesson
        await fetchNotes(Number(lessonId));
      } catch (err) {
        console.error(err);
        setLesson(null);
        setLessonContents([]);
      }

      setLoading(false);
    };

    fetchUserAndLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const fetchCompletedLessonsForUser = async (uid: string) => {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("completed_lessons")
        .eq("id", uid)
        .single();
      return profileData?.completed_lessons || {};
    } catch (err) {
      console.error("Error fetching completed lessons:", err);
      return {};
    }
  };

  // Notes: fetch
  const fetchNotes = async (lessonIdNum: number) => {
    setNotesLoading(true);
    try {
      const { data, error } = await supabase
        .from("lesson_notes")
        .select("id, user_id, lesson_id, content, created_at")
        .eq("lesson_id", lessonIdNum)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error);
        setNotes([]);
      } else {
        setNotes((data as Note[]) || []);
      }
    } catch (err) {
      console.error(err);
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  // Notes: submit
  const handleSubmitNote = async () => {
    if (!noteText.trim()) return;
    const tempNote: Note = {
      id: Date.now(),
      user_id: userId,
      lesson_id: lesson ? lesson.id : Number(lessonId),
      content: noteText.trim(),
      created_at: new Date().toISOString(),
    };
    
    setNoteText("");
    setShowNoteForm(false);
    setNotes((prev) => [tempNote, ...prev]);

    if (!userId) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("lesson_notes")
        .insert({
          user_id: userId,
          lesson_id: lesson ? lesson.id : Number(lessonId),
          content: tempNote.content,
        })
        .select()
        .single();
      if (error) {
        console.error("Failed to save note:", error);
      } else if (data) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === tempNote.id
              ? {
                  id: data.id,
                  user_id: data.user_id,
                  lesson_id: data.lesson_id,
                  content: data.content,
                  created_at: data.created_at,
                }
              : n
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteLesson = async () => {
    if (!lesson || !userId) return;
    if (!unlocked) return;

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("completed_lessons")
        .eq("id", userId)
        .single();

      const prevCompleted = profileData?.completed_lessons || {};
      const moduleLessonsArr = prevCompleted[lesson.module_id] || [];
      const updatedModuleLessons = Array.from(
        new Set([...moduleLessonsArr, lesson.id])
      );

      const updatedCompletedLessons = {
        ...prevCompleted,
        [lesson.module_id]: updatedModuleLessons,
      };

      await supabase
        .from("profiles")
        .update({
          completed_lessons: updatedCompletedLessons,
        })
        .eq("id", userId);

      setCompleted(true);
      setCompletedLessons(updatedCompletedLessons);

      const { data: nextLessonData } = await supabase
        .from("lessons")
        .select("id, lesson_order")
        .eq("module_id", lesson.module_id)
        .gt("lesson_order", lesson.lesson_order)
        .order("lesson_order")
        .limit(1)
        .single();

      if (nextLessonData) {
        navigate(`/module/${lesson.module_id}/lesson/${nextLessonData.id}`);
      } else {
        navigate(`/module/${lesson.module_id}`);
      }
    } catch (err) {
      console.error("Failed to complete lesson:", err);
    }
  };

  // --- SKELETON LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl animate-pulse">
          {/* Header Section Skeleton */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Back Button Skeleton */}
              <div className="h-9 w-24 bg-gray-200 rounded-md" />
              
              <div className="flex items-center gap-3 ml-4">
                <div className="w-7 h-7 bg-gray-200 rounded-full" />
                <div>
                  <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-64 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
            {/* Badge Skeleton */}
            <div className="hidden sm:block h-6 w-32 bg-gray-200 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <main className="md:col-span-2 space-y-6">
              {/* Video/Content Card Skeleton */}
              <Card className="border-2">
                <CardHeader>
                  <div className="h-8 w-1/3 bg-gray-200 rounded" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Video Placeholder */}
                  <div className="w-full aspect-video rounded-md bg-gray-200" />
                  
                  {/* Learning Outcomes Box */}
                  <div className="border rounded-md p-4 space-y-2">
                    <div className="h-6 w-1/4 bg-gray-200 rounded" />
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  </div>

                  {/* Text Content */}
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-5/6 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>

              {/* Notes Card Skeleton */}
              <Card className="border-2">
                <CardHeader>
                  <div className="h-7 w-40 bg-gray-200 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 w-full bg-gray-200 rounded" />
                </CardContent>
              </Card>
            </main>

            {/* Sidebar Skeleton */}
            <aside className="md:col-span-1">
              <div className="sticky top-24 space-y-4">
                <Card className="border-2 p-4">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="w-6 h-6 bg-gray-200 rounded" />
                    <div className="space-y-2 w-full">
                      <div className="h-6 w-1/2 bg-gray-200 rounded" />
                      <div className="h-4 w-1/3 bg-gray-200 rounded" />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="h-2 w-full bg-gray-200 rounded-full mb-2" />
                    <div className="h-3 w-1/3 bg-gray-200 rounded" />
                  </div>

                  {/* List Items */}
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-gray-200 shrink-0" />
                        <div className="h-4 w-full bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <div className="mt-6 h-10 w-full bg-gray-200 rounded" />
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson)
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Lesson Not Found</h1>
          <Link to="/modules">
            <Button>Back to Modules</Button>
          </Link>
        </div>
      </div>
    );

  const moduleCompletedArr = completedLessons[lesson.module_id] || [];
  const completedCount = moduleCompletedArr.length;
  const totalCount = moduleLessons.length;
  const progressPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const getStatus = (l: Lesson) => {
    if (moduleCompletedArr.includes(l.id)) return "completed";
    if (l.lesson_order === 1) return "in-progress";
    const prev = moduleLessons.find(
      (m) => m.lesson_order === l.lesson_order - 1
    );
    if (prev && moduleCompletedArr.includes(prev.id)) return "in-progress";
    return "locked";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-secondary" />;
      case "in-progress":
        return <PlayCircle className="w-4 h-4 text-primary" />;
      case "locked":
        return <Lock className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const summary =
    lessonContents.length > 0
      ? lessonContents[0].content.replace(/\n+/g, " ").slice(0, 220) +
        (lessonContents[0].content.length > 220 ? "…" : "")
      : "";

  return (
    // PERUBAHAN: Menyesuaikan padding dan background agar konsisten
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to={`/module/${lesson.module_id}`}>
              <Button variant="ghost" className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <Notebook className="w-7 h-7 text-black" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                  {lesson.title}
                </h1>
                {summary ? (
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                    {summary}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Pelajari materi ini untuk meningkatkan pemahaman dan
                    keterampilan Anda.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <Badge className="px-3 py-1">Lesson {lesson.lesson_order}</Badge>
            <div className="text-sm text-muted-foreground">
              Module progress:{" "}
              <span className="font-semibold text-primary">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <main className="md:col-span-2 space-y-6">
            <Card className={`${!unlocked ? "opacity-60" : ""} border-2`}>
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">
                  {lesson.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {lessonContents.length > 0 && lessonContents[0].video_url ? (
                  <div className="w-full aspect-video rounded-md overflow-hidden bg-black shadow-inner">
                    <iframe
                      className="w-full h-full"
                      src={lessonContents[0].video_url.replace(
                        "watch?v=",
                        "embed/"
                      )}
                      title={lesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-md bg-muted-foreground/10 flex items-center justify-center text-muted-foreground">
                    No video available
                  </div>
                )}

                <div className="bg-gradient-to-r from-surface to-surface-100 border rounded-md p-4 shadow-sm">
                  <h4 className="text-lg font-semibold">Hasil Pembelajaran</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Setelah menyelesaikan pelajaran ini, Anda diharapkan dapat:
                  </p>
                  <ul className="mt-2 ml-4 list-disc text-sm">
                    <li>Memahami konsep utama yang dibahas dalam pelajaran.</li>
                    <li>
                      Mengaplikasikan pengetahuan dasar pada contoh sederhana.
                    </li>
                    <li>
                      Mengukur kemajuan melalui latihan dan menandai pelajaran
                      sebagai selesai.
                    </li>
                  </ul>
                </div>

                {lessonContents.length > 0 ? (
                  lessonContents.map((content) => (
                    <article key={content.id} className="prose max-w-none">
                      <CardDescription>{content.content}</CardDescription>
                      {content.video_url && content !== lessonContents[0] ? (
                        <div className="aspect-video w-full mt-4 rounded-md overflow-hidden">
                          <iframe
                            className="w-full h-full"
                            src={content.video_url.replace(
                              "watch?v=",
                              "embed/"
                            )}
                            title={`${lesson.title}-extra-${content.id}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No content available for this lesson.
                  </p>
                )}

                {!completed && unlocked && (
                  <div className="md:hidden">
                    <Button
                      className="w-full mt-2"
                      onClick={handleCompleteLesson}
                    >
                      Complete Lesson & Next
                    </Button>
                  </div>
                )}

                {!unlocked && (
                  <p className="text-red-600 font-semibold mt-2">
                    Lesson Locked. Complete previous lesson first.
                  </p>
                )}

                {completed && (
                  <div className="mt-2">
                    <Card className="border-0 bg-transparent p-0">
                      <CardContent className="p-4 bg-green-50 border rounded-md flex items-center gap-4">
                        <Trophy className="w-8 h-8 text-green-600" />
                        <div>
                          <div className="text-sm font-semibold text-green-700">
                            Selamat — Pelajaran Selesai!
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Pelajaran telah ditandai selesai.
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes & Resources */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Notes & Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notesLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading notes...
                  </p>
                ) : null}

                {notes.length > 0 ? (
                  <div className="space-y-3">
                    {notes.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 bg-white border rounded-md"
                      >
                        <div className="text-sm whitespace-pre-wrap">
                          {n.content}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {n.user_id ? `Saved` : "Local"} •{" "}
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Gunakan area ini untuk menyimpan catatan pribadi, link
                    referensi, atau file pendukung pelajaran.
                  </p>
                )}

                {!showNoteForm ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNoteForm(true)}
                    >
                      Add Note
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        alert("Download Materials - belum diimplementasikan.");
                      }}
                    >
                      Download Materials
                    </Button>
                  </div>
                ) : null}

                {showNoteForm && (
                  <div className="flex gap-2 items-start">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Tulis catatan Anda di sini..."
                      className="flex-1 min-h-[96px] p-3 border rounded-md resize-none focus:outline-none focus:ring focus:ring-primary/30"
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleSubmitNote}
                        className="whitespace-nowrap"
                      >
                        Kirim
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowNoteForm(false);
                          setNoteText("");
                        }}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>

          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="border-2 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Notebook className="w-6 h-6 text-black mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Course Content</h3>
                    <div className="text-sm text-muted-foreground">
                      {totalCount} lessons
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {completedCount} of {totalCount} completed
                  </div>
                </div>

                {/* Lesson list */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {moduleLessons.map((l) => {
                    const status = getStatus(l);
                    return (
                      <div
                        key={l.id}
                        className={`flex items-center justify-between p-2 rounded-md ${
                          status === "locked"
                            ? "opacity-60"
                            : "hover:bg-muted/50 cursor-pointer"
                        }`}
                        onClick={() => {
                          if (status !== "locked")
                            navigate(`/module/${l.module_id}/lesson/${l.id}`);
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex-shrink-0">
                            {getStatusIcon(status)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                              {l.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Lesson {l.lesson_order}
                            </div>
                          </div>
                        </div>

                        <div className="text-xs">
                          {status === "completed" && (
                            <Badge className="px-2 py-0">Done</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Complete button (desktop) */}
                <div className="mt-4">
                  {!completed && unlocked ? (
                    <Button className="w-full" onClick={handleCompleteLesson}>
                      Complete Lesson & Next
                    </Button>
                  ) : completed ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => navigate(-1)}
                    >
                      Return
                    </Button>
                  ) : (
                    <Button className="w-full" disabled>
                      Locked
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