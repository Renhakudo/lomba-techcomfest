import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageSquare, ThumbsUp, Eye, Search, Plus, TrendingUp, Star } from "lucide-react";

const Forum = () => {
  const categories = [
    { name: "Communication", color: "bg-blue-500", count: 145 },
    { name: "Teamwork", color: "bg-green-500", count: 98 },
    { name: "Problem-Solving", color: "bg-orange-500", count: 127 },
    { name: "Time Management", color: "bg-purple-500", count: 76 },
  ];

  const discussions = [
    {
      id: 1,
      title: "How do you handle difficult conversations with teammates?",
      author: "Sarah Johnson",
      avatar: "SJ",
      category: "Communication",
      categoryColor: "bg-blue-500",
      replies: 23,
      likes: 45,
      views: 312,
      time: "2 hours ago",
      isPinned: true,
      isTrending: true,
    },
    {
      id: 2,
      title: "Best productivity apps for time management?",
      author: "Mike Chen",
      avatar: "MC",
      category: "Time Management",
      categoryColor: "bg-purple-500",
      replies: 18,
      likes: 32,
      views: 245,
      time: "5 hours ago",
      isPinned: false,
      isTrending: true,
    },
    {
      id: 3,
      title: "Tips for building trust in remote teams",
      author: "Emily Rodriguez",
      avatar: "ER",
      category: "Teamwork",
      categoryColor: "bg-green-500",
      replies: 31,
      likes: 67,
      views: 489,
      time: "1 day ago",
      isPinned: false,
      isTrending: false,
    },
    {
      id: 4,
      title: "Creative problem-solving techniques you swear by?",
      author: "David Park",
      avatar: "DP",
      category: "Problem-Solving",
      categoryColor: "bg-orange-500",
      replies: 15,
      likes: 28,
      views: 198,
      time: "2 days ago",
      isPinned: false,
      isTrending: false,
    },
    {
      id: 5,
      title: "How to improve active listening skills?",
      author: "Lisa Wang",
      avatar: "LW",
      category: "Communication",
      categoryColor: "bg-blue-500",
      replies: 42,
      likes: 89,
      views: 634,
      time: "3 days ago",
      isPinned: false,
      isTrending: true,
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Community Forum
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with fellow learners, share experiences, and get answers to your questions
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Create Post Button */}
            <Button className="w-full btn-gradient-primary shadow-md">
              <Plus className="w-5 h-5 mr-2" />
              New Discussion
            </Button>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{category.count}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
              <CardHeader>
                <CardTitle className="text-lg">Forum Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Posts</span>
                  <span className="text-xl font-bold text-primary">446</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active Users</span>
                  <span className="text-xl font-bold text-secondary">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Today's Posts</span>
                  <span className="text-xl font-bold text-accent">28</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search & Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search discussions..."
                  className="pl-10 h-12 border-2"
                />
              </div>
              <Button variant="outline" className="h-12 border-2">
                Filter
              </Button>
            </div>

            {/* Discussions List */}
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <Card key={discussion.id} className="card-hover border-2 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary-light text-white font-semibold">
                          {discussion.avatar}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {discussion.isPinned && (
                                <Badge variant="secondary" className="text-xs">
                                  📌 Pinned
                                </Badge>
                              )}
                              {discussion.isTrending && (
                                <Badge className="bg-accent text-accent-foreground text-xs">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Trending
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold mb-1 hover:text-primary transition-colors">
                              {discussion.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="font-medium">{discussion.author}</span>
                              <span>•</span>
                              <Badge className={`${discussion.categoryColor} text-white text-xs`}>
                                {discussion.category}
                              </Badge>
                              <span>•</span>
                              <span>{discussion.time}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>{discussion.replies} replies</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{discussion.likes}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>{discussion.views} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center pt-4">
              <Button variant="outline" size="lg" className="border-2">
                Load More Discussions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;
