"use client";

import useSWR from "swr";
import Image from "next/image";
import type { Product } from "@/models/interfaces";

const API_URL = "https://deisishop.pythonanywhere.com/products";

async function fetcher(url: string): Promise<Product[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao carregar produtos");
  return res.json();
}

export default function ProdutosPage() {
  const { data, error, isLoading } = useSWR<Product[]>(API_URL, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0,
  });

  if (isLoading) return <p>A carregar...</p>;
  if (error) return <p>Erro ao carregar produtos.</p>;
  if (!data) return <p>Sem dados.</p>;

  return (
    <main className="p-4 bg-sky-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Produtos</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl shadow p-3 flex flex-col items-center"
          >
            <Image
              src={p.image}
              width={120}
              height={120}
              alt={p.title}
              className="rounded-md"
            />
            <p className="mt-2 font-semibold text-center">{p.title}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
