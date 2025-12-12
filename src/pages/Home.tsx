// src/pages/Home.tsx
import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { motion, Variants } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  MessageCircle,
  Lightbulb,
  Clock,
  Star,
  TrendingUp,
  Award,
  Sparkles, // Menambahkan ikon baru untuk variasi
} from "lucide-react";

// import heroImage from "@/assets/hero-image.jpg"; // GAMBAR DIHAPUS

/* ---------------------------
   Animation variants (Diperbarui untuk kesan lebih modern)
   --------------------------- */
const variants: {
  fadeUp: Variants;
  stagger: Variants;
  hoverLift: Variants;
  float: Variants; // Varian baru untuk animasi mengambang
} = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      // Menggunakan easing yang lebih halus dan modern
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  },
  stagger: {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  },
  hoverLift: {
    rest: { y: 0, scale: 1 },
    hover: {
      y: -8,
      scale: 1.02,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  },
  // Animasi baru untuk elemen background agar bergerak halus terus menerus
  float: {
    animate: {
      y: [0, -15, 0],
      rotate: [0, 5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};

/* ---------------------------
   Static data (Diupdate untuk mendukung Bento Grid & Style)
   --------------------------- */
const MODULES = [
  {
    icon: MessageCircle,
    title: "Communication",
    description: "Master clear, effective professional communication.",
    color: "from-blue-500 to-indigo-500",
    slug: "communication",
    // Menambahkan background tint lembut untuk setiap modul
    bg: "bg-blue-50/50",
  },
  {
    icon: Users,
    title: "Teamwork",
    description: "Build strong team dynamics and collaboration.",
    color: "from-emerald-500 to-teal-500",
    slug: "teamwork",
    bg: "bg-emerald-50/50",
  },
  {
    icon: Lightbulb,
    title: "Problem-Solving",
    description: "Develop critical thinking for complex challenges.",
    color: "from-orange-500 to-amber-500",
    slug: "problem-solving",
    bg: "bg-orange-50/50",
  },
  {
    icon: Clock,
    title: "Time Management",
    description: "Achieve peak productivity and work-life balance.",
    color: "from-pink-500 to-rose-500",
    slug: "time-management",
    bg: "bg-pink-50/50",
  },
];

// Update BENEFITS untuk mendukung layout "Bento Grid"
const BENEFITS = [
  {
    icon: Star,
    title: "Interactive Learning",
    description: "Engage with scenarios designed to keep you hooked, not bored.",
    span: "md:col-span-2", // Kartu ini akan melebar 2 kolom
    style: "bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-100/50",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Detailed analytics for your growth journey.",
    span: "md:col-span-1",
    style: "bg-white border-border/50",
  },
  {
    icon: Award,
    title: "Earn Recognition",
    description: "Collect badges validating your mastery.",
    span: "md:col-span-1",
    style: "bg-white border-border/50",
  },
  {
    icon: Sparkles, // Ikon baru
    title: "Modern Skills",
    description: "Stay relevant with up-to-date competencies.",
    span: "md:col-span-2",
    style: "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-100/50",
  },
];

/* ---------------------------
   Subcomponents (Redesigned)
   --------------------------- */

const SectionWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
  bgClass?: string;
  id?: string;
}> = ({ children, className = "", bgClass = "", id }) => {
  return (
    <section
      id={id}
      className={`min-h-screen w-full relative flex flex-col justify-center py-20 md:py-0 overflow-hidden ${bgClass}`}
    >
      <div className={`w-full ${className}`}>
        {children}
      </div>
    </section>
  );
};

const Hero: React.FC = () => {
  return (
    <SectionWrapper className="relative">
      {/* BACKGROUND DYNAMIC BLOBS (Pengganti Gambar) */}
      {/* Blob 1 (Kiri Atas) */}
      <motion.div
         variants={variants.float}
         animate="animate"
         className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-40 -z-10"
      />
       {/* Blob 2 (Kanan Bawah) */}
      <motion.div
         variants={variants.float}
         animate="animate"
         transition={{ delay: 2 }} // Delay biar geraknya gak barengan
         className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/30 rounded-full blur-[100px] opacity-40 -z-10"
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          // Ubah layout jadi terpusat (centered)
          className="flex flex-col items-center text-center gap-8"
        >
          <motion.div variants={variants.stagger} className="max-w-4xl mx-auto space-y-8">
            {/* Badge Kecil di atas */}
            <motion.div variants={variants.fadeUp} className="flex justify-center">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-primary/20 shadow-sm text-sm font-medium text-primary">
                  <Sparkles className="w-4 h-4" />
                  The Future of Soft Skills Learning
               </div>
            </motion.div>

            {/* Headline Besar */}
            <motion.h1
              variants={variants.fadeUp}
              // Ukuran font diperbesar drastis untuk dampak visual tanpa gambar
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1]"
            >
              Unlock Your Full <br />
              <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                Potential Skills
              </span>
            </motion.h1>

            <motion.p
              variants={variants.fadeUp}
              className="text-lg md:text-2xl text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed"
            >
              Master essential skills through our interactive, gamified platform designed for the modern professional.
            </motion.p>

            {/* Tombol CTA */}
            <motion.div
              variants={variants.fadeUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
            >
              <Link to="/aiassistent">
                <Button
                  size="lg"
                  // Tombol lebih besar dan bulat
                  className="h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 group"
                >
                  Start Learning
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="ghost" className="h-14 px-8 rounded-full text-lg hover:bg-muted/50">
                  View Dashboard
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

const Benefits: React.FC = () => {
  return (
    // Background putih bersih
    <SectionWrapper bgClass="bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-wider uppercase text-sm">Why Choose Us</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2">Engineered for Growth</h2>
        </div>

        {/* BENTO GRID LAYOUT */}
        <motion.div
          // Grid dengan baris otomatis yang fleksibel
          className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={variants.stagger}
        >
          {BENEFITS.map((b, idx) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={idx}
                variants={variants.fadeUp}
                // Menggunakan class 'span' untuk mengatur lebar kartu di grid
                className={`${b.span} group relative overflow-hidden rounded-[2rem] border p-8 hover:shadow-xl transition-all duration-500 ${b.style}`}
              >
                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                  {/* Icon Container yang modern */}
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Icon className="w-7 h-7 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">{b.title}</h3>
                    <p className="text-muted-foreground/90 font-medium leading-relaxed max-w-md">
                      {b.description}
                    </p>
                  </div>
                </div>
                
                {/* Dekorasi tambahan saat hover: Blob cahaya di pojok */}
                <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-white/40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

const ModulesOverview: React.FC = () => {
  return (
    // Background abu-abu sangat muda
    <SectionWrapper bgClass="bg-slate-50/80">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Popular Modules</h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                Curated learning paths designed for the modern workplace.
              </p>
            </div>
        </div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={variants.stagger}
        >
          {MODULES.map((m, idx) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.slug}
                variants={variants.fadeUp}
                className="group h-full"
              >
                <Link to={`/module/${m.slug}`} className="block h-full">
                  {/*
                    MODERN CARD DESIGN:
                    - Tidak ada border tebal
                    - Background tint lembut (${m.bg})
                    - Saat hover: jadi putih, shadow besar, dan naik sedikit (hoverLift)
                    - Rounded corner yang besar (rounded-[2rem])
                  */}
                  <motion.div
                    variants={variants.hoverLift}
                    initial="rest"
                    whileHover="hover"
                    className={`h-full p-6 rounded-[2rem] ${m.bg} hover:bg-white hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 flex flex-col relative overflow-hidden`}
                  >
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        {/* Icon dengan gradient */}
                        <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className="w-7 h-7" />
                        </div>
                        {/* Panah kecil yang muncul saat hover */}
                        <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                             <ArrowRight className="w-4 h-4 text-foreground" />
                        </div>
                    </div>
                    
                    <div className="relative z-10 flex-grow">
                        <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                        {m.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                        {m.description}
                        </p>
                    </div>

                    {/* Elemen dekoratif: Progress bar palsu di bawah */}
                    <div className="mt-auto w-full h-1.5 bg-black/5 rounded-full overflow-hidden relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                        <div className={`h-full w-1/4 bg-gradient-to-r ${m.color} rounded-full`} />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

const CTA: React.FC = () => {
  return (
    <SectionWrapper>
      <div className="container mx-auto px-4">
         {/* CTA Container: Bentuk kapsul besar dengan warna kontras */}
         <div className="relative rounded-[3rem] overflow-hidden bg-[#1a1b26] text-white py-24 px-6 md:px-20 text-center shadow-2xl">
             
             {/* Background Effects di dalam CTA */}
             <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-[-50%] left-[-20%] w-[700px] h-[700px] bg-primary rounded-full blur-[150px]" />
                 <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute bottom-[-50%] right-[-20%] w-[700px] h-[700px] bg-secondary rounded-full blur-[150px]" />
             </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 max-w-3xl mx-auto space-y-8"
            >
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                    Ready to define your <br/>
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">own success?</span>
                </h2>
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                    Join a community of learners who are not just studying, but evolving everyday.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link to="/login">
                        <Button size="lg" className="h-14 px-10 rounded-full text-lg bg-white text-[#1a1b26] hover:bg-white/90 shadow-xl shadow-white/10 transition-all hover:scale-105 font-semibold">
                            Get Started Now
                        </Button>
                    </Link>
                </div>
            </motion.div>
         </div>
      </div>
    </SectionWrapper>
  );
};

/* ---------------------------
   Root Home component (Tidak berubah fungsinya)
   --------------------------- */
const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;
        if (session) {
          navigate("/modules");
        }
      } catch (err) {
        // silent fail
      }
    };

    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) navigate("/dashboard");
      }
    );

    return () => {
      mounted = false;
      try {
        listener?.subscription.unsubscribe();
      } catch {
        // ignore
      }
    };
  }, [navigate]);

  return (
    // Menambahkan overflow-x-hidden untuk mencegah scroll horizontal akibat elemen background absolute
    <div className="w-full bg-background text-foreground overflow-x-hidden font-sans">
      <Hero />
      <Benefits />
      <ModulesOverview />
      <CTA />
    </div>
  );
};

export default Home;