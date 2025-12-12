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
  BrainCircuit,
  SkipForward
} from "lucide-react";

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
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State Adaptive Learning
  const [hasTakenPretest, setHasTakenPretest] = useState(false);
  const [assignedLevel, setAssignedLevel] = useState<string | null>(null);

  useEffect(() => {
    const fetchModuleAndUser = async () => {
      setLoading(true);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.error("User not logged in");
          setLoading(false);
          return;
        }

        const uid = session.user.id;
        setUserId(uid);

        // 1. Ambil Module & Lessons
        const { data: moduleData, error: moduleError } = await supabase
          .from("modules")
          .select("id, title, description, color, lessons(id, title, duration, lesson_order, difficulty_level)")
          .eq("id", moduleId)
          .single();

        if (moduleError || !moduleData) {
          console.error("Module not found:", moduleError);
          setModule(null);
          setLoading(false);
          return;
        }
        setModule(moduleData as unknown as Module);

        // 2. Ambil Completed Lessons dari Profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("completed_lessons")
          .eq("id", uid)
          .single();

        const userCompleted = profileData?.completed_lessons?.[moduleId!] || [];
        setCompletedLessons(userCompleted);

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

  // Helper Warna Badge Level
  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-100 text-green-800 border-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // --- SKELETON LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl animate-pulse">
          {/* Back Button Skeleton */}
          <div className="h-10 w-32 bg-gray-200 rounded-md mb-8" />

          {/* Module Header Skeleton */}
          <div className="mb-12">
            {/* Icon Box */}
            <div className="w-16 h-16 rounded-2xl bg-gray-200 mb-6 shadow-sm" />
            
            {/* Title */}
            <div className="h-10 w-3/4 md:w-1/2 bg-gray-200 rounded-md mb-4" />
            
            {/* Description */}
            <div className="space-y-2 mb-6">
                <div className="h-5 w-full bg-gray-200 rounded-md" />
                <div className="h-5 w-2/3 bg-gray-200 rounded-md" />
            </div>

            {/* Meta Badge */}
            <div className="flex gap-4 mb-6">
                <div className="h-6 w-24 bg-gray-200 rounded-full" />
                <div className="h-6 w-48 bg-gray-200 rounded-md" />
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-10 bg-gray-200 rounded" />
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full" />
            </div>
          </div>

          {/* Lessons List Skeleton */}
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded-md mb-6" />
            
            {/* Loop 4 skeleton cards */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-2 border-gray-200 bg-white rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 w-full">
                    {/* Icon Circle */}
                    <div className="w-5 h-5 rounded-full bg-gray-200 shrink-0" />
                    
                    <div className="w-full">
                      {/* Title & Badge */}
                      <div className="flex items-center gap-2 mb-2">
                          <div className="h-6 w-1/3 bg-gray-200 rounded" />
                          <div className="h-5 w-16 bg-gray-200 rounded" />
                      </div>
                      {/* Duration */}
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </div>
                  </div>
                  {/* Button */}
                  <div className="h-9 w-20 bg-gray-200 rounded-md shrink-0 ml-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!module) return <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">Module Not Found</div>;

  const sortedLessons = [...module.lessons].sort((a, b) => a.lesson_order - b.lesson_order);

  // --- LOGIKA UTAMA ADAPTIVE LEARNING ---
  const isLessonSkipped = (lessonLevel: string | undefined) => {
    if (!assignedLevel || !lessonLevel) return false;
    const uLvl = assignedLevel.toLowerCase();
    const lLvl = lessonLevel.toLowerCase();
    if (uLvl === 'intermediate' && lLvl === 'beginner') return true;
    if (uLvl === 'advanced' && (lLvl === 'beginner' || lLvl === 'intermediate')) return true;
    return false;
  };

  const getLessonStatus = (lesson: Lesson, index: number) => {
    // ATURAN 1: WAJIB PRE-TEST
    if (!hasTakenPretest) return "locked";

    // 2. Cek Manual Completed
    if (completedLessons.includes(lesson.id)) return "completed";

    // 3. Cek Auto-Skipped
    if (isLessonSkipped(lesson.difficulty_level)) return "completed";

    // 4. Logika Unlock Berurutan
    if (index === 0) return "in-progress";
    
    const prevLesson = sortedLessons[index - 1];
    const isPrevDone = completedLessons.includes(prevLesson.id) || isLessonSkipped(prevLesson.difficulty_level);
    
    if (isPrevDone) return "in-progress";
    
    return "locked";
  };

  const handleLessonClick = (lesson: Lesson, status: string) => {
    if (!hasTakenPretest) {
        return;
    }
    if (status === "in-progress" || status === "completed") {
      navigate(`/module/${moduleId}/lesson/${lesson.id}`);
    }
  };

  // Hitung Progress Visual
  const calculateVisualProgress = () => {
      if (sortedLessons.length === 0) return 0;
      // Hitung yang completed manual ATAU skipped level
      const doneCount = sortedLessons.filter(l => 
          completedLessons.includes(l.id) || isLessonSkipped(l.difficulty_level)
      ).length;
      return Math.round((doneCount / sortedLessons.length) * 100);
  };
  const progressPercent = calculateVisualProgress();

  return (
    // PERUBAHAN DISINI:
    // 1. bg-gray-50: Menyamakan background.
    // 2. pt-24: Menambahkan jarak dari atas navbar fixed.
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link to="/modules">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Modules
          </Button>
        </Link>

        {/* Module Header */}
        <div className="mb-12">
          <div className={`inline-block w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg mb-6`}>
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{module.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{module.description}</p>

          <div className="flex items-center gap-6 mb-6">
            <Badge className="text-base px-4 py-1">{sortedLessons.length} Lessons</Badge>
            <span className="text-muted-foreground text-sm md:text-base">Complete all lessons to earn your certificate</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Overall Progress</span>
              <span className="text-primary font-bold">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>
        </div>

        {/* --- PRE-TEST SECTION --- */}
        {!hasTakenPretest && (
          <Card className="mb-10 border-primary bg-blue-50/50">
            <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                  <BrainCircuit className="w-6 h-6" />
                  Cek Level Kamu!
                </h3>
                <p className="text-muted-foreground mt-1">
                  Wajib ikuti tes singkat sebelum mengakses materi. Jika nilai tinggi, materi dasar otomatis terlewati!
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={() => navigate(`/module/${module.id}/pre-test`)} 
                className="whitespace-nowrap shadow-md"
              >
                Mulai Pre-Test
              </Button>
            </CardContent>
          </Card>
        )}

        {/* --- LEVEL INFO --- */}
        {hasTakenPretest && assignedLevel && (
          <div className="mb-8 p-4 bg-white border shadow-sm rounded-lg flex items-center gap-3 animate-in fade-in duration-500">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span className="text-sm md:text-base">
              Start Level: <span className={`uppercase font-bold px-2 py-0.5 rounded text-xs border ${getLevelBadgeColor(assignedLevel)} mx-1`}>{assignedLevel}</span>
            </span>
          </div>
        )}

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Course Content</h2>
          {sortedLessons.map((lesson, index) => {
            const status = getLessonStatus(lesson, index);
            const skipped = isLessonSkipped(lesson.difficulty_level);

            return (
              <Card
                key={lesson.id}
                className={`card-hover border-2 transition-all duration-300 ${
                  status === "locked" ? "opacity-60 cursor-not-allowed bg-slate-50" : "cursor-pointer bg-white hover:border-primary"
                }`}
                onClick={() => handleLessonClick(lesson, status)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      {status === "completed" ? (
                        skipped ? <div title="Skipped"><SkipForward className="w-5 h-5 text-blue-500"/></div> : <CheckCircle2 className="w-5 h-5 text-secondary" />
                      ) : status === "in-progress" ? (
                        <PlayCircle className="w-5 h-5 text-primary animate-pulse" />
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                      
                      <div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{lesson.title}</CardTitle>
                            {lesson.difficulty_level && (
                                <Badge variant="outline" className={`text-[10px] h-5 px-1.5 font-normal uppercase ${getLevelBadgeColor(lesson.difficulty_level)}`}>
                                    {lesson.difficulty_level}
                                </Badge>
                            )}
                        </div>
                        <CardDescription className="flex items-center gap-2">
                            {lesson.duration}
                            {skipped && status === 'completed' && <span className="text-blue-600 text-xs font-medium">• Skipped (Auto-pass)</span>}
                        </CardDescription>
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
                      {status === "in-progress" && "Start"}
                      {status === "completed" && "Review"}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Certificate Section */}
        {progressPercent === 100 && (
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