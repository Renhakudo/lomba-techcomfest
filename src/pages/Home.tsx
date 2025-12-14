import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Users,
  MessageCircle, // Bisa diganti icon lain jika perlu
  Lightbulb,
  Clock, // Diganti konteksnya
  Star,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
  Zap,
  BarChart3,
  Code2,
  BrainCircuit,
  ShieldCheck,
  LayoutTemplate,
} from "lucide-react";

// Asset imports (Pastikan path ini benar di project Anda)
import TelkomInd from "../assets/logotelkomind.png";
import TelkomU from "../assets/LogoTelkomU.png";
import YPT from "../assets/logoypt.jpg";
import Javacreatiox from "../assets/logojavacreatiox.png";
import Infranexia from "../assets/Infranexia.png";
import Wowrack from "../assets/WOWRACK.png";
import Jagoanhosting from "../assets/JagoanHosting.png";
import Radnet from "../assets/Radnet.png";

/* ---------------------------
   ANIMATION VARIANTS
   --------------------------- */
const variants: {
  fadeUp: Variants;
  stagger: Variants;
  hoverLift: Variants;
  float: Variants;
} = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  },
  stagger: {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },
  hoverLift: {
    rest: { y: 0, scale: 1 },
    hover: {
      y: -5,
      scale: 1.02,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  },
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
   STATIC DATA (REBRANDED TO TERA & KKA)
   --------------------------- */
const STATS = [
  { label: "Guru Terlatih", value: "10k+", icon: Users },
  { label: "Modul Selesai", value: "50k+", icon: CheckCircle2 },
  { label: "Sekolah Mitra", value: "500+", icon: Zap },
  { label: "Partner Industri", value: "20+", icon: BarChart3 },
];

// Mengambil 4 modul utama dari list database untuk ditampilkan di Home
const MODULES = [
  {
    icon: Lightbulb,
    title: "Fondasi: Berpikir Komputasional",
    description: "Pahami pola pikir penyelesaian masalah (problem solving) sebelum masuk ke teknis koding.",
    color: "from-blue-500 to-indigo-500",
    slug: "computational-thinking",
    bg: "bg-blue-50/50",
  },
  {
    icon: LayoutTemplate,
    title: "Level 1: Visual Coding (SD)",
    description: "Belajar logika koding menggunakan blok visual (Scratch) yang menyenangkan.",
    color: "from-emerald-500 to-teal-500",
    slug: "visual-programming",
    bg: "bg-emerald-50/50",
  },
  {
    icon: Code2,
    title: "Level 2: Transisi ke Python (SMP)",
    description: "Mengenal bahasa pemrograman teks untuk level menengah dengan studi kasus nyata.",
    color: "from-orange-500 to-amber-500",
    slug: "python-transition",
    bg: "bg-orange-50/50",
  },
  {
    icon: BrainCircuit,
    title: "AI: Machine Learning untuk Kelas",
    description: "Cara praktis mengajarkan konsep AI dan Machine Learning tanpa koding yang rumit.",
    color: "from-pink-500 to-rose-500",
    slug: "ai-machine-learning",
    bg: "bg-pink-50/50",
  },
];

const BENEFITS = [
  {
    icon: Star,
    title: "Kurikulum KKA Terbaru",
    description: "Materi disusun spesifik untuk persiapan kurikulum Koding & Kecerdasan Artifisial.",
    span: "md:col-span-2",
    style: "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100",
  },
  {
    icon: TrendingUp,
    title: "Pantau Progres",
    description: "Analitik detail perkembangan kompetensi mengajar Anda.",
    span: "md:col-span-1",
    style: "bg-gradient-to-br from-sky-50 to-blue-50 border-sky-100",
  },
  {
    icon: Award,
    title: "Sertifikasi Guru",
    description: "Dapatkan lencana & sertifikat validasi keahlian digital.",
    span: "md:col-span-1",
    style: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100",
  },
  {
    icon: Sparkles,
    title: "Metode Interaktif",
    description: "Bukan sekadar teori. Simulasi langsung agar siap diterapkan di kelas.",
    span: "md:col-span-2",
    style: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100",
  },
];

const PARTNERS = [
  { name: "Telkom Indonesia", logo: TelkomInd },
  { name: "Telkom University", logo: TelkomU },
  { name: "Yayasan Pendidikan Telkom", logo: YPT },
  { name: "Telkom Infrastruktur Indonesia", logo: Infranexia },
  { name: "Java Creatiox", logo: Javacreatiox },
  { name: "Wowrack", logo: Wowrack },
  { name: "Jagoan Hosting", logo: Jagoanhosting },
  { name: "Radnext", logo: Radnet },
];

/* ---------------------------
   HELPER COMPONENTS
   --------------------------- */

// Section Wrapper Updated: Removed default min-h-screen to fix spacing issues
const SectionWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
  bgClass?: string;
  id?: string;
  fullWidth?: boolean;
  isHero?: boolean;
}> = ({
  children,
  className = "",
  bgClass = "",
  id,
  fullWidth = false,
  isHero = false,
}) => {
  return (
    <section
      id={id}
      className={`w-full relative flex flex-col justify-center overflow-hidden ${
        isHero ? "min-h-[90vh] pt-20 pb-10" : "py-16 md:py-24" // Tightened vertical padding
      } ${bgClass}`}
    >
      {fullWidth ? (
        <div className={`w-full ${className}`}>{children}</div>
      ) : (
        <div className={`container mx-auto px-4 ${className}`}>{children}</div>
      )}
    </section>
  );
};

