"use client";
import { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Education } from "@/types";

const blankEdu = (): Omit<Education, "id"> => ({
  degree: "", institute: "", startDate: "", endDate: "", score: "", location: "",
});

export default function EducationManager() {
  const { education, addEducation, updateEducation, deleteEducation } = useResumeStore();
  const [form, setForm] = useState<Omit<Education, "id">>(blankEdu());
  const [editId, setEditId] = useState<string | null>(null);

  function save() {
    if (!form.degree.trim()) return;
    if (editId) { updateEducation(editId, form); setEditId(null); } else { addEducation(form); }
    setForm(blankEdu());
  }

  function startEdit(edu: Education) {
    setEditId(edu.id);
    setForm({ degree: edu.degree, institute: edu.institute, startDate: edu.startDate, endDate: edu.endDate, score: edu.score, location: edu.location });
  }

  return (
    <div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6 space-y-3">
        <h2 className="text-sm font-semibold text-cyan-400">{editId ? "Edit Education" : "Add Education"}</h2>
        <div className="grid grid-cols-2 gap-3">
          {(["degree", "institute", "startDate", "endDate", "score", "location"] as const).map((k) => (
            <input key={k} placeholder={k} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500" />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-semibold px-4 py-2 rounded-lg">{editId ? "Update" : "Add"}</button>
          {editId && <button onClick={() => { setEditId(null); setForm(blankEdu()); }} className="text-sm text-slate-400 px-3">Cancel</button>}
        </div>
      </div>
      <div className="space-y-2">
        {education.map((edu) => (
          <div key={edu.id} className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-4 py-3">
            <div>
              <span className="text-slate-200 text-sm font-medium">{edu.degree}</span>
              <span className="text-slate-500 text-xs ml-2">{edu.institute}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(edu)} className="text-xs text-cyan-400">Edit</button>
              <button onClick={() => deleteEducation(edu.id)} className="text-xs text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
