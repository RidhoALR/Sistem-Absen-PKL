"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusStyles = {
  Hadir: "bg-green-100 text-green-800",
  Sakit: "bg-yellow-100 text-yellow-800",
  Izin: "bg-blue-100 text-blue-800",
  Alfa: "bg-red-100 text-red-800",
};

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const saved = localStorage.getItem("pkl_member");
      const member = saved ? JSON.parse(saved) : null;
      setSelectedMember(member);
      setCheckingAuth(false);

      if (member) {
        const q = query(
          collection(db, "entries"),
          where("memberNim", "==", member.nim),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEntries(data);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("pkl_member");
    router.push("/login");
  };

  if (checkingAuth || loading) {
    return <p className="text-slate-500">Memuat...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-blue-900">Logbook Saya</h1>
        <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
          Logout
        </button>
      </div>

      {entries.length === 0 && (
        <p className="text-slate-400 italic">Belum ada entri.</p>
      )}

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-slate-800">{entry.memberName}</p>
                <p className="text-xs text-slate-400">{entry.memberNim}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[entry.status] || "bg-slate-100 text-slate-600"}`}>
                {entry.status}
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-1">
              {entry.description || <span className="italic text-slate-400">Tidak ada deskripsi</span>}
            </p>

            <p className="text-xs text-slate-400 mb-3">{formatDate(entry.createdAt)}</p>

            {entry.photoUrl && (
              <img src={entry.photoUrl} alt="Bukti foto" className="max-w-[200px] rounded-md border border-slate-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}