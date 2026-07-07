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
      <h1>Absen Harian</h1>
      <div>
        {isClient ? (
          <select
            value={selectedMember?.nim || ""}
            onChange={handleMemberChange}
          >
            <option value="">Pilih Nama Anda</option>
            {members.map((m) => (
              <option key={m.nim} value={m.nim}>
                {m.name}
              </option>
            ))}
          </select>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Status: </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Hadir">Hadir</option>
            <option value="Sakit">Sakit</option>
            <option value="Izin">Izin</option>
            <option value="Alfa">Alfa</option>
          </select>
        </div>

        <div>
          <label>Deskripsi: </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            cols={40}
          />
        </div>

        <div>
          <label>Foto Logbook: </label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
        </div>

        {photo && <p>Selected file: {photo.name}</p>}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Submit"}
        </button>
      </form>
    </div>
  );
}