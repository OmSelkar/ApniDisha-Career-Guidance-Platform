'use client';

import { useState } from "react";
import { Button } from "../retroui/Button";
import { IconArrowRight, IconBrandGithub, IconDatabase, IconExternalLink, IconGlobe, IconLayersIntersect, IconTrophy } from "@tabler/icons-react";
import { HelpCircleIcon, LucidePlugZap } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   Project data — swap out with your real projects
═══════════════════════════════════════════════════════════ */
const PROJECTS = [
  {
    id: "01",
    title: "QuizMaster Pro",
    category: "Real-time Platform",
    categoryIcon: LucidePlugZap,
    featured: true,
    badge: null,
    badgeIcon: null,
    image:"/quizmaster.png",
    description:
      "A production ready real-time quiz platform with complex cloud infrastructure. Optimized for scale and cost using AWS services like ECS Fargate and Cloud Map for high-performance networking.",
    stack: ["Node.js", "React", "AWS ECS", "Fargate", "Cloud Map", "MongoDB","Firebase","API Gateway"],
    github: "https://github.com/OmSelkar/QuizMaster-Pro",
    live: "https://quiz-master-pro-ashy.vercel.app/",
    accent: "bg-white",
  },
  {
    id: "02",
    title: "Skill Porter",
    category: "HR Tech",
    categoryIcon: IconLayersIntersect,
    featured: false,
    badge: null,
    badgeIcon: null,
    image:"/skill-porter.png",
    description:
      "A full-stack job portal featuring applicant tracking and recruiter dashboards. Implemented JWT authentication and responsive UI for managing hiring workflows.",
    stack: ["React", "Express", "Node.js", "JWT", "MongoDB","EmailJS"],
    github: "https://github.com/OmSelkar/Job-Board",
    live: "https://job-board-frontend-gules-nine.vercel.app/",
    accent: "bg-white",
  },
  {
    id: "03",
    title: "ApniDisha",
    category: "Career Tech / ML",
    categoryIcon: IconGlobe,
    featured: false,
    badge: "",
    badgeIcon: IconTrophy,
    description:
      "A career guidance platform for Class 10-12 students. Uses Machine Learning (Random Forest) to recommend career paths based on user interests and skills. Built for the Smart India Hackathon.",
    stack: ["React", "Python", "Flask", "Tailwind", "Machine Learning","Gemini API"],
    github: "https://github.com/Atharv1patil/Apni_Disha-memo",
    // live: "#",
    accent: "bg-yellow-300",
  },
  {
  id: "04",
  title: "She Can Foundation Portal",
  category: "Full Stack",
  categoryIcon: IconDatabase, // You can keep this or change to something like a database or server icon
  featured: false, // I recommend setting this to true! It's a great project.
  badge: "New",
  badgeIcon: null,
  image:"/foundation.png",
  description: "A production-ready contact portal featuring a responsive public form and a secure, password-protected admin dashboard. Built with Next.js Server Actions, robust Zod validation, and a containerized PostgreSQL database managed via Prisma ORM.",
  stack: [
    "Next.js", 
    "TypeScript", 
    "PostgreSQL", 
    "Prisma ORM", 
    "Tailwind CSS", 
    "Zod", 
    "Docker"
  ],
  github: "https://github.com/OmSelkar/she-can-foundation",
  // live: "https://your-deployment-link.com", // Uncomment this once you deploy it to Vercel!
  accent: "bg-white",
},
];

