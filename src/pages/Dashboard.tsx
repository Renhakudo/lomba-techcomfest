import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BarChart,
  Calendar,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  MessageSquare,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const userProfile = {
    name: "Alex Student",
    avatar: "AS",
    level: 12,
    totalPoints: 3850,
    completedModules: 2,
    totalModules: 4,
    streak: 15,
  };

  const weeklyActivity = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 1.8 },
    { day: "Wed", hours: 3.2 },
    { day: "Thu", hours: 2.1 },
    { day: "Fri", hours: 1.5 },
    { day: "Sat", hours: 0.8 },
    { day: "Sun", hours: 2.3 },
  ];

  const moduleProgress = [
    { name: "Communication", progress: 75, color: "bg-blue-500" },
    { name: "Teamwork", progress: 40, color: "bg-green-500" },
    { name: "Problem-Solving", progress: 0, color: "bg-orange-500" },
    { name: "Time Management", progress: 100, color: "bg-purple-500" },
  ];

  const recommendations = [
    {
      title: "Complete Communication Module",
      description: "3 lessons remaining",
      icon: MessageSquare,
      link: "/module/communication",
    },
    {
      title: "Join Today's Discussion",
      description: "New trending topic in forum",
      icon: MessageSquare,
      link: "/forum",
    },
    {
      title: "Daily Challenge Available",
      description: "Earn 150 bonus points",
      icon: Target,
      link: "/gamification",
    },
  ];

  const recentAchievements = [
    { icon: "⏰", name: "Time Master", date: "Yesterday" },
    { icon: "🔥", name: "15-Day Streak", date: "Today" },
    { icon: "💬", name: "Forum Contributor", date: "2 days ago" },
  ];

  const maxHours = Math.max(...weeklyActivity.map((d) => d.hours));

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-light text-white text-2xl font-bold">
                {userProfile.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {userProfile.name}! 👋
              </h1>
              <p className="text-lg text-muted-foreground">
                Level {userProfile.level} • {userProfile.totalPoints} points
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/modules">
              <Button className="btn-gradient-primary">Continue Learning</Button>
            </Link>
            <Link to="/gamification">
              <Button variant="outline" className="border-2">
                View Achievements
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="stat-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-primary">
                        {userProfile.completedModules}/{userProfile.totalModules}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Modules Done
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-secondary">12</div>
                      <div className="text-sm text-muted-foreground">
                        Badges Earned
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-orange-500">
                        {userProfile.streak} 🔥
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Day Streak
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Module Progress */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <TrendingUp className="w-6 h-6" />
                  Learning Progress
                </CardTitle>
                <CardDescription>Your progress across all modules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {moduleProgress.map((module) => (
                  <div key={module.name}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{module.name}</span>
                      <span className="text-primary font-bold">
                        {module.progress}%
                      </span>
                    </div>
                    <Progress value={module.progress} className="h-3" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BarChart className="w-6 h-6" />
                  This Week's Activity
                </CardTitle>
                <CardDescription>Hours spent learning each day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-4 h-48">
                  {weeklyActivity.map((day) => (
                    <div
                      key={day.day}
                      className="flex-1 flex flex-col items-center gap-3"
                    >
                      <div className="flex-1 w-full flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-primary to-primary-light rounded-t-lg transition-all hover:opacity-80"
                          style={{
                            height: `${(day.hours / maxHours) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-semibold text-muted-foreground">
                          {day.day}
                        </div>
                        <div className="text-xs text-primary font-bold">
                          {day.hours}h
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Recommended Actions */}
            <Card className="border-2 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recommended for You
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.map((rec, index) => (
                  <Link key={index} to={rec.link}>
                    <Card className="card-hover bg-muted/30 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center flex-shrink-0">
                            <rec.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-1 text-sm">
                              {rec.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {rec.description}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAchievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20"
                  >
                    <div className="text-3xl">{achievement.icon}</div>
                    <div>
                      <div className="font-semibold">{achievement.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {achievement.date}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Study Time Goal */}
            <Card className="border-2 bg-gradient-to-br from-secondary/10 to-accent/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Weekly Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-secondary mb-2">
                    14.2h
                  </div>
                  <div className="text-sm text-muted-foreground">
                    of 15h goal
                  </div>
                </div>
                <Progress value={94.6} className="h-3 mb-4" />
                <p className="text-sm text-center text-muted-foreground">
                  Almost there! Just 0.8h more this week 💪
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
