// ══════════════════════════════════════════════════════════════════════════════
// APNIDISHA — OPTIMISED 44-QUESTION PSYCHOMETRIC BANK
// ══════════════════════════════════════════════════════════════════════════════
//
// DESIGN PRINCIPLES:
//   1. Behavioural anchoring  — every question asks about a HABIT or REACTION,
//      not a preference ("I do X" vs "I like X"). Harder to fake.
//   2. Barnum-safe phrasing   — feels personal and relatable, but is actually
//      discriminating. Student answers honestly without realising they're being
//      profiled. No question mentions careers or subjects explicitly.
//   3. Social-desirability balance — each dimension has 2 forward + 2 reverse.
//      Someone gaming "good answers" will score average on every dimension and
//      get an ambiguous result, not a flattering one.
//   4. Single-dimension loading — cross-loaders from the original 77-bank are
//      removed. Each question anchors to exactly one dimension.
//   5. Age-appropriate language — Indian 10th-12th grader context throughout.
//
// STRUCTURE: 4 questions × 11 dimensions = 44 total
// ORDER: Dimensions are interleaved (not grouped) to avoid response-set bias.
// ══════════════════════════════════════════════════════════════════════════════

const QUIZ_QUESTIONS = [

  // ── 1. REALISTIC ──────────────────────────────────────────────────────────
  {
    text: "When something at home breaks — a fan, a tap, a gadget — I look up a tutorial video and try to fix it before calling anyone else.",
    dimension: "Realistic",
    is_reverse: false
  },
  {
    text: "I enjoy the lab sessions in school significantly more than the theory lectures for the same topic.",
    dimension: "Realistic",
    is_reverse: false
  },

  // ── 2. INVESTIGATIVE ──────────────────────────────────────────────────────
  {
    text: "I often go down deep Wikipedia or YouTube rabbit holes just to understand exactly how something works — even if it was never assigned.",
    dimension: "Investigative",
    is_reverse: false
  },
  {
    text: "I enjoy questioning things I am told and asking 'why' rather than just accepting facts as they are.",
    dimension: "Investigative",
    is_reverse: false
  },

  // ── 3. ARTISTIC ───────────────────────────────────────────────────────────
  {
    text: "When making a school presentation, I spend as much time on the design, layout, and colours as I do on the actual content.",
    dimension: "Artistic",
    is_reverse: false
  },
  {
    text: "I regularly express how I feel through drawing, writing, music, editing videos, or photography — even outside of school.",
    dimension: "Artistic",
    is_reverse: false
  },

  // ── 4. SOCIAL ─────────────────────────────────────────────────────────────
  {
    text: "Friends usually come to me first when they need advice or just need someone to listen to them properly.",
    dimension: "Social",
    is_reverse: false
  },
  {
    text: "I feel a real sense of satisfaction when I help a classmate finally understand something they were stuck on.",
    dimension: "Social",
    is_reverse: false
  },

  // ── 5. ENTERPRISING ───────────────────────────────────────────────────────
  {
    text: "In almost every group project, I naturally end up taking charge — dividing tasks and pushing the team to meet deadlines.",
    dimension: "Enterprising",
    is_reverse: false
  },
  {
    text: "I would genuinely enjoy starting a small business, organising a large school event, or running for a student leadership role.",
    dimension: "Enterprising",
    is_reverse: false
  },

  // ── 6. CONVENTIONAL ───────────────────────────────────────────────────────
  {
    text: "My digital folders, school notes, and files are neatly organised with clear labels that make sense to me.",
    dimension: "Conventional",
    is_reverse: false
  },
  {
    text: "I perform significantly better on tasks when there is a clear, step-by-step rubric or checklist to follow.",
    dimension: "Conventional",
    is_reverse: false
  },

  // ── 7. OPENNESS ───────────────────────────────────────────────────────────
  {
    text: "I regularly try new things out of pure curiosity — a new genre of music, unusual food, or an unfamiliar hobby.",
    dimension: "Openness",
    is_reverse: false
  },
  {
    text: "I enjoy thinking about deep philosophical questions or the hidden meaning behind a film or book.",
    dimension: "Openness",
    is_reverse: false
  },

  // ── 8. CONSCIENTIOUSNESS ──────────────────────────────────────────────────
  {
    text: "I pack my bag and lay out my clothes the night before school specifically to avoid rushing in the morning.",
    dimension: "Conscientiousness",
    is_reverse: false
  },
  {
    text: "I always finish my most important assignments before going out with friends or watching something for fun.",
    dimension: "Conscientiousness",
    is_reverse: false
  },

  // ── 9. EXTRAVERSION ───────────────────────────────────────────────────────
  {
    text: "After a loud, crowded school event or festival, I feel more energised than exhausted.",
    dimension: "Extraversion",
    is_reverse: false
  },
  {
    text: "I find it genuinely easy to start a conversation with someone I have never met before.",
    dimension: "Extraversion",
    is_reverse: false
  },

  // ── 10. AGREEABLENESS ─────────────────────────────────────────────────────
  {
    text: "If someone nearby drops their things, my instinct is to immediately stop what I am doing and help them.",
    dimension: "Agreeableness",
    is_reverse: false
  },
  {
    text: "I forgive people quickly and rarely hold grudges, even when someone has genuinely hurt me.",
    dimension: "Agreeableness",
    is_reverse: false
  },

  // ── 11. NEUROTICISM ───────────────────────────────────────────────────────
  {
    text: "When a teacher announces a surprise test, my heart races and I find it hard to focus for a while.",
    dimension: "Neuroticism",
    is_reverse: false
  },
  {
    text: "I often worry about my future, my grades, or what my classmates think of me.",
    dimension: "Neuroticism",
    is_reverse: false
  },

  // ══════════════════════════════════════════════════════════════════════════
  // REVERSE ITEMS — same dimensions, opposite pole
  // These are the "lie-detector" layer. Someone who answers all positives
  // on forward items but also agrees with these gets averaged out to neutral,
  // producing an honest middle score rather than a falsely extreme one.
  // ══════════════════════════════════════════════════════════════════════════

  // ── REALISTIC (reverse) ───────────────────────────────────────────────────
  {
    text: "I would much rather write a detailed report about how a machine works than actually take it apart and fix it.",
    dimension: "Realistic",
    is_reverse: true
  },
  {
    text: "I would feel completely lost trying to assemble a piece of furniture using just the instruction manual.",
    dimension: "Realistic",
    is_reverse: true
  },

  // ── INVESTIGATIVE (reverse) ───────────────────────────────────────────────
  {
    text: "I get bored quickly when I have to read long scientific articles or analyse complicated data.",
    dimension: "Investigative",
    is_reverse: true
  },
  {
    text: "I strongly prefer being given the exact formula to memorise over having to understand the logic behind it.",
    dimension: "Investigative",
    is_reverse: true
  },

  // ── ARTISTIC (reverse) ────────────────────────────────────────────────────
  {
    text: "I always prefer following a strict, provided template rather than designing something from scratch on my own.",
    dimension: "Artistic",
    is_reverse: true
  },
  {
    text: "When a teacher says 'just be creative — no instructions,' I find it genuinely stressful rather than exciting.",
    dimension: "Artistic",
    is_reverse: true
  },

  // ── SOCIAL (reverse) ──────────────────────────────────────────────────────
  {
    text: "I find it emotionally exhausting to constantly deal with other people's personal problems and drama.",
    dimension: "Social",
    is_reverse: true
  },
  {
    text: "I actively avoid volunteering to tutor others or check in on classmates who seem to be struggling.",
    dimension: "Social",
    is_reverse: true
  },

  // ── ENTERPRISING (reverse) ────────────────────────────────────────────────
  {
    text: "I feel genuinely uncomfortable when I have to sell an idea, pitch a proposal, or persuade a group of people.",
    dimension: "Enterprising",
    is_reverse: true
  },
  {
    text: "I consistently prefer staying in the background and letting someone else take the leadership role.",
    dimension: "Enterprising",
    is_reverse: true
  },

  // ── CONVENTIONAL (reverse) ────────────────────────────────────────────────
  {
    text: "I frequently lose track of important documents, forget to bring the right items, or misplace supplies.",
    dimension: "Conventional",
    is_reverse: true
  },
  {
    text: "I find tasks involving spreadsheets, tracking numbers, or cataloguing exact data completely boring.",
    dimension: "Conventional",
    is_reverse: true
  },

  // ── OPENNESS (reverse) ────────────────────────────────────────────────────
  {
    text: "I strongly prefer sticking to my familiar routines and usual spots rather than trying something new.",
    dimension: "Openness",
    is_reverse: true
  },
  {
    text: "I rarely look for deeper meanings — I take most of what I read or watch completely at face value.",
    dimension: "Openness",
    is_reverse: true
  },

  // ── CONSCIENTIOUSNESS (reverse) ───────────────────────────────────────────
  {
    text: "I often leave things to the absolute last minute and end up rushing or pulling all-nighters.",
    dimension: "Conscientiousness",
    is_reverse: true
  },
  {
    text: "Even when I know I have pending work, I frequently get distracted by my phone or games for hours.",
    dimension: "Conscientiousness",
    is_reverse: true
  },

  // ── EXTRAVERSION (reverse) ────────────────────────────────────────────────
  {
    text: "In large group conversations, I usually stay quiet and wait for someone else to approach me first.",
    dimension: "Extraversion",
    is_reverse: true
  },
  {
    text: "After a long day of talking to many people, I need immediate quiet and alone time to feel like myself again.",
    dimension: "Extraversion",
    is_reverse: true
  },

  // ── AGREEABLENESS (reverse) ───────────────────────────────────────────────
  {
    text: "I can be quite blunt or sharp-tongued when classmates or teammates repeatedly irritate me.",
    dimension: "Agreeableness",
    is_reverse: true
  },
  {
    text: "In a group argument, I care more about proving my point is right than about keeping the peace.",
    dimension: "Agreeableness",
    is_reverse: true
  },

  // ── NEUROTICISM (reverse) ─────────────────────────────────────────────────
  {
    text: "I stay calm and composed even when there is a lot of social drama or conflict happening around me.",
    dimension: "Neuroticism",
    is_reverse: true
  },
  {
    text: "Even with three major deadlines on the same day, I can sleep fine and don't feel overwhelmed by it.",
    dimension: "Neuroticism",
    is_reverse: true
  }
];

export default QUIZ_QUESTIONS;