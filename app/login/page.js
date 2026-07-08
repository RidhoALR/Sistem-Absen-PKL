"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { members } from "../lib/members";

export default function LoginPage() {
  const [selected, setSelected] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const member = members.find((m) => m.nim === selected);
    if (!member) {
      setError("Pilih nama Anda terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, member.email, password);
      localStorage.setItem("pkl_member", JSON.stringify(member));
      router.push("/entry");
    } catch (err) {
      console.error(err);
      setError("Password salah atau akun tidak ditemukan.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-semibold text-blue-900 mb-6 text-center">
        Login PKL
      </h1>

      <form onSubmit={handleLogin} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Pilih Nama Anda
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="border border-slate-300 rounded-md p-2 w-full bg-white"
          >
            <option value="">-- Pilih Nama --</option>
            {members.map((m) => (
              <option key={m.nim} value={m.nim}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-slate-300 rounded-md p-2 w-full"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-800 text-white font-medium px-5 py-2 rounded-md w-full hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}