"use client";
import Link from "next/link";
import { useResumeStore } from "@/store/useResumeStore";

const domainCards = [
  { href: "/vlsi", label: "VLSI", icon: "⚡", desc: "RTL Design · Verification · FPGA" },
  { href: "/embedded", label: "Embedded", icon: "🔧", desc: "Firmware · RTOS · Microcontrollers" },
  { href: "/pcb", label: "PCB Design", icon: "🖥️", desc: "Schematic · Layout · Fabrication" },
];

export default function HomePage() {
  const { profile } = useResumeStore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <p className="text-cyan-400 text-sm font-mono mb-3">Hello, World! I&apos;m</p>
        <h1 className="text-5xl font-bold text-white mb-4">{profile.name}</h1>
        <p className="text-xl text-slate-400 mb-8">{profile.title}</p>
        <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">{profile.about}</p>
        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/about"
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            About Me
          </Link>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white text-center mb-8">Domains</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {domainCards.map(({ href, label, icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="group bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-cyan-500/50 rounded-xl p-6 transition-all"
          >
            <div className="text-4xl mb-3">{icon}</div>
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
              {label}
            </h3>
            <p className="text-sm text-slate-400">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
