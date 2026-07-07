"use client";

import { members } from "../lib/members";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function EntryPage() {
  const [status, setStatus] = useState("Hadir");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);


  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
  };
const [selectedMember, setSelectedMember] = useState(null);
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
  const saved = localStorage.getItem("pkl_member");
  if (saved) {
    setSelectedMember(JSON.parse(saved));
  }
}, []);

const handleMemberChange = (e) => {
  console.log("Selected value:", e.target.value);
  const member = members.find((m) => m.nim === e.target.value);
  console.log("Found member:", member);
  setSelectedMember(member);
  localStorage.setItem("pkl_member", JSON.stringify(member));
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
return (
  <div>
    <h1 className="text-2xl font-semibold text-blue-900 mb-6">Absen Harian</h1>

    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-600 mb-1">
        Nama
      </label>
      {isClient ? (
        <select
          value={selectedMember?.nim || ""}
          onChange={handleMemberChange}
          className="border border-slate-300 rounded-md p-2 w-full bg-white"
        >
          <option value="">Pilih Nama Anda</option>
          {members.map((m) => (
            <option key={m.nim} value={m.nim}>
              {m.name}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-slate-400 text-sm">Loading...</p>
      )}
    </div>

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