"use client";

import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { members } from "../lib/members";

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterNim, setFilterNim] = useState("");

  useEffect(() => {
    const fetchEntries = async () => {
      const q = query(collection(db, "entries"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEntries(data);
      setLoading(false);
    };

    fetchEntries();
  }, []);

  if (loading) {
    return <p className="text-slate-500">Loading entries...</p>;
  }

  const filteredEntries = filterNim
    ? entries.filter((entry) => entry.memberNim === filterNim)
    : entries;

  const statusStyles = {
    Hadir: "bg-green-100 text-green-800",
    Sakit: "bg-yellow-100 text-yellow-800",
    Izin: "bg-blue-100 text-blue-800",
    Alfa: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-blue-900 mb-6">Logbook Entries</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Filter berdasarkan nama
        </label>
        <select
          value={filterNim}
          onChange={(e) => setFilterNim(e.target.value)}
          className="border border-slate-300 rounded-md p-2 w-full sm:w-64 bg-white"
        >
          <option value="">-- Tampilkan Semua --</option>
          {members.map((m) => (
            <option key={m.nim} value={m.nim}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {filteredEntries.length === 0 && (
        <p className="text-slate-400 italic">Belum ada entri.</p>
      )}

      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-slate-800">{entry.memberName}</p>
                <p className="text-xs text-slate-400">{entry.memberNim}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  statusStyles[entry.status] || "bg-slate-100 text-slate-600"
                }`}
              >
                {entry.status}
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-3">
              {entry.description || <span className="italic text-slate-400">Tidak ada deskripsi</span>}
            </p>

            {entry.photoUrl && (
              <img
                src={entry.photoUrl}
                alt="Bukti foto"
                className="max-w-[200px] rounded-md border border-slate-200"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}