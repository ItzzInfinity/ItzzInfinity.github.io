"use client";
import { useResumeStore } from "@/store/useResumeStore";
import { Profile } from "@/types";

type ProfileKey = keyof Profile;

const fields: { key: ProfileKey; label: string; multiline?: boolean }[] = [
  { key: "name", label: "Full Name" },
  { key: "title", label: "Title / Role" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "portfolio", label: "Portfolio URL" },
  { key: "about", label: "About / Bio", multiline: true },
];

export default function ProfileForm() {
  const { profile, updateProfile } = useResumeStore();

  function handleChange(key: ProfileKey, value: string) {
    updateProfile({ [key]: value });
  }

  return (
    <div className="space-y-4 max-w-xl">
      {fields.map(({ key, label, multiline }) => (
        <div key={key}>
          <label className="block text-sm text-slate-400 mb-1">{label}</label>
          {multiline ? (
            <textarea
              value={profile[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
            />
          ) : (
            <input
              type="text"
              value={profile[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          )}
        </div>
      ))}
      <p className="text-xs text-slate-500">Changes are saved automatically to browser storage.</p>
    </div>
  );
}
