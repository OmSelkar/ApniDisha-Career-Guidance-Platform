'use client';

import { Code2, Server, Layout, Database, Cloud, TerminalSquare } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   Skills Data
═══════════════════════════════════════════════════════════ */
const SKILLS = [
  {
    category: "Languages",
    icon: Code2,
    items: ["JavaScript", "TypeScript", "C++", "Python", "SQL"],
  },
  {
    category: "Frontend",
    icon: Layout,
    items: ["React", "Next.js", "Tailwind CSS", "HTML5", "CSS3"],
  },
  {
    category: "Backend",
    icon: Server,
    items: ["Node.js", "Express.js", "REST APIs", "Server Actions"],
  },
  {
    category: "Database",
    icon: Database,
    items: ["MongoDB", "PostgreSQL", "Prisma ORM", "Mongoose"],
  },
  {
    category: "Cloud & Ops",
    icon: Cloud,
    items: ["AWS (EC2/ECS/API Gateway)", "Docker", "Vercel", "GitHub Actions"],
  },
  {
    category: "Tools",
    icon: TerminalSquare,
    items: ["Git", "Postman", "Linux", "JMeter", "Firebase"],
  },
];

export default function SkillsSection() {
  return (
    <section id="skills" className="relative bg-white py-20 lg:py-28 border-b-4 border-black overflow-hidden">
      
      {/* Background grid */}
      <div className="absolute inset-0 z-0 opacity-[0.06] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="container relative z-10 mx-auto px-6 max-w-6xl">
        
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-black" />
              <span className="font-black text-xs uppercase tracking-[0.25em] text-black/40">
                Technical Arsenal
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-head font-black leading-none">
              WHAT I <span className="relative inline-block after:content-[''] after:absolute after:bottom-1 after:left-0 after:w-full after:h-3 after:bg-yellow-300 after:-z-10">BUILD WITH</span>.
            </h2>
          </div>
        </div>

        {/* ─── Core Stack Highlight (Banner Style) ─── */}
        <div className="mb-12 border-4 border-black bg-black text-white p-6 shadow-[8px_8px_0px_0px_rgba(255,216,0,1)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <span className="w-3 h-3 bg-yellow-400 animate-pulse border-2 border-white" />
            <p className="uppercase text-yellow-300 text-sm tracking-widest font-black">
              Current Core Stack
            </p>
          </div>
          <div className="flex flex-wrap md:justify-end gap-x-6 gap-y-3 text-lg md:text-xl font-bold">
            <span className="hover:text-yellow-300 transition-colors cursor-default">Next.js</span>
            <span className="text-white/30 hidden md:inline">/</span>
            <span className="hover:text-yellow-300 transition-colors cursor-default">TypeScript</span>
            <span className="text-white/30 hidden md:inline">/</span>
            <span className="hover:text-yellow-300 transition-colors cursor-default">PostgreSQL</span>
            <span className="text-white/30 hidden md:inline">/</span>
            <span className="hover:text-yellow-300 transition-colors cursor-default">Docker</span>
            <span className="text-white/30 hidden md:inline">/</span>
            <span className="hover:text-yellow-300 transition-colors cursor-default">AWS</span>
          </div>
        </div>

        {/* ─── Skills Grid ─── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SKILLS.map((skill) => (
            <div
              key={skill.category}
              className="group border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
            >
              {/* Card Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-yellow-300 border-2 border-black group-hover:bg-black group-hover:text-yellow-300 transition-colors">
                  <skill.icon size={28} strokeWidth={2.5} />
                </div>
                <h3 className="font-black text-2xl tracking-tight uppercase">{skill.category}</h3>
              </div>

              {/* Skills Pills */}
              <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-black/10">
                {skill.items.map((item) => (
                  <span
                    key={item}
                    className="inline-block px-3 py-1.5 border-2 border-black bg-zinc-50 text-xs font-black uppercase tracking-wider hover:bg-black hover:text-white transition-all duration-200 cursor-default"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}