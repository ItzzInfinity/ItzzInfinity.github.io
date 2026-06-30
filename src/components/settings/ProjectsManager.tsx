"use client";
import { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Project, ProjectBullet } from "@/types";
import { v4 as uuidv4 } from "uuid";

const blankProj = (): Omit<Project, "id"> => ({
  title: "", domainIds: [], sourceLink: "", tools: [], bullets: [],
});

export default function ProjectsManager() {
  const { projects, domains, addProject, updateProject, deleteProject } = useResumeStore();
  const [form, setForm] = useState<Omit<Project, "id">>(blankProj());
  const [editId, setEditId] = useState<string | null>(null);
  const [bulletText, setBulletText] = useState("");
  const [toolText, setToolText] = useState("");

  function toggleDomain(id: string) {
    setForm((f) => ({ ...f, domainIds: f.domainIds.includes(id) ? f.domainIds.filter((d) => d !== id) : [...f.domainIds, id] }));
  }

  function addBullet() {
    if (!bulletText.trim()) return;
    const b: ProjectBullet = { id: uuidv4(), text: bulletText.trim(), priority: form.bullets.length + 1, domainIds: form.domainIds };
    setForm((f) => ({ ...f, bullets: [...f.bullets, b] }));
    setBulletText("");
  }

  function addTool() {
    if (!toolText.trim()) return;
    setForm((f) => ({ ...f, tools: [...f.tools, toolText.trim()] }));
    setToolText("");
  }

  function save() {
    if (!form.title.trim()) return;
    if (editId) { updateProject(editId, form); setEditId(null); } else { addProject(form); }
    setForm(blankProj());
  }

  function startEdit(proj: Project) {
    setEditId(proj.id);
    setForm({ title: proj.title, domainIds: proj.domainIds, sourceLink: proj.sourceLink, tools: proj.tools, bullets: proj.bullets });
  }

  return (
    <div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6 space-y-3">
        <h2 className="text-sm font-semibold text-cyan-400">{editId ? "Edit Project" : "Add Project"}</h2>
        <input placeholder="Project title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500" />
        <input placeholder="Source link (GitHub URL)" value={form.sourceLink} onChange={(e) => setForm((f) => ({ ...f, sourceLink: e.target.value }))}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500" />
        <div className="flex gap-2 flex-wrap">
          {domains.map((d) => (
            <button key={d.id} onClick={() => toggleDomain(d.id)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${form.domainIds.includes(d.id) ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" : "bg-slate-700 text-slate-400 border-slate-600"}`}>
              {d.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={toolText} onChange={(e) => setToolText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTool()}
            placeholder="Add tool (Enter)"
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500" />
          <button onClick={addTool} className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 rounded-lg">+</button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {form.tools.map((t) => (
            <span key={t} className="flex items-center gap-1 bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
              {t}
              <button onClick={() => setForm((f) => ({ ...f, tools: f.tools.filter((x) => x !== t) }))} className="text-red-400 ml-1">✕</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={bulletText} onChange={(e) => setBulletText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addBullet()}
            placeholder="Add bullet (Enter)"
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500" />
          <button onClick={addBullet} className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 rounded-lg">+</button>
        </div>
        {form.bullets.map((b, i) => (
          <div key={b.id} className="flex items-center justify-between text-xs text-slate-300 bg-slate-700 px-3 py-2 rounded">
            <span className="text-slate-500 mr-2">P{i + 1}</span>
            <span className="flex-1">{b.text}</span>
            <button onClick={() => setForm((f) => ({ ...f, bullets: f.bullets.filter((x) => x.id !== b.id) }))} className="text-red-400 ml-2">✕</button>
          </div>
        ))}
        <div className="flex gap-2">
          <button onClick={save} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-semibold px-4 py-2 rounded-lg">{editId ? "Update" : "Add"}</button>
          {editId && <button onClick={() => { setEditId(null); setForm(blankProj()); }} className="text-sm text-slate-400 px-3">Cancel</button>}
        </div>
      </div>
      <div className="space-y-2">
        {projects.map((proj) => (
          <div key={proj.id} className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-4 py-3">
            <div>
              <span className="text-slate-200 text-sm font-medium">{proj.title}</span>
              <span className="text-slate-500 text-xs ml-2">{proj.bullets.length} bullets</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(proj)} className="text-xs text-cyan-400">Edit</button>
              <button onClick={() => deleteProject(proj.id)} className="text-xs text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
