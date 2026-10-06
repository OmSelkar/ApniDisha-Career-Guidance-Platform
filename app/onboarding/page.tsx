"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Sun,
  Moon,
  Sparkles,
  Activity,
  Timer,
  XCircle,
  Lock,
  Zap,
  Bot,
  GraduationCap,
  Target,
} from "lucide-react";

import QUIZ_QUESTIONS from "../../lib/quiz_questions"


export default function Onboarding() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useUser();

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const [shuffledQuestions] = useState(() => {
  const q = [...QUIZ_QUESTIONS];
  for (let i = q.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [q[i], q[j]] = [q[j], q[i]];
  }
  return q;
});

const totalQuestions = shuffledQuestions.length;  // 44
const currentQ = shuffledQuestions[step - 1];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const animateTransition = (callback: () => void) => {
    setIsAnimating(true);
    setTimeout(() => {
      callback();
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };

  const handleAnswer = (rating: number) => {
    const newAnswers = { ...answers, [step]: rating };
    setAnswers(newAnswers);

    animateTransition(() => {
      if (step < totalQuestions) {
        setStep(step + 1);
      } else {
        submitFinalQuiz(newAnswers);
      }
    });
  };

  const handleBack = () => {
    if (step > 1) {
      animateTransition(() => {
        setStep(step - 1);
      });
    }
  };

  const handleForward = () => {
    if (answers[step] && step < totalQuestions) {
      animateTransition(() => {
        setStep(step + 1);
      });
    }
  };

  const jumpToStep = (targetStep: number) => {
    if (targetStep === step) return;
    animateTransition(() => {
      setStep(targetStep);
    });
  };

 const submitFinalQuiz = async (finalAnswers: Record<number, number>) => {
  setLoading(true);

  const payload = {
    clerk_id: user?.id || "guest",
    answers: Object.keys(finalAnswers).map(key => {
      const qIndex = parseInt(key) - 1;
      const qDef = shuffledQuestions[qIndex];   // ✅ use shuffled order, not static
      return {
        question_text: qDef.text,
        dimension: qDef.dimension,
        score: finalAnswers[parseInt(key)],
        is_reverse: qDef.is_reverse              // ✅ snake_case matches the question objects
      };
    })
  };

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/submit-quiz`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json();

    // In your quiz completion handler, after getting `data` back:
if (data.success) {
    const userId = user?.id;
    
    // existing saves you probably have:
    localStorage.setItem(`apnidisha_final_cluster_${userId}`, data.final_cluster);
    localStorage.setItem(`apnidisha_confidence_score_${userId}`, String(data.conf_score));
    localStorage.setItem(`apnidisha_recommended_jobs_${userId}`, JSON.stringify(data.recommended_jobs));
    
    // ✅ ADD THESE — they were missing:
    if (data.explanation) {
        localStorage.setItem(`apnidisha_explanation_${userId}`, JSON.stringify(data.explanation));
    }
    if (data.top3_clusters) {
        localStorage.setItem(`apnidisha_top3_clusters_${userId}`, JSON.stringify(data.top3_clusters));
    }
    if (data.raw_scores) {
        localStorage.setItem(`apnidisha_raw_scores_${userId}`, JSON.stringify(data.raw_scores));
    }
    
    // update test history
    const historyKey = `apnidisha_test_history_${userId}`;
    const existing = JSON.parse(localStorage.getItem(historyKey) || "[]");
    const newEntry = {
        cluster: data.final_cluster,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        attempt: existing.length + 1
    };
    localStorage.setItem(historyKey, JSON.stringify([newEntry, ...existing]));
    
    router.push("/dashboard");
} else {
      alert("Error analyzing results: " + data.error);
      setLoading(false);
    }
  } catch (error) {
    console.error("Submission error:", error);
    alert("Failed to connect to the server.");
    setLoading(false);
  }
};
  const renderActivityButtons = () => {
    const savedAnswer = answers[step];
    const mcqOptions = [
      { val: 5, emoji: "🚀", text: "Absolutely! This sounds exactly like me." },
      { val: 4, emoji: "👍", text: "Yeah, I'd give that a shot." },
      { val: 3, emoji: "😐", text: "Neutral / In between." },
      { val: 2, emoji: "🤔", text: "Not really my cup of tea." },
      { val: 1, emoji: "🛑", text: "No way, I would hate doing that." },
    ];
    return (
      <div className="grid grid-cols-1 gap-4 mt-6 w-full">
        {mcqOptions.map((btn) => {
          const isSelected = savedAnswer === btn.val;
          return (
            <button
              key={btn.val}
              onClick={() => handleAnswer(btn.val)}
              className={`w-full flex items-center gap-4 text-left px-5 py-4 rounded-2xl transition-all duration-200 font-semibold border-2 outline-none active:scale-95 group
                ${isSelected
                  ? isDark ? "bg-indigo-500/10 border-indigo-500/50 text-white" : "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm"
                  : isDark ? "bg-[#141414] border-[#2A2A2A] text-slate-300 hover:border-indigo-500/30" : "bg-white border-slate-100 shadow-sm text-slate-700 hover:border-indigo-200"
                }`}
            >
              <div className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-xl text-2xl transition-colors ${isSelected ? (isDark ? "bg-indigo-500/20" : "bg-white shadow-sm") : isDark ? "bg-[#222] group-hover:bg-[#111]" : "bg-slate-50 group-hover:bg-white"}`}>
                {btn.emoji}
              </div>
              <span className="flex-1 leading-snug">{btn.text}</span>
            </button>
          );
        })}
      </div>
    );
  };

  if (!mounted) return null;

  const maxAllowedStep = Math.max(step, ...Object.keys(answers).map(Number));
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return {
      m: m.toString().padStart(2, "0"),
      s: s.toString().padStart(2, "0"),
    };
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isDark ? "bg-[#000000] text-slate-200" : "bg-[#f1f3f9] text-slate-900"}`}>
      <header className={`h-16 flex items-center justify-between px-6 border-b sticky top-0 z-50 shadow-sm transition-colors duration-500 shrink-0 ${isDark ? "bg-[#111] border-[#222]" : "bg-white border-slate-200"}`}>
        <Link href="/" className="flex items-center gap-2 outline-none">
          <img src="/image.jpeg" alt="Apni Disha Logo" className="w-8 h-8 rounded-lg object-contain" />
          <span className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Apni<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">Disha</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full outline-none transition-colors ${isDark ? "hover:bg-[#222] text-slate-400 hover:text-yellow-400" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"}`}>
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="flex items-center justify-center transition-transform hover:scale-105">
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9" } }} />
          </div>
        </div>
      </header>

      <div className="flex flex-col xl:flex-row flex-1 p-4 md:p-6 gap-5 max-w-[1400px] mx-auto w-full items-stretch xl:h-[calc(100vh-88px)]">
        {/* 🎯 LEFT SIDEBAR */}
        <aside className="w-full xl:w-64 flex flex-col gap-4 h-full">
          <div className={`w-full rounded-[1.5rem] border p-6 shadow-sm transition-colors duration-500 shrink-0 ${isDark ? "bg-[#111] border-[#222]" : "bg-white border-slate-100"}`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-5 ${isDark ? "text-slate-500" : "text-slate-500"}`}>Questions</h3>
            <div className="grid grid-cols-5 xl:grid-cols-4 gap-2 md:gap-3">
              {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((qNum) => {
                const isCurrent = qNum === step;
                const isLocked = qNum > maxAllowedStep + 1;
                const isCompleted = answers[qNum] !== undefined && !isCurrent;
                return (
                  <button
                    key={qNum}
                    onClick={() => !isLocked && jumpToStep(qNum)}
                    disabled={isLocked}
                    className={`w-full aspect-square flex items-center justify-center rounded-xl font-bold text-sm transition-all duration-150 outline-none
                      ${isCurrent ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110 z-10"
                        : isCompleted ? (isDark ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer" : "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 cursor-pointer")
                        : isLocked ? (isDark ? "bg-[#1A1A1A] text-slate-600 border border-[#222] opacity-70 cursor-not-allowed" : "bg-slate-50 text-slate-400 border border-slate-100 opacity-70 cursor-not-allowed")
                        : (isDark ? "bg-[#222] text-slate-300 border border-[#333] hover:bg-[#333] cursor-pointer" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer")
                      }`}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : qNum}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`rounded-[1.5rem] p-6 border flex flex-col transition-colors duration-500 relative overflow-hidden mt-auto flex-1 ${isDark ? "bg-gradient-to-b from-[#111] to-indigo-950/20 border-indigo-500/20" : "bg-gradient-to-b from-indigo-50/50 to-white border-indigo-100 shadow-sm"}`}>
            <div className="flex items-center gap-3 relative z-10 mb-2">
              <div className={`p-2.5 rounded-xl ${isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
                <Bot className="w-5 h-5" />
              </div>
              <h4 className={`font-black text-sm uppercase tracking-wider ${isDark ? "text-indigo-400" : "text-indigo-700"}`}>Meet Disha AI</h4>
            </div>
            <p className={`text-xs font-medium leading-relaxed relative z-10 mb-3 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Got doubts? Talk to your personal AI career voice mentor on your dashboard after completing the test.</p>
            <Bot className={`absolute -bottom-10 -right-10 w-48 h-48 -rotate-12 opacity-50 ${isDark ? "text-indigo-500/10" : "text-indigo-100"}`} />
            <div className="absolute top-10 -right-10 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
          </div>
        </aside>

        {/* 🎯 MIDDLE SECTION */}
        <main className="flex-1 flex flex-col w-full h-full min-w-0">
          <div className={`rounded-[2rem] p-6 md:p-10 border shadow-xl relative overflow-x-hidden overflow-y-auto transition-colors duration-500 flex flex-col h-full ${isDark ? "bg-[#111] border-[#222]" : "bg-white border-slate-100"}`}>
            {loading ? (
              <div className="flex flex-col items-center justify-center z-10 h-full">
                <div className={`w-16 h-16 rounded-full border-4 border-t-indigo-500 animate-spin mb-6 ${isDark ? "border-[#222]" : "border-indigo-100"}`}></div>
                <h1 className={`text-xl font-bold animate-pulse text-center ${isDark ? "text-slate-300" : "text-indigo-600"}`}>
                  Analyzing your profile...
                </h1>
              </div>
            ) : (
              <div className={`z-10 w-full flex flex-col h-full transition-all duration-300 transform ${isAnimating ? "opacity-0 scale-95 translate-y-4" : "opacity-100 scale-100 translate-y-0"}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl md:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>Question {step}</span>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border-indigo-100 text-indigo-700"}`}>
                      <Activity className="w-3.5 h-3.5" />
                      {currentQ?.dimension}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleBack} disabled={step === 1} className={`flex items-center justify-center w-10 h-10 rounded-full transition-all outline-none border ${step === 1 ? "opacity-0 pointer-events-none" : isDark ? "bg-[#1A1A1A] border-[#333] hover:bg-[#222] text-slate-300" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"}`}>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button onClick={handleForward} disabled={!answers[step] || step === totalQuestions} className={`flex items-center justify-center w-10 h-10 rounded-full transition-all outline-none border ${!answers[step] || step === totalQuestions ? "opacity-0 pointer-events-none" : isDark ? "bg-indigo-500/20 border-indigo-500/30 hover:bg-indigo-500/30 text-indigo-400" : "bg-indigo-50 border-indigo-100 hover:bg-indigo-100 text-indigo-700 shadow-sm"}`}>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h1 className={`text-2xl md:text-3xl font-extrabold leading-tight mb-2 shrink-0 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                  {currentQ?.text}
                </h1>

                <div className="w-full">{renderActivityButtons()}</div>
              </div>
            )}
          </div>
        </main>

        {/* 🎯 RIGHT SIDEBAR */}
        <aside className="w-full xl:w-80 flex flex-col gap-4 h-full">
          <div className={`rounded-[1.5rem] p-6 border shadow-sm flex flex-col items-center shrink-0 transition-colors duration-500 ${isDark ? "bg-[#111] border-[#222]" : "bg-white border-slate-100"}`}>
            <h3 className={`font-extrabold text-sm mb-5 w-full text-left uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-500"}`}>Progress</h3>
            <div className="relative w-32 h-32 md:w-36 md:h-36 flex items-center justify-center mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke={isDark ? "#1A1A1A" : "#F1F5F9"} strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="8" strokeDasharray="251" strokeDashoffset={251 - 251 * (progressPercentage / 100)} strokeLinecap="round" className="transition-all duration-700 ease-out" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-2xl md:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{progressPercentage}%</span>
              </div>
            </div>
          </div>
          
          <div className={`rounded-[1.5rem] p-5 border shadow-sm flex items-center justify-between shrink-0 transition-colors duration-500 ${isDark ? "bg-[#111] border-[#222]" : "bg-white border-slate-100"}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${isDark ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`font-extrabold text-sm mb-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>Time Elapsed</h4>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}>No rush, take time.</p>
              </div>
            </div>
            <div className={`font-mono text-xl font-black tracking-tight tabular-nums flex items-baseline ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              {formatTime(timeElapsed).m}
              <span className={`text-[10px] font-bold mx-0.5 mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>m</span>
              {formatTime(timeElapsed).s}
              <span className={`text-[10px] font-bold ml-0.5 mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>s</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}