/* ═══════════════════════════════════════════════════════════
   Tech stack pill
═══════════════════════════════════════════════════════════ */
function StackPill({ label }: { label: string }) {
  return (
    <span className="
      inline-block px-2.5 py-1
      text-[11px] font-black uppercase tracking-widest
      border-2 border-black
      bg-white
      shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
      leading-none
    ">
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   Featured project card (large, horizontal)
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   Featured project card (large, horizontal with image)
═══════════════════════════════════════════════════════════ */
function FeaturedCard({ project }: { project: typeof PROJECTS[0] }) {
  const CatIcon = project.categoryIcon;

  return (
    <div className="
      group relative flex flex-col lg:flex-row
      border-4 border-black bg-yellow-300
      shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]
      hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
      hover:translate-x-1 hover:translate-y-1
      transition-all duration-150
    ">
      {/* ── Image Section (Left) ── */}
      <div className="lg:w-[45%] relative border-b-4 lg:border-b-0 lg:border-r-4 border-black overflow-hidden bg-black">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2.5 bg-black px-4 py-2 border-2 border-yellow-300">
          <span className="font-mono font-black text-yellow-300 text-sm">/{project.id}</span>
          <span className="w-px h-4 bg-yellow-300/40" />
          <CatIcon size={14} strokeWidth={2.5} className="text-yellow-300" />
          <span className="font-bold text-xs uppercase tracking-widest text-yellow-300/80">
            {project.category}
          </span>
        </div>
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-64 lg:h-full object-cover object-center grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
        />
      </div>

      {/* ── Content Section (Right) ── */}
      <div className="flex-1 grid md:grid-cols-[1fr_auto] gap-0">
        <div className="px-6 py-7 flex flex-col gap-5">
          <h3 className="text-4xl md:text-5xl font-head font-black leading-none text-black">
            {project.title}
          </h3>
          <p className="text-base font-medium leading-relaxed text-black/75 max-w-xl">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {project.stack.map((s) => (
              <StackPill key={s} label={s} />
            ))}
          </div>
        </div>

        {/* CTA panel */}
        <div className="flex md:flex-col gap-0 border-t-4 md:border-t-0 md:border-l-4 border-black">
          <a
            href={project.github}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex flex-col items-center justify-center gap-2 px-8 py-6 bg-black text-white hover:bg-yellow-300 hover:text-black transition-colors duration-150 border-r-4 md:border-r-0 md:border-b-4 border-black group/btn"
          >
            <IconBrandGithub size={22} strokeWidth={2} />
            <span className="font-black text-xs uppercase tracking-widest">Code</span>
          </a>
          
          {project.live && (
            <a
              href={project.live}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 flex flex-col items-center justify-center gap-2 px-8 py-6 bg-yellow-300 text-black hover:bg-black hover:text-white transition-colors duration-150 group/btn"
            >
              <IconExternalLink size={22} strokeWidth={2} />
              <span className="font-black text-xs uppercase tracking-widest">Live</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Regular project card
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   Regular project card (vertical with image)
═══════════════════════════════════════════════════════════ */
function ProjectCard({ project }: { project: typeof PROJECTS[0] }) {
  const CatIcon = project.categoryIcon;

  return (
    <div className="
      group relative flex flex-col
      border-4 border-black bg-white
      shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
      hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
      hover:translate-x-1 hover:translate-y-1
      transition-all duration-150
    ">
      {/* ── Image Header ── */}
      <div className="relative h-48 w-full border-b-4 border-black overflow-hidden bg-black">
        {/* Category Pill Floating over image */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <CatIcon size={12} strokeWidth={2.5} className="text-black" />
          <span className="font-bold text-[10px] uppercase tracking-widest text-black">
            {project.category}
          </span>
        </div>
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-full object-cover object-top grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
        />
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-4 px-5 py-6 flex-1">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-head font-black leading-tight text-black">
            {project.title}
          </h3>
          <span className="font-mono font-black text-xl text-black/20 leading-none select-none">
            {project.id}
          </span>
        </div>
        
        <p className="text-sm font-medium leading-relaxed text-black/65 flex-1">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.stack.map((s) => (
            <StackPill key={s} label={s} />
          ))}
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className="flex border-t-4 border-black">
        <a
          href={project.github}
          target="_blank" 
          rel="noopener noreferrer"
          className={`
            flex-1 flex items-center justify-center gap-2 py-3.5 px-4
            font-black text-xs uppercase tracking-widest
            hover:bg-black hover:text-white transition-colors duration-150
            ${project.live ? 'border-r-4 border-black' : ''}
          `}
        >
          <IconBrandGithub size={14} strokeWidth={2.5} />
          GitHub
        </a>
        
        {project.live && (
          <a
            href={project.live}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 font-black text-xs uppercase tracking-widest hover:bg-yellow-300 transition-colors duration-150"
          >
            <IconExternalLink size={14} strokeWidth={2.5} />
            Live
          </a>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Projects Section
═══════════════════════════════════════════════════════════ */
export default function ProjectsSection() {
  const featured = PROJECTS.find((p) => p.featured)!;
  const rest     = PROJECTS.filter((p) => !p.featured);

  return (
    <section id="projects" className="relative bg-white border-b-4 border-black py-20 lg:py-28 overflow-hidden">
      {/* Background grid — same as hero */}
      <div className="absolute inset-0 z-0 opacity-[0.06] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="container relative z-10 mx-auto px-6 max-w-7xl">

        {/* ── Section header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="flex flex-col gap-4">
            {/* Section label */}
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-black" />
              <span className="font-black text-xs uppercase tracking-[0.25em] text-black/40">
                Selected Work
              </span>
            </div>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-head font-black leading-none">
              MY{" "}
              <span className="
                relative inline-block
                after:content-[''] after:absolute after:bottom-1 after:left-0
                after:w-full after:h-3 after:bg-yellow-300 after:-z-10
              ">
                PROJECTS
              </span>
              <span className="text-black/20">.</span>
            </h2>
          </div>

          {/* View all CTA */}
          <Button
            variant="outline"
            size="lg"
            className="
              self-start md:self-auto
              flex items-center gap-2
              border-4 border-black font-black text-sm uppercase tracking-wider
              shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]
              hover:bg-black hover:text-white
              hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
              hover:translate-x-0.5 hover:translate-y-0.5
              transition-all duration-150
            "
            onClick={() =>
                  window.open(
                    "https://github.com/OmSelkar?tab=repositories",
                    "_blank"
                  )
                }
          >
            All Projects
            <IconArrowRight size={16} strokeWidth={2.5} />
          </Button>
        </div>

        {/* ── Featured project ── */}
        <div className="mb-6">
          <FeaturedCard project={featured} />
        </div>

        {/* ── Regular project grid ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}

          {/* "More coming" teaser card */}
          <div className="
            flex flex-col items-center justify-center gap-4
            border-4 border-dashed border-black/30
            py-12 px-6
            hover:border-black hover:bg-yellow-300/10
            transition-all duration-200
            cursor-default
            group
          ">
            <div className="
              w-12 h-12 flex items-center justify-center
              border-4 border-black/20 group-hover:border-black
              group-hover:bg-yellow-300
              transition-all duration-200
            ">
              <span className="font-mono font-black text-xl text-black/20 group-hover:text-black leading-none">
                +
              </span>
            </div>
            <div className="text-center">
              <p className="font-black text-sm uppercase tracking-widest text-black/30 group-hover:text-black transition-colors">
                More Shipping
              </p>
              <p className="font-medium text-xs text-black/25 mt-1">Stay tuned</p>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}