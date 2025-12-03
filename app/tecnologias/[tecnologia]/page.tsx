"use client";

import tecnologias from "@/data/tecnologias.json";
import { useParams } from "next/navigation";
import Contador from "@/components/componenteContadorPersonalizado/contador";

export default function CaracteristicasPage() {
  const params = useParams();
  const id = Number(params.tecnologia);

  const tecnologia = tecnologias[id];

  return (
    <>
      <h2>{tecnologia.title}</h2>
      <p>{tecnologia.description}</p>

      <Contador title={tecnologia.title} />
    </>
  );
}
