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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Learning Modules
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Structured learning paths to master essential soft skills. Complete modules at your own pace.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {modules.map((module) => (
            <Card key={module.id} className="card-hover border-2 cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-md`}
                  >
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(module.progress)}
                    {getStatusBadge(module.progress)}
                  </div>
                </div>
                <CardTitle className="text-2xl">{module.title}</CardTitle>
                <CardDescription className="text-base">{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">📚 {module.lessons_count} Lessons</span>
                  <span className="flex items-center gap-1">⏱️ {module.duration}</span>
                  <Badge variant="outline">{module.level}</Badge>
                </div>

                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-primary">{module.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${module.color} transition-all duration-500`}
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>

                <Link to={`/module/${module.id}`}>
                  <Button className="w-full mt-2" variant={module.progress === 100 ? "outline" : "default"}>
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
