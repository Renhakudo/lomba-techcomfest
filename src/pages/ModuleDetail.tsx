import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Lock,
  PlayCircle,
  BookOpen,
  Trophy,
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  duration: string;
  lesson_order: number;
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
  const [module, setModule] = useState<Module | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Record<string, number[]>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModuleAndUser = async () => {
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

        // Ambil module & lessons
        const { data: moduleData, error: moduleError } = await supabase
          .from("modules")
          .select("id, title, description, color, lessons(id, title, duration, lesson_order)")
          .eq("id", moduleId)
          .single();

        if (moduleError || !moduleData) {
          console.error("Module not found:", moduleError);
          setModule(null);
          setLoading(false);
          return;
        }

        setModule(moduleData as Module);

        // Ambil completed_lessons user dari profiles
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("completed_lessons")
          .eq("id", uid)
          .single();

        if (profileError || !profileData) {
          console.error("Error fetching profile:", profileError);
          setCompletedLessons({});
        } else {
          setCompletedLessons(profileData.completed_lessons || {});
        }

      } catch (err) {
        console.error(err);
        setModule(null);
      }

      setLoading(false);
    };

    fetchModuleAndUser();
  }, [moduleId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Module Not Found</h1>
          <Link to="/modules">
            <Button>Back to Modules</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sortedLessons = [...module.lessons].sort((a, b) => a.lesson_order - b.lesson_order);
  const userCompletedLessons = completedLessons[module.id] || [];

  const getLessonStatus = (lesson: Lesson, index: number) => {
    if (userCompletedLessons.includes(lesson.id)) return "completed";
    if (index === 0) return "in-progress"; // lesson pertama selalu unlocked
    const prevLesson = sortedLessons[index - 1];
    if (userCompletedLessons.includes(prevLesson.id)) return "in-progress";
    return "locked";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-secondary" />;
      case "in-progress":
        return <PlayCircle className="w-5 h-5 text-primary" />;
      case "locked":
        return <Lock className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleLessonClick = (lesson: Lesson, status: string) => {
    if (status === "in-progress" || status === "completed") {
      navigate(`/module/:moduleId/lesson/${lesson.id}`);
    }
  };

  const completedCount = sortedLessons.filter((l) => userCompletedLessons.includes(l.id)).length;
  const totalCount = sortedLessons.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link to="/modules">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Modules
          </Button>
        </Link>

        {/* Module Header */}
        <div className="mb-12">
          <div
            className={`inline-block w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg mb-6`}
          >
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4">{module.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{module.description}</p>

          <div className="flex items-center gap-6 mb-6">
            <Badge className="text-base px-4 py-1">{sortedLessons.length} Lessons</Badge>
            <span className="text-muted-foreground">
              Complete all lessons to earn your certificate
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Overall Progress</span>
              <span className="text-primary font-bold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Course Content</h2>
          {sortedLessons.map((lesson, index) => {
            const status = getLessonStatus(lesson, index);
            return (
              <Card
                key={lesson.id}
                className={`card-hover border-2 ${
                  status === "locked" ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={() => handleLessonClick(lesson, status)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(status)}
                      <div>
                        <CardTitle className="text-lg">{lesson.title}</CardTitle>
                        <CardDescription>{lesson.duration}</CardDescription>
                      </div>
                    </div>
                    <Button
                      disabled={status === "locked"}
                      variant={status === "completed" ? "outline" : "default"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLessonClick(lesson, status);
                      }}
                    >
                      {status === "locked" && "Locked"}
                      {status === "in-progress" && "Continue"}
                      {status === "completed" && "Preview"}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Certificate Section */}
        {progress === 100 && (
          <Card className="mt-12 bg-gradient-to-br from-secondary/10 to-accent/10 border-2 border-secondary">
            <CardContent className="p-8 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-accent" />
              <h3 className="text-2xl font-bold mb-3">🎉 Congratulations!</h3>
              <p className="text-muted-foreground mb-6">
                You've completed this module. Download your certificate to showcase your achievement.
              </p>
              <Button className="btn-gradient-success">Download Certificate</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ModuleDetail;
