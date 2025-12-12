import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
}

const PreTest = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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
      // Tentukan level mana yang harus di-skip berdasarkan hasil tes
      let levelsToSkip: string[] = [];
      
      // Jika Intermediate -> Skip Beginner
      if (assignedLevel === "intermediate") levelsToSkip = ["beginner"];
      // Jika Advanced -> Skip Beginner & Intermediate
      if (assignedLevel === "advanced") levelsToSkip = ["beginner", "intermediate"];

      if (levelsToSkip.length > 0) {
        // Cari ID lesson yang harus di-skip
        const { data: lessonsToSkip } = await supabase
          .from("lessons")
          .select("id")
          .eq("module_id", moduleId)
          .in("difficulty_level", levelsToSkip);

        if (lessonsToSkip && lessonsToSkip.length > 0) {
          const idsToMark = lessonsToSkip.map(l => l.id);

          // Ambil data completed user saat ini
          const { data: profile } = await supabase
            .from("profiles")
            .select("completed_lessons")
            .eq("id", userId)
            .single();

          const currentCompleted = profile?.completed_lessons || {};
          const currentModuleCompleted = currentCompleted[moduleId!] || [];

          // Gabungkan ID lama + ID baru (unik)
          const newModuleCompleted = Array.from(new Set([...currentModuleCompleted, ...idsToMark]));
          
          const updatedCompletedLessons = {
            ...currentCompleted,
            [moduleId!]: newModuleCompleted
          };

          // Update database profile
          await supabase
            .from("profiles")
            .update({ completed_lessons: updatedCompletedLessons })
            .eq("id", userId);
        }
      }

      // Kembali ke halaman modul (akan otomatis ter-unlock)
      navigate(`/module/${moduleId}`);

    } catch (err) {
      console.error("Error submitting:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen py-12 bg-slate-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Skill Assessment</h1>
        <div className="space-y-6">
          {questions.map((q, index) => (
            <Card key={q.id}>
              <CardHeader><CardTitle>{index + 1}. {q.question}</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup onValueChange={(val) => setAnswers({ ...answers, [q.id]: parseInt(val) })}>
                  {q.options.map((opt: any, i: number) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={i.toString()} id={`q${q.id}-${i}`} />
                      <Label htmlFor={`q${q.id}-${i}`}>{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button 
          className="mt-8 w-full" 
          size="lg"
          onClick={handleSubmit} 
          disabled={submitting || Object.keys(answers).length !== questions.length}
        >
          {submitting ? <Loader2 className="animate-spin mr-2"/> : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default PreTest;