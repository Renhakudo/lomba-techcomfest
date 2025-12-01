import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, Circle, Lock, PlayCircle, BookOpen, Trophy } from "lucide-react";

const ModuleDetail = () => {
  const { moduleId } = useParams();

  const moduleData: any = {
    communication: {
      title: "Communication Skills",
      description: "Master verbal and written communication for professional success",
      color: "from-blue-500 to-cyan-500",
      lessons: [
        { id: 1, title: "Introduction to Effective Communication", duration: "15 min", status: "completed" },
        { id: 2, title: "Active Listening Techniques", duration: "20 min", status: "completed" },
        { id: 3, title: "Non-Verbal Communication", duration: "18 min", status: "completed" },
        { id: 4, title: "Professional Email Writing", duration: "25 min", status: "in-progress" },
        { id: 5, title: "Presentation Skills", duration: "30 min", status: "locked" },
        { id: 6, title: "Difficult Conversations", duration: "22 min", status: "locked" },
      ],
      progress: 50,
    },
    teamwork: {
      title: "Teamwork & Collaboration",
      description: "Build strong team dynamics and collaborative excellence",
      color: "from-green-500 to-emerald-500",
      lessons: [
        { id: 1, title: "Understanding Team Dynamics", duration: "15 min", status: "completed" },
        { id: 2, title: "Building Trust in Teams", duration: "20 min", status: "completed" },
        { id: 3, title: "Conflict Resolution", duration: "25 min", status: "in-progress" },
        { id: 4, title: "Collaborative Tools & Techniques", duration: "18 min", status: "locked" },
        { id: 5, title: "Leading Remote Teams", duration: "22 min", status: "locked" },
      ],
      progress: 40,
    },
    "problem-solving": {
      title: "Problem-Solving",
      description: "Develop critical thinking and creative solution strategies",
      color: "from-orange-500 to-amber-500",
      lessons: [
        { id: 1, title: "Problem Identification", duration: "15 min", status: "locked" },
        { id: 2, title: "Root Cause Analysis", duration: "20 min", status: "locked" },
        { id: 3, title: "Creative Thinking Methods", duration: "25 min", status: "locked" },
        { id: 4, title: "Decision-Making Frameworks", duration: "22 min", status: "locked" },
      ],
      progress: 0,
    },
    "time-management": {
      title: "Time Management",
      description: "Optimize productivity and achieve work-life balance",
      color: "from-purple-500 to-pink-500",
      lessons: [
        { id: 1, title: "Time Audit & Analysis", duration: "15 min", status: "completed" },
        { id: 2, title: "Prioritization Techniques", duration: "18 min", status: "completed" },
        { id: 3, title: "Eliminating Time Wasters", duration: "20 min", status: "completed" },
        { id: 4, title: "Creating Effective Schedules", duration: "22 min", status: "completed" },
      ],
      progress: 100,
    },
  };

  const module = moduleData[moduleId as string];

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

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back Button */}
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
          <h1 className="text-5xl font-bold mb-4">{module.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{module.description}</p>
          
          <div className="flex items-center gap-6 mb-6">
            <Badge className="text-base px-4 py-1">
              {module.lessons.length} Lessons
            </Badge>
            <span className="text-muted-foreground">
              Complete all lessons to earn your certificate
            </span>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Overall Progress</span>
              <span className="text-primary font-bold">{module.progress}%</span>
            </div>
            <Progress value={module.progress} className="h-3" />
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Course Content</h2>
          {module.lessons.map((lesson: any, index: number) => (
            <Card
              key={lesson.id}
              className={`card-hover border-2 ${
                lesson.status === "locked" ? "opacity-60" : "cursor-pointer"
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(lesson.status)}
                    <div>
                      <CardTitle className="text-lg">
                        Lesson {index + 1}: {lesson.title}
                      </CardTitle>
                      <CardDescription>{lesson.duration}</CardDescription>
                    </div>
                  </div>
                  <Button
                    disabled={lesson.status === "locked"}
                    variant={lesson.status === "completed" ? "outline" : "default"}
                    size="sm"
                  >
                    {lesson.status === "locked" && "Locked"}
                    {lesson.status === "in-progress" && "Continue"}
                    {lesson.status === "completed" && "Review"}
                    {lesson.status === "not-started" && "Start"}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Certificate Section */}
        {module.progress === 100 && (
          <Card className="mt-12 bg-gradient-to-br from-secondary/10 to-accent/10 border-2 border-secondary">
            <CardContent className="p-8 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-accent" />
              <h3 className="text-2xl font-bold mb-3">🎉 Congratulations!</h3>
              <p className="text-muted-foreground mb-6">
                You've completed this module. Download your certificate to showcase your achievement.
              </p>
              <Button className="btn-gradient-success">
                Download Certificate
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ModuleDetail;
