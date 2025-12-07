// src/pages/Forum.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  Search,
  Plus,
  TrendingUp,
  Tags,
  Users,
} from "lucide-react";

const initialCategories = [
  { name: "Communication", color: "bg-blue-500" },
  { name: "Teamwork", color: "bg-green-500" },
  { name: "Problem-Solving", color: "bg-orange-500" },
  { name: "Time Management", color: "bg-purple-500" },
];

type Discussion = {
  id: string;
  title: string;
  author: string;
  avatar: string;
  category: string;
  categoryColor: string;
  replies: number;
  likes: number;
  views: number;
  time: string;
  isPinned: boolean;
  isTrending: boolean;
  createdAt: string;
};

const Forum = () => {
  const [categories] = useState(initialCategories);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState(categories[0].name);
  const [formPinned, setFormPinned] = useState(false);
  const [formTrending, setFormTrending] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Ambil user dari Supabase session
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      setUser(res.data.session?.user || null);
    });
  }, []);

  // Fetch discussions dari Supabase
  const fetchDiscussions = async () => {
    const { data, error } = await supabase
      .from("forums")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else {
      const mapped = data.map((d: any) => ({
        id: d.id,
        title: d.title,
        author: d.created_by_name || "Unknown",
        avatar: (d.created_by_name || "U")
          .split(" ")
          .map((n: string) => n[0])
          .slice(0, 2)
          .join(""),
        category: d.category,
        categoryColor:
          categories.find((c) => c.name === d.category)?.color || "bg-gray-400",
        replies: d.replies || 0,
        likes: d.likes || 0,
        views: d.views || 0,
        time: new Date(d.created_at).toLocaleString(),
        isPinned: d.is_pinned,
        isTrending: d.is_trending,
        createdAt: d.created_at,
      }));
      setDiscussions(mapped);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((c) => (counts[c.name] = 0));
    discussions.forEach((d) => {
      if (counts[d.category] !== undefined) counts[d.category] += 1;
    });
    return counts;
  }, [categories, discussions]);

  const stats = useMemo(() => {
    const totalPosts = discussions.length;
    const activeUsers = new Set(discussions.map((d) => d.author)).size;
    const todaysPosts = discussions.filter(
      (d) => new Date(d.createdAt).toDateString() === new Date().toDateString()
    ).length;
    return { totalPosts, activeUsers, todaysPosts };
  }, [discussions]);

  const sortedDiscussions = useMemo(() => {
    const copy = [...discussions];
    copy.sort((a, b) => {
      if (a.isPinned && b.isPinned) return b.createdAt.localeCompare(a.createdAt);
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return copy;
  }, [discussions]);

  const filteredDiscussions = useMemo(() => {
    return sortedDiscussions.filter((d) => {
      const matchSearch =
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        selectedCategory === "All" || d.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [sortedDiscussions, searchTerm, selectedCategory]);

  const openModal = () => {
    setFormTitle("");
    setFormCategory(categories[0].name);
    setFormPinned(false);
    setFormTrending(false);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // Submit discussion ke Supabase
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setError("Title is required.");
      return;
    }
    if (!user) {
      setError("You must be logged in.");
      return;
    }

    const { error } = await supabase
      .from("forums")
      .insert([
        {
          title: formTitle,
          category: formCategory,
          created_by: user.id,
          created_by_name: user.user_metadata?.full_name || "Anonymous",
          is_pinned: formPinned,
          is_trending: formTrending,
        },
      ]);

    if (error) {
      console.error(error);
      setError("Failed to create discussion.");
      return;
    }

    fetchDiscussions();
    setShowModal(false);
  };

  const openDiscussion = (discussion: Discussion) => {
    navigate(`/ForumChat/${discussion.id}`, { state: { discussion } });
  };

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
            <Button
              className="w-full btn-gradient-primary shadow-md flex items-center justify-center"
              onClick={openModal}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Discussion
            </Button>

            {/* Categories */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Tags className="w-5 h-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Categories</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {categoryCounts[category.name] ?? 0}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Forum Stats</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
                  <span className="font-bold text-muted-foreground">Total Posts</span>
                  <span className="text-xl font-bold text-primary">{stats.totalPosts}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
                  <span className="font-bold text-muted-foreground">Active Users</span>
                  <span className="text-xl font-bold text-secondary">{stats.activeUsers}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
                  <span className="font-bold text-muted-foreground">Today’s Posts</span>
                  <span className="text-xl font-bold text-accent">{stats.todaysPosts}</span>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="h-12 border-2 rounded-lg px-3 text-sm cursor-pointer bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Discussions List */}
            <div className="space-y-4">
              {filteredDiscussions.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-lg">
                  No discussions yet. Be the first to start a conversation!
                </div>
              ) : (
                filteredDiscussions.map((discussion) => (
                  <Card
                    key={discussion.id}
                    className="card-hover border-2 cursor-pointer"
                    onClick={() => openDiscussion(discussion)}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-light text-white font-semibold">
                            {discussion.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {discussion.isPinned && <Badge variant="secondary" className="text-xs">📌 Pinned</Badge>}
                                {discussion.isTrending && <Badge className="bg-accent text-accent-foreground text-xs"><TrendingUp className="w-3 h-3 mr-1"/> Trending</Badge>}
                              </div>
                              <h3 className="text-lg font-semibold mb-1 hover:text-primary transition-colors">{discussion.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="font-medium">{discussion.author}</span>
                                <span>•</span>
                                <Badge className={`${discussion.categoryColor} text-white text-xs`}>{discussion.category}</Badge>
                                <span>•</span>
                                <span>{discussion.time}</span>
                              </div>
                            </div>
                          </div>
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
                              <span>{discussion.views}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <form
            onSubmit={handlePost}
            className="relative bg-white w-[720px] rounded-xl shadow-2xl p-8 z-10"
          >
            <div className="flex items-center gap-5 mb-6">
              <Avatar className="w-14 h-14">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-light text-white font-semibold">
                  {(user?.user_metadata?.full_name || "U")
                    .split(" ")
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-3xl font-bold">New Discussion</h2>
            </div>

            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Title
            </label>
            <textarea
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Write a concise, clear title..."
              className="w-full h-20 rounded-lg border-2 p-3 mb-4 resize-none focus:outline-none"
            />

            <div className="flex gap-3 items-center mb-4">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formPinned} onChange={(e) => setFormPinned(e.target.checked)} className="w-4 h-4" />
                <span>Pin this discussion</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formTrending} onChange={(e) => setFormTrending(e.target.checked)} className="w-4 h-4" />
                <span>Mark as trending</span>
              </label>
            </div>

            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Tags className="w-4 h-4 text-primary" />
              Category
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full h-12 rounded-lg border-2 px-3 mb-6"
            >
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

            <div className="flex justify-end gap-4">
              <button type="button" onClick={closeModal} className="px-6 py-2 rounded-md border hover:shadow">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-md bg-blue-600 text-white hover:brightness-95">Post</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Forum;
