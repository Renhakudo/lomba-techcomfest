import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, MessageCircle, Lightbulb, Clock, Star, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Home = () => {
  const navigate = useNavigate();

  // cek status login
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // jika user sudah login, redirect ke dashboard
        navigate("/modules");
      }
    };

    checkUser();

    // optional: subscribe perubahan login
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/dashboard");
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const modules = [
    {
      icon: MessageCircle,
      title: "Communication",
      description: "Master the art of clear, effective communication in professional settings",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Teamwork",
      description: "Learn to collaborate effectively and build strong team dynamics",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Lightbulb,
      title: "Problem-Solving",
      description: "Develop critical thinking and creative problem-solving skills",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: Clock,
      title: "Time Management",
      description: "Optimize your productivity and achieve work-life balance",
      color: "from-purple-500 to-pink-500",
    },
  ];

  const benefits = [
    {
      icon: Star,
      title: "Interactive Learning",
      description: "Engage with practical exercises and real-world scenarios",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your growth with detailed analytics and insights",
    },
    {
      icon: Award,
      title: "Earn Recognition",
      description: "Collect badges and certificates as you master new skills",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                  🚀 Welcome to the Future of Learning
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Unlock Your{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Soft Skills
                </span>{" "}
                Potential
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Join thousands of students mastering essential soft skills through interactive modules, 
                gamified learning, and a supportive community.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/modules">
                  <Button size="lg" className="btn-gradient-primary shadow-lg hover:shadow-glow text-lg group">
                    Start Learning
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="text-lg border-2">
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl rounded-full" />
              <img
                src={heroImage}
                alt="Students learning together"
                className="relative rounded-2xl shadow-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose SkillUp?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed to make soft skills development engaging, effective, and rewarding
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="card-hover border-2">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-glow">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Explore Our Skill Modules</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive learning paths designed to build essential workplace competencies
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <Link key={index} to={`/module/${module.title.toLowerCase()}`}>
                <Card className="card-hover h-full border-2 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 mb-4 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <module.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {module.description}
                    </p>
                    <div className="mt-4 flex items-center text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                      Explore Module
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary-light to-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0wIDMwdi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Future?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-95">
            Join our community of learners and start developing the skills that matter most in today's world
          </p>
          <Link to="/modules">
            <Button size="lg" variant="secondary" className="shadow-xl text-lg group">
              Begin Your Journey
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