/* ---------------------------
   MAIN SECTIONS
   --------------------------- */

const Hero: React.FC = () => {
  const mapImageSrc =
    "https://images.unsplash.com/photo-1589985307862-617a62952756?q=80&w=2070&auto=format&fit=crop";

  return (
    <SectionWrapper className="relative" isHero={true}>
      {/* Background */}
      <div className="absolute inset-0 w-full h-full -z-20">
        <img
          src={mapImageSrc}
          alt="Background Peta Indonesia"
          className="w-full h-full object-cover opacity-10 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background"></div>
      </div>

      {/* Blobs */}
      <motion.div
        variants={variants.float}
        animate="animate"
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10"
      />
      <motion.div
        variants={variants.float}
        animate="animate"
        transition={{ delay: 2 }}
        className="absolute bottom-20 right-0 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] -z-10"
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center gap-6 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={variants.fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-primary/20 shadow-sm text-sm font-semibold text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Platform Pendidikan Guru Era Digital</span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={variants.fadeUp}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] text-foreground"
          >
            Siapkan Generasi <br />
            <span className="bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent">
              Cerdas Digital
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={variants.fadeUp}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Bersama <strong>Tera</strong>, tingkatkan kompetensi guru dalam mengajarkan 
            <strong> Koding & Kecerdasan Artifisial (KKA)</strong>. Kurikulum adaptif, mudah dipahami, 
            dan siap diterapkan di kelas masa depan.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={variants.fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full"
          >
            <Link to="/aiassistent">
              <Button
                size="lg"
                className="h-14 px-8 rounded-full text-lg shadow-lg hover:shadow-primary/25 hover:-translate-y-1 transition-all duration-300"
              >
                Mulai Belajar Sekarang
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-full text-lg border-2 hover:bg-muted/50 transition-all duration-300"
              >
                Lihat Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* New Stats Bar Section within Hero to reduce emptiness */}
          <motion.div
            variants={variants.fadeUp}
            className="mt-16 w-full grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 pt-10 border-t border-border/40"
          >
            {STATS.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center space-y-1">
                <div className="p-2 bg-primary/10 rounded-full mb-2 text-primary">
                   <stat.icon className="w-5 h-5" />
                </div>
                <h4 className="text-3xl font-bold text-foreground">{stat.value}</h4>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

const Benefits: React.FC = () => {
  return (
    <SectionWrapper bgClass="bg-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <span className="text-primary font-bold tracking-wider uppercase text-sm">
            Kenapa Memilih Tera?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-slate-900 leading-tight">
            Dirancang untuk <br/> Pertumbuhan Guru Profesional.
          </h2>
        </div>
        <p className="text-muted-foreground max-w-md pb-1">
           Platform kami menggabungkan pedagogi modern dengan teknologi interaktif untuk memastikan Anda tidak hanya belajar, tetapi siap mengajar.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
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
              whileHover={{ y: -5 }}
              className={`${b.span} group relative overflow-hidden rounded-[2rem] border p-8 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 ${b.style}`}
            >
              <div className="relative z-10 flex flex-col h-full items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-slate-700" />
                </div>
                <div className="mt-2">
                  <h3 className="text-2xl font-bold mb-3 text-slate-900">{b.title}</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionWrapper>
  );
};

const ModulesOverview: React.FC = () => {
  return (
    <SectionWrapper bgClass="bg-slate-50/80">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-3">
          Jalur Pembelajaran Terstruktur
        </h2>
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">
           Eksplorasi Modul Populer
        </h2>
        <p className="text-lg text-slate-600">
          Disusun oleh pakar industri dan pendidikan untuk menjembatani teknologi masa depan dengan ruang kelas Anda.
        </p>
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
              className="h-full"
            >
              <Link to={`/module/${m.slug}`} className="block h-full">
                <motion.div
                  variants={variants.hoverLift}
                  initial="rest"
                  whileHover="hover"
                  className={`h-full p-8 rounded-[2rem] ${m.bg} hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col`}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-lg text-white`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                      <ArrowRight className="w-5 h-5 text-slate-900" />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-primary transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-slate-600 font-medium leading-relaxed mb-6">
                      {m.description}
                    </p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
      
      <div className="flex justify-center mt-12">
        <Link to="/modules">
           <Button variant="outline" size="lg" className="rounded-full px-8 border-2">
             Lihat Semua Modul
           </Button>
        </Link>
      </div>
    </SectionWrapper>
  );
};

const CTA: React.FC = () => {
  return (
    <SectionWrapper className="!py-0 pb-20"> 
      {/* Remove heavy padding to merge closer to Modules */}
      <div className="relative rounded-[3rem] overflow-hidden bg-[#0f172a] text-white py-20 px-6 md:px-20 text-center shadow-2xl">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[50%] -left-[20%] w-[800px] h-[800px] bg-primary/40 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ rotate: -360, scale: [1, 1.1, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[50%] -right-[20%] w-[800px] h-[800px] bg-indigo-600/40 rounded-full blur-[120px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto space-y-8"
        >
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Siap Mencetak Talenta <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Digital Masa Depan?
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan guru inovatif yang tidak hanya mengajar, tetapi berevolusi setiap hari bersama Tera. Mulai sekarang, Gratis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/login">
              <Button
                size="lg"
                className="h-14 px-10 rounded-full text-lg bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/5 font-bold transition-all hover:scale-105"
              >
                Daftar Sekarang
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

const Partners: React.FC = () => {
  return (
    <div className="w-full bg-slate-50 border-t border-slate-200 py-10">
      <div className="container mx-auto px-4 text-center mb-8">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
           Dipercaya oleh Pemimpin Pendidikan & Mitra Industri
        </p>
      </div>

      <div className="relative w-full overflow-hidden max-w-[1920px] mx-auto">
        <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-slate-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-slate-50 to-transparent z-10" />

        <div className="flex w-full overflow-hidden">
              <motion.div
              className="flex items-center gap-12 md:gap-24 px-12"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 40,
              }}
              style={{ width: "max-content" }}
            >
              {[...PARTNERS, ...PARTNERS].map((partner, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center shrink-0 group opacity-50 hover:opacity-100 transition-opacity duration-300"
                >
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="h-10 md:h-12 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </motion.div>
        </div>
      </div>
    </div>
  );
};

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
      } catch (err) {}
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
      } catch {}
    };
  }, [navigate]);

  return (
    <div className="w-full bg-background text-foreground overflow-x-hidden font-sans">
      <Hero />
      <Benefits />
      <ModulesOverview />
      <CTA />
      <Partners />
    </div>
  );
};

export default Home;