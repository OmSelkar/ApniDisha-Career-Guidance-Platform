"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2, PhoneCall, Globe } from "lucide-react";

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "";
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";

let globalVapiInstance: any = null;

const LANGUAGE_OPTIONS = [
  { value: "english", label: "EN", full: "English" },
  { value: "hinglish", label: "HI/EN", full: "Hinglish" },
  { value: "hindi", label: "HI", full: "Hindi" },
  { value: "marathi", label: "MR", full: "Marathi" },
  { value: "tamil", label: "TA", full: "Tamil" },
];

const LANGUAGE_VOICE_INSTRUCTIONS: Record<string, string> = {
  english: "Speak ONLY in English. Friendly, Gen-Z elder-sibling tone.",
  hinglish:
    "Speak in Hinglish — a natural casual mix of Hindi and English, the way Indian teens talk. Do NOT use Devanagari script in speech.",
  hindi:
    "Speak ONLY in Hindi. Use casual, warm Hindi like a dost — not formal or textbook.",
  marathi:
    "Speak ONLY in Marathi. Keep the tone warm and friendly, like an elder sibling from Maharashtra.",
  tamil: "Speak ONLY in Tamil. Keep the tone warm and friendly.",
};

export default function VoiceMentorCall() {
  const { user } = useUser();

  const [isCalling, setIsCalling] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [language, setLanguage] = useState("english");
  const [showLangMenu, setShowLangMenu] = useState(false);

  // ── Read user context from localStorage ──────────────────────────────────
  const getUserContext = () => {
    if (!user) return {};
    const uid = user.id;
    return {
      name: user.firstName || "",
      grade: localStorage.getItem(`apnidisha_user_grade_${uid}`) || "Student",
      city: localStorage.getItem(`apnidisha_user_city_${uid}`) || "India",
      state: localStorage.getItem(`apnidisha_user_state_${uid}`) || "",
      predicted_cluster:
        localStorage.getItem(`apnidisha_predicted_cluster_${uid}`) || "",
      confidence_score:
        localStorage.getItem(`apnidisha_confidence_score_${uid}`) || "",
      top_careers: (() => {
        try {
          return JSON.parse(
            localStorage.getItem(`apnidisha_top_careers_${uid}`) || "[]",
          );
        } catch {
          return [];
        }
      })(),
    };
  };

  // ── Context string injected after call starts ────────────────────────────
  const getContextInjection = () => {
    const ctx = getUserContext();
    const langInstruction = LANGUAGE_VOICE_INSTRUCTIONS[language];

    return `
LIVE SESSION CONTEXT — inject this into every response naturally:
- Student name: ${ctx.name || "unknown — ask them"}
- Grade: ${ctx.grade}
- City: ${ctx.city}${ctx.state ? `, ${ctx.state}` : ""}
- Predicted career cluster: ${ctx.predicted_cluster || "not yet assessed"}
- Confidence score: ${ctx.confidence_score || "N/A"}
- Top matched roles: ${
      ctx.top_careers
        ?.slice(0, 3)
        .map((c: any) => c.title)
        .join(", ") || "none yet"
    }

LANGUAGE FOR THIS CALL:
${langInstruction}
`.trim();
  };

  // ── Vapi SDK init ────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const initVapi = async () => {
      try {
        if (!globalVapiInstance) {
          const Vapi = (await import("@vapi-ai/web")).default;
          globalVapiInstance = new Vapi(VAPI_PUBLIC_KEY);
        }

        if (mounted) {
          globalVapiInstance.removeAllListeners();

          globalVapiInstance.on("call-start", () => {
            setIsConnecting(false);
            setIsCalling(true);

            // Inject live context once the call is connected
            try {
              globalVapiInstance.send({
                type: "add-message",
                message: {
                  role: "system",
                  content: getContextInjection(),
                },
              });
            } catch (e) {
              console.error("Failed to inject context:", e);
            }
          });

          globalVapiInstance.on("call-end", () => {
            setIsCalling(false);
            setIsConnecting(false);
          });

          globalVapiInstance.on("error", (e: any) => {
            console.error("Vapi Error:", e);
            setIsConnecting(false);
            setIsCalling(false);
          });

          setIsSetup(true);
        }
      } catch (error) {
        console.error("Failed to load Vapi SDK:", error);
      }
    };

    initVapi();
    return () => {
      mounted = false;
    };
  }, [language, user]); // re-bind so getContextInjection sees latest language/user

  // ── Toggle call ──────────────────────────────────────────────────────────
  const toggleCall = async () => {
    if (!globalVapiInstance || !isSetup) return;

    if (isCalling) {
      globalVapiInstance.stop();
      return;
    }

    if (!VAPI_PUBLIC_KEY || !ASSISTANT_ID) {
      console.error("Missing VAPI_PUBLIC_KEY or ASSISTANT_ID");
      return;
    }

    setIsConnecting(true);
    try {
      // No model override — avoids the provider validation 400
      await globalVapiInstance.start(ASSISTANT_ID, {
  variableValues: {
    studentName: getUserContext().name || "",
    grade: getUserContext().grade,
    city: getUserContext().city,
    predicted_cluster: getUserContext().predicted_cluster,
    confidence_score: getUserContext().confidence_score,
  },
});
    } catch (err) {
      console.error("Mic access denied or connection failed:", err);
      setIsConnecting(false);
    }
  };

  const selectedLang = LANGUAGE_OPTIONS.find((l) => l.value === language)!;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Language picker */}
      <div className="relative">
        <button
          onClick={() => setShowLangMenu((v) => !v)}
          disabled={isCalling || isConnecting}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 dark:border-[#333] bg-slate-50 dark:bg-[#1A1A1A] text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-400 transition-colors disabled:opacity-40 outline-none"
        >
          <span className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            Call language:{" "}
            <span className="text-indigo-500">{selectedLang.full}</span>
          </span>
          <span className="text-slate-400">▾</span>
        </button>

        {showLangMenu && (
          <div className="absolute bottom-full mb-1 left-0 right-0 z-50 rounded-xl border border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] shadow-xl overflow-hidden">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setLanguage(opt.value);
                  setShowLangMenu(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors outline-none
                  ${
                    language === opt.value
                      ? "bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#222]"
                  }`}
              >
                <span className="mr-2 font-black text-[10px] text-slate-400">
                  {opt.label}
                </span>
                {opt.full}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Call button */}
      <button
        onClick={toggleCall}
        disabled={isConnecting || !isSetup}
        className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
          isCalling
            ? "bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]"
            : "bg-violet-600 hover:bg-violet-700 text-white"
        } disabled:opacity-50`}
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
          </>
        ) : isCalling ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            End Call
          </>
        ) : (
          <>
            <PhoneCall className="w-4 h-4" /> Call AI Mentor
          </>
        )}
      </button>
    </div>
  );
}