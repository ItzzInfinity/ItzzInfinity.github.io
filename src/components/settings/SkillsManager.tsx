"use client";
import { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Skill } from "@/types";
import { v4 as uuidv4 } from "uuid";

const blank = (): Omit<Skill, "id"> => ({
  name: "",
  category: "",
  domainIds: [],
  priority: 1,
  visible: true,
});

export default function SkillsManager() {
  const { skills, domains, addSkill, updateSkill, deleteSkill } = useResumeStore();
  const [form, setForm] = useState<Omit<Skill, "id">>(blank());
  const [editId, setEditId] = useState<string | null>(null);

  function toggleDomain(id: string) {
    setForm((f) => ({
      ...f,
      domainIds: f.domainIds.includes(id) ? f.domainIds.filter((d) => d !== id) : [...f.domainIds, id],
    }));
  }

  function save() {
    if (!form.name.trim()) return;
    if (editId) {
      updateSkill(editId, form);
      setEditId(null);
    } else {
      addSkill(form);
    }
    setForm(blank());
  }

  function startEdit(sk: Skill) {
    setEditId(sk.id);
    setForm({ name: sk.name, category: sk.category, domainIds: sk.domainIds, priority: sk.priority, visible: sk.visible });
  }

  return (
    <div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6 space-y-3">
        <h2 className="text-sm font-semibold text-cyan-400">{editId ? "Edit Skill" : "Add Skill"}</h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Skill name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          />
          <input
            placeholder="Category (e.g. HDL)"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-2">Domains</p>
          <div className="flex gap-2 flex-wrap">
            {domains.map((d) => (
              <button
                key={d.id}
                onClick={() => toggleDomain(d.id)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  form.domainIds.includes(d.id)
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                    : "bg-slate-700 text-slate-400 border-slate-600"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-xs text-slate-400">
            Priority:
            <input
              type="number"
              min={1}
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))}
              className="ml-2 w-16 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))}
              className="accent-cyan-400"
            />
            Visible
          </label>
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-semibold px-4 py-2 rounded-lg">
            {editId ? "Update" : "Add"}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setForm(blank()); }} className="text-sm text-slate-400 hover:text-slate-200 px-3">
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {skills.map((sk) => (
          <div key={sk.id} className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-4 py-3">
            <div>
              <span className="text-slate-200 text-sm font-medium">{sk.name}</span>
              <span className="text-slate-500 text-xs ml-2">{sk.category}</span>
              <span className="text-slate-500 text-xs ml-2">P:{sk.priority}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(sk)} className="text-xs text-cyan-400 hover:text-cyan-300">Edit</button>
              <button onClick={() => deleteSkill(sk.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
