"use client";

import { useEffect, useState } from "react";

type ContadorPersonalizadoProps = {
  title: string;
};

const PREFIXO_STORAGE = "likes_tech_";

export default function Contador({ title }: ContadorPersonalizadoProps) {
  const [likes, setLikes] = useState(0);

  // Ler do localStorage quando o componente monta
  useEffect(() => {
    if (typeof window === "undefined") return;

    const chave = PREFIXO_STORAGE + title;
    const guardado = window.localStorage.getItem(chave);

    if (guardado !== null) {
      setLikes(Number(guardado));
    }
  }, [title]);

  function incrementar() {
    setLikes((anterior) => {
      const novo = anterior + 1;

      if (typeof window !== "undefined") {
        const chave = PREFIXO_STORAGE + title;
        window.localStorage.setItem(chave, String(novo));
      }

      return novo;
    });
  }

  return (
    <button
      onClick={incrementar}
      className="mt-2 px-3 py-1 rounded-full bg-pink-500 text-white text-sm font-semibold hover:bg-pink-600 transition"
    >
      ❤️ {likes} like{likes === 1 ? "" : "s"}
    </button>
  );
}
