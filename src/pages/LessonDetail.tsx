import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { calculateLevel } from "@/lib/leveling";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

const LessonDetail = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessonContents, setLessonContents] = useState<LessonContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Record<string, number[]>>({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndLesson = async () => {
      setLoading(true);

      try {
        // Ambil session user
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          console.error("User not logged in");
          setLoading(false);
          return;
        }

        const uid = session.user.id;
        setUserId(uid);

        // Ambil profiles user untuk completed lessons
        const { data: profileData } = await supabase
          .from("profiles")
          .select("xp, level, completed_lessons")
          .eq("id", uid)
          .single();

        const completedData = profileData?.completed_lessons || {};
        setCompletedLessons(completedData);

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

        // Ambil lesson contents
        const { data: contentData } = await supabase
          .from("lesson_contents")
          .select("id, lesson_id, content, video_url")
          .eq("lesson_id", lessonId)
          .order("id");

        setLessonContents(contentData || []);

        // Cek apakah lesson sudah diselesaikan
        const completedLessonsModule = completedData[lessonData.module_id] || [];
        setCompleted(completedLessonsModule.includes(lessonData.id));

        // Cek unlocked: lesson pertama unlocked, atau lesson sebelumnya selesai
        if (lessonData.lesson_order === 1) {
          setUnlocked(true);
        } else {
          const prevLessonOrder = lessonData.lesson_order - 1;
          // Cari lesson dengan order sebelumnya
          const { data: prevLesson } = await supabase
            .from("lessons")
            .select("id")
            .eq("module_id", lessonData.module_id)
            .eq("lesson_order", prevLessonOrder)
            .single();

          if (prevLesson && completedLessonsModule.includes(prevLesson.id)) {
            setUnlocked(true);
          } else {
            setUnlocked(false);
          }
        }

      } catch (err) {
        console.error(err);
        setLesson(null);
        setLessonContents([]);
      }

      setLoading(false);
    };

    fetchUserAndLesson();
  }, [lessonId]);

  const handleCompleteLesson = async () => {
    if (!lesson || !userId) return;
    if (!unlocked) return;

    try {
      // Ambil current XP & completed_lessons
      const { data: profileData } = await supabase
        .from("profiles")
        .select("xp, completed_lessons")
        .eq("id", userId)
        .single();

      const currentXP = profileData?.xp || 0;
      const newXP = currentXP + 10;
      const newLevel = calculateLevel(newXP);

      // Update completed_lessons
      const prevCompleted = profileData?.completed_lessons || {};
      const moduleLessons = prevCompleted[lesson.module_id] || [];
      const updatedModuleLessons = [...moduleLessons, lesson.id];

      const updatedCompletedLessons = {
        ...prevCompleted,
        [lesson.module_id]: updatedModuleLessons,
      };

      // Update profile
      await supabase
        .from("profiles")
        .update({ xp: newXP, level: newLevel, completed_lessons: updatedCompletedLessons })
        .eq("id", userId);

      setCompleted(true);
      setCompletedLessons(updatedCompletedLessons);

      // Cari next lesson
      const { data: nextLessonData } = await supabase
        .from("lessons")
        .select("id, lesson_order")
        .eq("module_id", lesson.module_id)
        .gt("lesson_order", lesson.lesson_order)
        .order("lesson_order")
        .limit(1)
        .single();

      if (nextLessonData) {
        navigate(`/lesson/${nextLessonData.id}`);
      } else {
        navigate(`/module/${lesson.module_id}`);
      }

    } catch (err) {
      console.error("Failed to complete lesson:", err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!lesson)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Lesson Not Found</h1>
          <Link to="/modules">
            <Button>Back to Modules</Button>
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to={`/module/${lesson.module_id}`}>
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Module
          </Button>
        </Link>

        <Card className={`border-2 ${!unlocked ? "opacity-50" : ""}`}>
          <CardHeader>
            <CardTitle className="text-3xl">{lesson.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {lessonContents.length > 0 ? (
              lessonContents.map((content) => (
                <div key={content.id} className="space-y-4">
                  <CardDescription>{content.content}</CardDescription>
                  {content.video_url && (
                    <div className="aspect-video w-full">
                      <iframe
                        className="w-full h-full"
                        src={content.video_url.replace("watch?v=", "embed/")}
                        title={lesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No content available for this lesson.</p>
            )}

            {!completed && unlocked && (
              <Button className="mt-4 w-full" onClick={handleCompleteLesson}>
                Complete Lesson & Next (+10 XP)
              </Button>
            )}

            {!unlocked && (
              <p className="text-red-600 font-semibold mt-2">
                Lesson Locked. Complete previous lesson first.
              </p>
            )}

            {completed && <p className="text-green-600 font-semibold mt-2">Lesson Completed!</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LessonDetail;
