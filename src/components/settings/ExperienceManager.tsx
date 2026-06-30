"use client";
import { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Experience, ExperienceBullet } from "@/types";
import { v4 as uuidv4 } from "uuid";

const blankExp = (): Omit<Experience, "id"> => ({
  company: "", role: "", startDate: "", endDate: "", location: "", domainIds: [], bullets: [],
});

export default function ExperienceManager() {
  const { experience, domains, addExperience, updateExperience, deleteExperience } = useResumeStore();
  const [form, setForm] = useState<Omit<Experience, "id">>(blankExp());
  const [editId, setEditId] = useState<string | null>(null);
  const [bulletText, setBulletText] = useState("");

  function toggleDomain(id: string) {
    setForm((f) => ({
      ...f,
      domainIds: f.domainIds.includes(id) ? f.domainIds.filter((d) => d !== id) : [...f.domainIds, id],
    }));
  }

  function addBullet() {
    if (!bulletText.trim()) return;
    const b: ExperienceBullet = { id: uuidv4(), text: bulletText.trim(), priority: form.bullets.length + 1, domainIds: form.domainIds };
    setForm((f) => ({ ...f, bullets: [...f.bullets, b] }));
    setBulletText("");
  }

  function removeBullet(id: string) {
    setForm((f) => ({ ...f, bullets: f.bullets.filter((b) => b.id !== id) }));
  }

  function save() {
    if (!form.company.trim()) return;
    if (editId) { updateExperience(editId, form); setEditId(null); } else { addExperience(form); }
    setForm(blankExp());
  }

  function startEdit(exp: Experience) {
    setEditId(exp.id);
    setForm({ company: exp.company, role: exp.role, startDate: exp.startDate, endDate: exp.endDate, location: exp.location, domainIds: exp.domainIds, bullets: exp.bullets });
  }

  return (
    <div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6 space-y-3">
        <h2 className="text-sm font-semibold text-cyan-400">{editId ? "Edit Experience" : "Add Experience"}</h2>
        <div className="grid grid-cols-2 gap-3">
          {(["company","role","startDate","endDate","location"] as const).map((k) => (
            <input key={k} placeholder={k} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500" />
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {domains.map((d) => (
            <button key={d.id} onClick={() => toggleDomain(d.id)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${form.domainIds.includes(d.id) ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" : "bg-slate-700 text-slate-400 border-slate-600"}`}>
              {d.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={bulletText} onChange={(e) => setBulletText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addBullet()}
            placeholder="Add bullet point (Enter to add)"
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500" />
          <button onClick={addBullet} className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 rounded-lg">+</button>
        </div>
        {form.bullets.map((b) => (
          <div key={b.id} className="flex items-center justify-between text-xs text-slate-300 bg-slate-700 px-3 py-2 rounded">
            <span>{b.text}</span>
            <button onClick={() => removeBullet(b.id)} className="text-red-400 ml-2">✕</button>
          </div>
        ))}
        <div className="flex gap-2">
          <button onClick={save} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-semibold px-4 py-2 rounded-lg">{editId ? "Update" : "Add"}</button>
          {editId && <button onClick={() => { setEditId(null); setForm(blankExp()); }} className="text-sm text-slate-400 px-3">Cancel</button>}
        </div>
      </div>
      <div className="space-y-2">
        {experience.map((exp) => (
          <div key={exp.id} className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-4 py-3">
            <div>
              <span className="text-slate-200 text-sm font-medium">{exp.role}</span>
              <span className="text-slate-500 text-xs ml-2">@ {exp.company}</span>
              <span className="text-slate-500 text-xs ml-2">{exp.startDate} – {exp.endDate}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(exp)} className="text-xs text-cyan-400">Edit</button>
              <button onClick={() => deleteExperience(exp.id)} className="text-xs text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
