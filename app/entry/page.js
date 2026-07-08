"use client";

import { members } from "../lib/members";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function EntryPage() {
  const [status, setStatus] = useState("Hadir");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const saved = localStorage.getItem("pkl_member");
      if (saved) {
        setSelectedMember(JSON.parse(saved));
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("pkl_member");
    router.push("/login");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedMember) {
    alert("Please select your name first.");
    return;
  }

  setSaving(true);

  try {
    let photoUrl = "";

    if (photo) {
      photoUrl = await uploadToCloudinary(photo);
    }

    await addDoc(collection(db, "entries"), {
      memberName: selectedMember.name,
      memberNim: selectedMember.nim,
      status,
      description,
      photoUrl,
      createdAt: serverTimestamp(),
    });

    alert("Entry saved!");
    setStatus("Hadir");
    setDescription("");
    setPhoto(null);
  } catch (error) {
    console.error("Error saving entry:", error);
    alert("Failed to save entry.");
  }

  setSaving(false);
};
if (checkingAuth) {
  return <p className="text-slate-500">Memuat...</p>;
}

return (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold text-blue-900">Absen Harian</h1>
      <button
        onClick={handleLogout}
        className="text-sm text-red-600 hover:underline"
      >
        Logout
      </button>
    </div>

    <p className="text-slate-600 mb-4">
      Login sebagai <span className="font-medium">{selectedMember?.name}</span>
    </p>

    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-slate-300 rounded-md p-2 w-full bg-white"
        >
          <option value="Hadir">Hadir</option>
          <option value="Sakit">Sakit</option>
          <option value="Izin">Izin</option>
          <option value="Alfa">Alfa</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Deskripsi
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="border border-slate-300 rounded-md p-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Foto Logbook
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="border border-slate-300 rounded-md p-2 w-full bg-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-800 file:text-white file:text-sm file:font-medium hover:file:bg-blue-700"
        />
      </div>

      {photo && (
        <p className="text-sm text-slate-500">Selected file: {photo.name}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-800 text-white font-medium px-5 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? "Saving..." : "Submit"}
      </button>
    </form>
  </div>
);
}