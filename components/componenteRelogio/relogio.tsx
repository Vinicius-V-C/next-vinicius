
"use client";

import { useEffect, useState } from "react";

export default function Relogio() {
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setAgora(new Date());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const horaFormatada = agora.toLocaleTimeString("pt-PT");

  return <span>{horaFormatada}</span>;
}
