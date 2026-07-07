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

  if (loading) return <p>Loading entries...</p>;

  const filteredEntries = filterNim
    ? entries.filter((entry) => entry.memberNim === filterNim)
    : entries;

  return (
    <div>
      <h1>Logbook Entries</h1>

      <div>
        <label>Filter by member: </label>
        <select value={filterNim} onChange={(e) => setFilterNim(e.target.value)}>
          <option value="">-- Show All --</option>
          {members.map((m) => (
            <option key={m.nim} value={m.nim}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {filteredEntries.length === 0 && <p>No entries found.</p>}

      {filteredEntries.map((entry) => (
        <div key={entry.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <p><strong>Nama:</strong> {entry.memberName} ({entry.memberNim})</p>
          <p><strong>Status:</strong> {entry.status}</p>
          <p><strong>Description:</strong> {entry.description || "(none)"}</p>
          {entry.photoUrl && (
            <img src={entry.photoUrl} alt="Proof" style={{ maxWidth: "200px" }} />
          )}
        </div>
      ))}
    </div>
  );
}