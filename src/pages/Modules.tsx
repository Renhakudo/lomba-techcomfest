import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PlayCircle, BookOpen } from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string;
  color: string;
  image_url: string | null; // Kolom baru dari database
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
        // UPDATE QUERY: Menambahkan image_url
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("id, title, description, color, image_url, lessons(id)")
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
    if (progress === 100) return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Completed</Badge>;
    if (progress > 0) return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">In Progress</Badge>;
    return <Badge variant="outline" className="text-gray-500 border-gray-200">Not Started</Badge>;
  };

  // --- SKELETON LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-12 text-center space-y-4 animate-pulse">
            <div className="h-10 w-64 bg-gray-200 rounded mx-auto" />
            <div className="h-6 w-96 bg-gray-200 rounded mx-auto" />
          </div>

          <div className="grid md:grid-cols-1 gap-8 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row bg-white rounded-2xl p-6 border shadow-sm h-auto sm:h-64 animate-pulse gap-6">
                <div className="w-full sm:w-1/3 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-4 py-2">
                  <div className="h-8 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-12 bg-gray-200 rounded w-40 mt-6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN CONTENT ---
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Learning Modules
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Focus on practice & portfolio building with our structured learning paths.
          </p>
        </div>

        {/* List Layout - Single Column for clearer, wider cards */}
        <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto">
          {modules.map((module) => (
            <Card 
              key={module.id} 
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-none shadow-md bg-white rounded-3xl"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row h-full">
                  
                  {/* --- LEFT SIDE: IMAGE --- */}
                  <div className="relative w-full md:w-2/5 min-h-[240px] md:min-h-full">
                    {module.image_url ? (
                        <img 
                            src={module.image_url} 
                            alt={module.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        // Fallback jika tidak ada gambar
                        <div className={`w-full h-full bg-gradient-to-br ${module.color} flex items-center justify-center p-10`}>
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
                                <BookOpen className="w-12 h-12 text-white" />
                            </div>
                        </div>
                    )}
                    
                    {/* Status Badge Overlay on Image (Mobile) */}
                    <div className="absolute top-4 left-4 md:hidden">
                        {getStatusBadge(module.progress)}
                    </div>
                  </div>

                  {/* --- RIGHT SIDE: CONTENT --- */}
                  <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
                    
                    <div className="mb-4 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                                {module.title}
                            </h2>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                                <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 px-3 py-1">
                                    {module.level}
                                </Badge>
                                <span>•</span>
                                <span>{module.lessons_count} Lessons</span>
                                <span>•</span>
                                <span>{module.duration}</span>
                            </div>
                        </div>
                        {/* Status Icon Desktop */}
                        <div className="hidden md:block">
                            {getStatusIcon(module.progress)}
                        </div>
                    </div>

                    <CardDescription className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                      {module.description}
                    </CardDescription>

                    <div className="mt-auto">
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <Link to={`/module/${module.id}`} className="w-full sm:w-auto">
                                <Button 
                                    size="lg" 
                                    className="w-full sm:w-auto font-bold text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all rounded-xl" 
                                    variant={module.progress === 100 ? "outline" : "default"}
                                >
                                    {module.progress === 100 ? "Review Material" : "Start Learning"}
                                </Button>
                            </Link>
                            
                            {/* Progress Bar Info */}
                            {module.progress > 0 && (
                                <div className="flex-1 w-full sm:w-auto flex items-center gap-3">
                                    <div className="h-2.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full bg-gradient-to-r ${module.color}`} 
                                            style={{ width: `${module.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                                        {module.progress}% Complete
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Modules;