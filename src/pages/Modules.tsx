import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, CheckCircle2, PlayCircle } from "lucide-react";

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
  const [completedLessons, setCompletedLessons] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
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

        // Ambil modules & lessons
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("id, title, description, color, lessons(id)")
          .order("id", { ascending: true });

        if (modulesError || !modulesData) {
          console.error("Error fetching modules:", modulesError);
          setModules([]);
          setLoading(false);
          return;
        }

        // Ambil completed_lessons user dari profiles
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("completed_lessons")
          .eq("id", uid)
          .single();

        const userCompletedLessons = profileError || !profileData ? {} : profileData.completed_lessons || {};
        setCompletedLessons(userCompletedLessons);

        // Hitung progress per modul
        const modulesWithProgress = modulesData.map((mod: any) => {
          const totalLessons = mod.lessons?.length || 0;
          const completedCount = (userCompletedLessons[mod.id]?.length) || 0;
          const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
          return {
            ...mod,
            lessons_count: totalLessons,
            duration: `${totalLessons * 15} min`,
            level: "Beginner",
            progress,
          };
        });

        setModules(modulesWithProgress);
      } catch (err) {
        console.error("Unexpected error:", err);
        setModules([]);
      }

      setLoading(false);
    };

    fetchModules();
  }, []);

  const getStatusIcon = (progress: number) => {
    if (progress === 100) return <CheckCircle2 className="w-5 h-5 text-secondary" />;
    if (progress > 0) return <PlayCircle className="w-5 h-5 text-primary" />;
    return null;
  };

  const getStatusBadge = (progress: number) => {
    if (progress === 100) return <Badge className="btn-gradient-success">Completed</Badge>;
    if (progress > 0) return <Badge className="btn-gradient-primary">In Progress</Badge>;
    return <Badge variant="secondary">Not Started</Badge>;
  };

  // --- SKELETON LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header Skeleton */}
          <div className="mb-12 text-center space-y-4 animate-pulse">
            <div className="h-10 w-64 bg-gray-200 rounded mx-auto" />
            <div className="h-6 w-96 bg-gray-200 rounded mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Generate 4 skeleton cards */}
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-2 bg-white">
                <CardHeader className="pb-2">
                  <div className="flex gap-5 items-start">
                    {/* Icon Skeleton */}
                    <div className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse shrink-0" />
                    
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex justify-between items-start">
                        {/* Title Skeleton */}
                        <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse" />
                        {/* Badge Skeleton */}
                        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                      </div>
                      {/* Description Skeleton */}
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  {/* Meta Info Skeleton */}
                  <div className="flex gap-4">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>

                  {/* Progress Bar Skeleton */}
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between">
                       <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                       <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-2.5 w-full bg-gray-200 rounded-full animate-pulse" />
                  </div>

                  {/* Button Skeleton */}
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN CONTENT ---
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Learning Modules
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Structured learning paths to master essential soft skills. Complete modules at your own pace.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {modules.map((module) => (
            <Card key={module.id} className="card-hover border-2 cursor-pointer transition-all duration-300 hover:shadow-lg bg-white">
              <CardHeader className="pb-2">
                <div className="flex gap-5 items-start">
                  {/* --- KIRI: ICON --- */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-md shrink-0`}
                  >
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>

                  {/* --- KANAN: KONTEN --- */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      {/* Judul */}
                      <CardTitle className="text-2xl font-bold leading-tight">{module.title}</CardTitle>
                      
                      {/* Status Badge (Tetap di kanan atas) */}
                      <div className="flex items-center gap-2 shrink-0 ml-1">
                        {getStatusIcon(module.progress)}
                        {getStatusBadge(module.progress)}
                      </div>
                    </div>
                    
                    {/* Deskripsi (Di bawah judul, tetap di sebelah kanan icon) */}
                    <CardDescription className="text-base mt-2 leading-snug">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-2">
                {/* Meta Info */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground pl-1">
                  <span className="flex items-center gap-1">📚 {module.lessons_count} Lessons</span>
                  <span className="flex items-center gap-1">⏱️ {module.duration}</span>
                  <Badge variant="outline" className="border-muted-foreground/30">{module.level}</Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Progress</span>
                    <span className="font-bold text-primary">{module.progress}%</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${module.color} transition-all duration-700 ease-out`}
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>

                {/* Button */}
                <Link to={`/module/${module.id}`}>
                  <Button className="w-full mt-2 font-semibold shadow-sm" variant={module.progress === 100 ? "outline" : "default"}>
                    {module.progress === 100 ? "Review Module" : "View Lessons"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Modules;