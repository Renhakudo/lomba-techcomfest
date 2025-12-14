import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, BrainCircuit, Sparkles, CheckCircle2 } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
}

// --- Animation Variants (Konsisten dengan Home) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const PreTest = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // --- Logic Section (Tidak Diubah) ---
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate("/login");
      setUserId(session.user.id);

      // Cek apakah user sudah pernah tes
      const { data: progress } = await supabase
        .from("user_module_progress")
        .select("has_taken_pretest")
        .eq("user_id", session.user.id)
        .eq("module_id", moduleId)
        .single();

      if (progress?.has_taken_pretest) {
        navigate(`/module/${moduleId}`);
        return;
      }

      const { data, error } = await supabase
        .from("pre_test_questions")
        .select("*")
        .eq("module_id", moduleId);

      if (error) console.error(error);
      setQuestions(data || []);
      setLoading(false);
    };

    fetchQuestions();
  }, [moduleId, navigate]);

  const handleSubmit = async () => {
    setSubmitting(true);
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) score += 1;
    });

    const percentage = (score / questions.length) * 100;

    // LOGIKA PENENTUAN LEVEL
    let assignedLevel = "beginner";
    if (percentage >= 80) assignedLevel = "advanced";
    else if (percentage >= 50) assignedLevel = "intermediate";

    try {
      // 1. Simpan Hasil Pre-Test
      await supabase.from("user_module_progress").upsert({
        user_id: userId,
        module_id: moduleId,
        has_taken_pretest: true,
        pretest_score: percentage,
        assigned_level: assignedLevel
      }, { onConflict: 'user_id, module_id' });

      // 2. LOGIKA SKIP MATERI (AUTO-COMPLETE)
      let levelsToSkip: string[] = [];
      if (assignedLevel === "intermediate") levelsToSkip = ["beginner"];
      if (assignedLevel === "advanced") levelsToSkip = ["beginner", "intermediate"];

      if (levelsToSkip.length > 0) {
        const { data: lessonsToSkip } = await supabase
          .from("lessons")
          .select("id")
          .eq("module_id", moduleId)
          .in("difficulty_level", levelsToSkip);

        if (lessonsToSkip && lessonsToSkip.length > 0) {
          const idsToMark = lessonsToSkip.map(l => l.id);
          const { data: profile } = await supabase
            .from("profiles")
            .select("completed_lessons")
            .eq("id", userId)
            .single();

          const currentCompleted = profile?.completed_lessons || {};
          const currentModuleCompleted = currentCompleted[moduleId!] || [];
          const newModuleCompleted = Array.from(new Set([...currentModuleCompleted, ...idsToMark]));

          const updatedCompletedLessons = {
            ...currentCompleted,
            [moduleId!]: newModuleCompleted
          };

          await supabase
            .from("profiles")
            .update({ completed_lessons: updatedCompletedLessons })
            .eq("id", userId);
        }
      }

      navigate(`/module/${moduleId}`);
    } catch (err) {
      console.error("Error submitting:", err);
    } finally {
      setSubmitting(false);
    }
  };
  // --- End of Logic ---

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-muted-foreground animate-pulse">Menyiapkan asesmen Anda...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* Background Decor (Blobs) */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[80px] -z-10" />
      <div className="absolute top-40 -left-20 w-[300px] h-[300px] bg-purple-400/10 rounded-full blur-[80px] -z-10" />

      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        
        {/* HEADER SECTION */}
        <div className="mt-10 text-center mb-12 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-primary/20 shadow-sm text-sm font-semibold text-primary mb-2"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Kalibrasi Kemampuan</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900"
          >
            Mari Cek <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Titik Awalmu</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Jawab pertanyaan berikut agar kami bisa menyesuaikan jalur belajarmu. 
            Jika kamu sudah menguasai dasarnya, kami akan mengizinkanmu melewati materi awal!
          </motion.p>
        </div>

        {/* QUESTIONS LIST */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {questions.map((q, index) => (
            <motion.div key={q.id}> 
              <Card className="border-0 shadow-lg shadow-slate-200/50 overflow-hidden bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                {/* Question Header */}
                <div className="bg-slate-100/50 px-6 py-4 border-b border-slate-100 flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 leading-snug pt-0.5">
                    {q.question}
                  </h3>
                </div>

                <CardContent className="p-6">
                  <RadioGroup 
                    onValueChange={(val) => setAnswers({ ...answers, [q.id]: parseInt(val) })}
                    className="grid gap-3"
                  >
                    {q.options.map((opt: any, i: number) => {
                      const isSelected = answers[q.id] === i;
                      return (
                        <div key={i} className="relative">
                          <RadioGroupItem 
                            value={i.toString()} 
                            id={`q${q.id}-${i}`} 
                            className="sr-only" // Hide default radio visually but keep accessible
                          />
                          <Label 
                            htmlFor={`q${q.id}-${i}`}
                            className={`flex items-center w-full p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                              isSelected 
                                ? "border-primary bg-primary/5 shadow-inner" 
                                : "border-slate-100 hover:border-primary/30 hover:bg-slate-50"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? "border-primary bg-primary" : "border-slate-300 group-hover:border-primary/50"
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className={`text-base ${isSelected ? "font-medium text-primary" : "text-slate-600"}`}>
                              {opt}
                            </span>
                            {isSelected && (
                              <motion.div 
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="ml-auto"
                              >
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                              </motion.div>
                            )}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* SUBMIT BUTTON */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 mb-20 flex justify-center"
        >
          <Button 
            className="h-14 px-12 rounded-full text-lg font-bold shadow-xl shadow-primary/25 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90" 
            size="lg"
            onClick={handleSubmit} 
            disabled={submitting || Object.keys(answers).length !== questions.length}
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5"/> 
                Menganalisis Kemampuan...
              </>
            ) : (
              <>
                Kirim Jawaban
                <Sparkles className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </motion.div>

      </div>
    </div>
  );
};

export default PreTest;