"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { members } from "../lib/members";

function CheckinContent() {
  const [status, setStatus] = useState("Memproses...");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("t");

    if (!token) {
      setStatus("QR tidak valid.");
      return;
    }

    try {
      const decoded = JSON.parse(atob(token));
      const { email, password } = decoded;

      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          const member = members.find((m) => m.email === email);
          if (member) {
            localStorage.setItem("pkl_member", JSON.stringify(member));
          }
          router.push("/entry");
        })
        .catch((err) => {
          console.error(err);
          setStatus("Gagal login otomatis. QR mungkin sudah tidak berlaku.");
        });
    } catch (err) {
      console.error(err);
      setStatus("QR tidak valid.");
    }
  }, [searchParams, router]);

  return (
    <div className="max-w-sm mx-auto mt-20 text-center">
      <p className="text-slate-600">{status}</p>
    </div>
  );
}

export default function CheckinPage() {
  return (
    <Suspense fallback={<p className="text-center mt-20 text-slate-500">Memuat...</p>}>
      <CheckinContent />
    </Suspense>
  );
}