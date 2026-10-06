"use client";

import { IconMapPin, IconSchool, IconCodeCircle, IconTrophy, IconCoffee } from "@tabler/icons-react";

export default function AboutSection() {
  return (
    <section id="about" className="relative bg-white py-20 lg:py-28 border-b-4 border-black overflow-hidden">
      {/* Background grid matching the hero & projects */}
      <div className="absolute inset-0 z-0 opacity-[0.06] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="container relative z-10 mx-auto px-6 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* ─── Left Content: The Narrative ─── */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-head font-black leading-tight text-black">
                Architecting solutions for the <span className="text-yellow-500 underline decoration-black decoration-4">modern web</span>.
              </h2>
            </div>

            <div className="space-y-6 text-lg font-medium leading-relaxed text-zinc-700 mt-2">
              <p>
                I am a Computer Science undergraduate based in Nagpur, specializing in building robust applications with the MERN stack and Amazon Web Services (AWS) infrastructure.
              </p>
              
              <p>
                What started as a curiosity for writing logic has evolved into an obsession with cloud-native architectures and serverless backend systems. I believe that great software is built at the intersection of clean, scalable data structures and seamless user experiences.
              </p>

              <p>
                Whether I am orchestrating Docker containers, engineering real-time platforms, or grinding through Data Structures and Algorithms, my goal remains the same: turning complex technical challenges into elegant, production-ready solutions.
              </p>
            </div>
          </div>

          {/* ─── Right Content: Neo-Brutalist Fact Cards ─── */}
          <div className="lg:col-span-5 flex flex-col gap-6 mt-8 lg:mt-0">
            
            {/* Education Card */}
            <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <IconSchool size={28} strokeWidth={2} className="text-yellow-500" />
                <h3 className="font-black text-xl uppercase tracking-tight">Education</h3>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-lg leading-tight">G. H. Raisoni College of Engineering</p>
                <p className="text-zinc-600 font-medium">B.Tech in Computer Science</p>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t-2 border-black/10 text-sm font-bold text-black/50 uppercase tracking-widest">
                  <IconMapPin size={16} /> Nagpur, Maharashtra
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* DSA Stat */}
              <div className="border-4 border-black bg-yellow-300 p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 transition-colors flex flex-col justify-center items-center text-center">
                <IconCodeCircle size={32} strokeWidth={2} className="mb-2" />
                <div className="text-3xl font-black">190+</div>
                <p className="font-bold text-xs uppercase tracking-widest mt-1">DSA Problems</p>
              </div>

              {/* Hackathon Stat */}
              <div className="border-4 border-black bg-black text-white p-5 shadow-[6px_6px_0px_0px_rgba(255,216,0,1)] flex flex-col justify-center items-center text-center">
                <IconTrophy size={32} strokeWidth={2} className="mb-2 text-yellow-400" />
                <div className="text-2xl font-black">SIH '25</div>
                <p className="font-bold text-xs uppercase tracking-widest mt-1 text-zinc-400">National Finalist</p>
              </div>
            </div>

            {/* Currently Exploring */}
            <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-2">
              <p className="uppercase text-xs tracking-widest text-black/50 mb-4 font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Currently Exploring
              </p>
              <div className="flex flex-wrap gap-2">
                {["Next.js App Router", "Docker Containers", "AWS ECS Fargate", "System Architecture"].map((item) => (
                  <span 
                    key={item}
                    className="px-3 py-1.5 border-2 border-black text-xs font-black uppercase tracking-wider bg-zinc-100 hover:bg-yellow-300 transition-colors cursor-default"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Off The Clock (Hobbies) */}
            <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <p className="uppercase text-xs tracking-widest text-black/50 mb-4 font-bold flex items-center gap-2">
                <IconCoffee size={16} className="text-black/50" />
                Off The Clock
              </p>
              <ul className="space-y-3 font-medium text-sm text-zinc-700">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-yellow-500">✦</span>
                  <span>Sculpting 3D environments and assets in <strong>Blender</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-yellow-500">✦</span>
                  <span>Building out <strong>a Chrome Extension</strong> for personal productivity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-yellow-500">✦</span>
                  <span>Disconnecting from screens to experiment with new <strong>Cooking</strong> recipes</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}