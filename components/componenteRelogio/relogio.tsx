"use client";

import { useEffect, useState } from "react";

export default function Relogio() {
  const [hora, setHora] = useState<string>(""); // começa vazio e igual no server e no client

  useEffect(() => {
    function atualizarHora() {
      setHora(new Date().toLocaleTimeString("pt-PT"));
    }

    // atualiza logo ao montar
    atualizarHora();

    // e depois de segundo em segundo
    const id = setInterval(atualizarHora, 1000);

    return () => clearInterval(id);
  }, []);

  return <span>{hora || "--:--:--"}</span>;
}
