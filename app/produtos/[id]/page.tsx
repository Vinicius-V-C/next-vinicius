"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import Image from "next/image";

const API_URL = "https://deisishop.pythonanywhere.com/products/";

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao carregar");
  return res.json();
}

export default function ProdutoPage() {
  const { id } = useParams();
  const { data, error, isLoading } = useSWR(API_URL + id, fetcher);

  if (isLoading) return <p>A carregar...</p>;
  if (error) return <p>Erro ao carregar produto.</p>;

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold">{data.title}</h2>

      <Image
        src={data.image}
        width={250}
        height={250}
        alt={data.title}
      />

      <p className="text-gray-600 italic">{data.category}</p>
      <p className="text-xl font-bold">{data.price} €</p>
      <p>{data.description}</p>
      <p>⭐ {data.rating?.rate} ({data.rating?.count} avaliações)</p>
    </div>
  );
}
