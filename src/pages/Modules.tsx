import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Lightbulb, Clock, Lock, CheckCircle2, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Modules = () => {
  const modules = [
    {
      id: "communication",
      icon: MessageCircle,
      title: "Communication Skills",
      description: "Master verbal and written communication for professional success",
      color: "from-blue-500 to-cyan-500",
      lessons: 12,
      duration: "4 weeks",
      level: "Beginner",
      progress: 75,
      status: "in-progress",
    },
    {
      id: "teamwork",
      icon: Users,
      title: "Teamwork & Collaboration",
      description: "Build strong team dynamics and collaborative excellence",
      color: "from-green-500 to-emerald-500",
      lessons: 10,
      duration: "3 weeks",
      level: "Intermediate",
      progress: 40,
      status: "in-progress",
    },
    {
      id: "problem-solving",
      icon: Lightbulb,
      title: "Problem-Solving",
      description: "Develop critical thinking and creative solution strategies",
      color: "from-orange-500 to-amber-500",
      lessons: 15,
      duration: "5 weeks",
      level: "Advanced",
      progress: 0,
      status: "locked",
    },
    {
      id: "time-management",
      icon: Clock,
      title: "Time Management",
      description: "Optimize productivity and achieve work-life balance",
      color: "from-purple-500 to-pink-500",
      lessons: 8,
      duration: "2 weeks",
      level: "Beginner",
      progress: 100,
      status: "completed",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-secondary" />;
      case "in-progress":
        return <PlayCircle className="w-5 h-5 text-primary" />;
      case "locked":
        return <Lock className="w-5 h-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="btn-gradient-success">Completed</Badge>;
      case "in-progress":
        return <Badge className="btn-gradient-primary">In Progress</Badge>;
      case "locked":
        return <Badge variant="secondary">Locked</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Learning Modules
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Structured learning paths to master essential soft skills. Complete modules at your own pace
            and unlock advanced content.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {modules.map((module) => (
            <Card
              key={module.id}
              className={`card-hover border-2 ${
                module.status === "locked" ? "opacity-60" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-md`}
                  >
                    <module.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(module.status)}
                    {getStatusBadge(module.status)}
                  </div>
                </div>
                <CardTitle className="text-2xl">{module.title}</CardTitle>
                <CardDescription className="text-base">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Module Info */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    📚 {module.lessons} Lessons
                  </span>
                  <span className="flex items-center gap-1">
                    ⏱️ {module.duration}
                  </span>
                  <Badge variant="outline">{module.level}</Badge>
                </div>

                {/* Progress Bar */}
                {module.status !== "locked" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-primary">
                        {module.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${module.color} transition-all duration-500`}
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Link to={`/module/${module.id}`}>
                  <Button
                    className="w-full mt-2"
                    disabled={module.status === "locked"}
                    variant={module.status === "completed" ? "outline" : "default"}
                  >
                    {module.status === "locked" && "🔒 Complete Previous Modules"}
                    {module.status === "in-progress" && "Continue Learning"}
                    {module.status === "completed" && "Review Module"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">
                📈 Track Your Learning Journey
              </h3>
              <p className="text-muted-foreground mb-6">
                Complete modules to unlock advanced content and earn certificates. 
                Visit your dashboard to see detailed analytics and personalized recommendations.
              </p>
              <Link to="/dashboard">
                <Button className="btn-gradient-primary">
                  View My Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Modules;
