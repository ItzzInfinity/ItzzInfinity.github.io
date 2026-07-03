"use client";
import { useRef, useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { AppData } from "@/types";
import { parseBackup, serializeBackup, serializeSeedTs, downloadFile } from "@/lib/backup";
import { seedData } from "@/lib/seed";

function pickAppData(s: ReturnType<typeof useResumeStore.getState>): AppData {
  const {
    profile, domains, skills, experience, education, projects,
    certifications, awards, languages, hobbies, strengths, references,
  } = s;
  return {
    profile, domains, skills, experience, education, projects,
    certifications, awards, languages, hobbies, strengths, references,
  };
}

export default function BackupManager() {
  const importData = useResumeStore((s) => s.importData);
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  function exportJson() {
    const data = pickAppData(useResumeStore.getState());
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(`resume-data-${date}.json`, serializeBackup(data));
    setMessage({ kind: "ok", text: "Backup downloaded." });
  }

  function exportSeed() {
    const data = pickAppData(useResumeStore.getState());
    downloadFile("seed.ts", serializeSeedTs(data), "text/typescript");
    setMessage({
      kind: "ok",
      text: "seed.ts downloaded — paste it over src/lib/seed.ts and commit to make this the canonical data.",
    });
  }

  async function importJson(file: File) {
    try {
      const data = parseBackup(await file.text());
      importData(data);
      setMessage({ kind: "ok", text: "Backup imported. All sections were replaced with the file's content." });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Import failed." });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function resetToSeed() {
    if (!window.confirm("Discard all local edits and restore the bundled seed data?")) return;
    importData(seedData);
    setMessage({ kind: "ok", text: "Restored the bundled seed data." });
  }

  const box = "bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3";
  const btn = "bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-semibold px-4 py-2 rounded-lg";
  const btnGhost = "bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold px-4 py-2 rounded-lg";

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`text-sm rounded-lg px-4 py-3 border ${
            message.kind === "ok"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-red-500/10 text-red-400 border-red-500/30"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className={box}>
        <h2 className="text-sm font-semibold text-cyan-400">Export</h2>
        <p className="text-xs text-slate-400">
          Download everything (profile, domains, skills, experience, projects, …) as a JSON backup.
          Local edits live only in this browser&apos;s storage and are discarded whenever the bundled
          seed changes — keep a backup before editing.
        </p>
        <button onClick={exportJson} className={btn}>Download JSON backup</button>
      </div>

      <div className={box}>
        <h2 className="text-sm font-semibold text-cyan-400">Import</h2>
        <p className="text-xs text-slate-400">
          Restore a previously exported JSON backup. This replaces all current content.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
          className="block text-xs text-slate-400 file:mr-3 file:bg-slate-700 file:hover:bg-slate-600 file:text-slate-200 file:text-sm file:font-semibold file:px-4 file:py-2 file:rounded-lg file:border-0 file:cursor-pointer"
        />
      </div>

      <div className={box}>
        <h2 className="text-sm font-semibold text-cyan-400">Promote to seed</h2>
        <p className="text-xs text-slate-400">
          Download the current content as a ready-to-paste <code className="text-slate-300">seed.ts</code>.
          Replace <code className="text-slate-300">src/lib/seed.ts</code> with it and commit — on deploy,
          every client auto-adopts the new seed.
        </p>
        <button onClick={exportSeed} className={btn}>Export as seed.ts</button>
      </div>

      <div className={box}>
        <h2 className="text-sm font-semibold text-red-400">Reset</h2>
        <p className="text-xs text-slate-400">Discard local edits and restore the bundled seed data.</p>
        <button onClick={resetToSeed} className={btnGhost}>Reset to seed</button>
      </div>
    </div>
  );
}
