import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, Zap, Award, TrendingUp, Medal, Crown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Gamification = () => {
  const userStats = {
    totalPoints: 3850,
    level: 12,
    nextLevelPoints: 4000,
    rank: 23,
    totalUsers: 1234,
    streak: 15,
  };

  const badges = [
    { name: "First Steps", icon: "🎯", earned: true, description: "Complete your first lesson" },
    { name: "Week Warrior", icon: "⚡", earned: true, description: "7-day learning streak" },
    { name: "Communicator", icon: "💬", earned: true, description: "Complete Communication module" },
    { name: "Team Player", icon: "🤝", earned: true, description: "Complete Teamwork module" },
    { name: "Problem Solver", icon: "🧩", earned: false, description: "Complete Problem-Solving module" },
    { name: "Time Master", icon: "⏰", earned: true, description: "Complete Time Management module" },
    { name: "Discussion Star", icon: "⭐", earned: true, description: "50 forum contributions" },
    { name: "Helper", icon: "🙋", earned: true, description: "Help 10 fellow learners" },
    { name: "Perfectionist", icon: "💯", earned: false, description: "Score 100% on 5 quizzes" },
  ];

  const missions = [
    {
      title: "Daily Challenge",
      description: "Complete 3 lessons today",
      progress: 2,
      total: 3,
      reward: 150,
      expires: "23h",
    },
    {
      title: "Week Quest",
      description: "Maintain your learning streak for 7 days",
      progress: 5,
      total: 7,
      reward: 500,
      expires: "2d",
    },
    {
      title: "Forum Explorer",
      description: "Start 5 discussions this week",
      progress: 3,
      total: 5,
      reward: 300,
      expires: "4d",
    },
  ];

  const leaderboard = [
    { rank: 1, name: "Alex Thompson", points: 8950, avatar: "AT", badge: "👑" },
    { rank: 2, name: "Maria Garcia", points: 7820, avatar: "MG", badge: "🥈" },
    { rank: 3, name: "James Lee", points: 7230, avatar: "JL", badge: "🥉" },
    { rank: 4, name: "Emma Wilson", points: 6540, avatar: "EW", badge: "" },
    { rank: 5, name: "Ryan Kumar", points: 5890, avatar: "RK", badge: "" },
    { rank: 23, name: "You", points: 3850, avatar: "ME", badge: "", isCurrentUser: true },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
            Achievements & Rewards
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Track your progress, earn badges, and compete with fellow learners
          </p>
        </div>

        {/* User Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12 max-w-6xl mx-auto">
          <Card className="stat-card bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-accent" />
              <div className="text-4xl font-bold text-accent mb-1">
                {userStats.totalPoints}
              </div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </CardContent>
          </Card>

          <Card className="stat-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 mx-auto mb-3 text-primary" />
              <div className="text-4xl font-bold text-primary mb-1">
                Level {userStats.level}
              </div>
              <div className="text-sm text-muted-foreground">Current Level</div>
            </CardContent>
          </Card>

          <Card className="stat-card bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-secondary" />
              <div className="text-4xl font-bold text-secondary mb-1">
                #{userStats.rank}
              </div>
              <div className="text-sm text-muted-foreground">Global Rank</div>
            </CardContent>
          </Card>

          <Card className="stat-card bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 mx-auto mb-3 text-orange-500" />
              <div className="text-4xl font-bold text-orange-500 mb-1">
                {userStats.streak}
              </div>
              <div className="text-sm text-muted-foreground">Day Streak 🔥</div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="mb-12 max-w-6xl mx-auto border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Progress to Level {userStats.level + 1}</h3>
                <p className="text-sm text-muted-foreground">
                  {userStats.nextLevelPoints - userStats.totalPoints} points to go!
                </p>
              </div>
              <Badge className="btn-gradient-primary text-lg px-4 py-2">
                Level {userStats.level}
              </Badge>
            </div>
            <Progress
              value={(userStats.totalPoints / userStats.nextLevelPoints) * 100}
              className="h-4"
            />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Badges Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Award className="w-6 h-6" />
                  Badges Collection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  {badges.map((badge, index) => (
                    <Card
                      key={index}
                      className={`card-hover text-center p-4 ${
                        badge.earned
                          ? "bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30"
                          : "opacity-50 grayscale"
                      }`}
                    >
                      <div className={`text-5xl mb-3 ${badge.earned ? "badge-shine" : ""}`}>
                        {badge.icon}
                      </div>
                      <h4 className="font-bold mb-1">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {badge.description}
                      </p>
                      {badge.earned && (
                        <Badge className="mt-3 btn-gradient-success text-xs">
                          Unlocked
                        </Badge>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Missions */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="w-6 h-6" />
                  Active Missions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {missions.map((mission, index) => (
                  <Card key={index} className="bg-muted/30 border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold mb-1">{mission.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {mission.description}
                          </p>
                        </div>
                        <Badge className="btn-gradient-warm">
                          +{mission.reward} pts
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress: {mission.progress}/{mission.total}
                          </span>
                          <span className="text-primary font-semibold">
                            Expires in {mission.expires}
                          </span>
                        </div>
                        <Progress
                          value={(mission.progress / mission.total) * 100}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <Card className="border-2 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Medal className="w-6 h-6" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaderboard.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      user.isCurrentUser
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-lg font-bold text-muted-foreground w-6">
                        {user.rank}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback
                          className={`${
                            user.isCurrentUser
                              ? "bg-gradient-to-br from-primary to-primary-light"
                              : "bg-gradient-to-br from-muted to-muted-foreground"
                          } text-white font-semibold`}
                        >
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          {user.name}
                          {user.badge && <span>{user.badge}</span>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.points.toLocaleString()} pts
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gamification;
