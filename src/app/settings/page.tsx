"use client";
import { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import ProfileForm from "@/components/settings/ProfileForm";
import SkillsManager from "@/components/settings/SkillsManager";
import ExperienceManager from "@/components/settings/ExperienceManager";
import ProjectsManager from "@/components/settings/ProjectsManager";
import EducationManager from "@/components/settings/EducationManager";

type Tab = "profile" | "skills" | "experience" | "projects" | "education";

const tabs: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-full">
          Private
        </span>
      </div>

      <div className="flex gap-1 mb-8 border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && <ProfileForm />}
      {activeTab === "skills" && <SkillsManager />}
      {activeTab === "experience" && <ExperienceManager />}
      {activeTab === "projects" && <ProjectsManager />}
      {activeTab === "education" && <EducationManager />}
    </div>
  );
}
