"use client";

import useSWR from "swr";
import Image from "next/image";
import type { Product } from "@/models/interfaces";

const API_URL = "https://deisishop.pythonanywhere.com/products";


const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Erro: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

export default function ProdutosPage() {
  const { data, error, isLoading } = useSWR<Product[]>(API_URL, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0,
  });

  if (isLoading)
    return (
      <main className="min-h-screen bg-sky-200 flex items-center justify-center">
        <p>A carregar...</p>
      </main>
    );

  if (error)
    return (
      <main className="min-h-screen bg-sky-200 p-4">
        <h1 className="text-3xl font-bold mb-4">Produtos</h1>
        <p className="text-red-700">
          {error.message}
          Ocorreu um erro ao carregar os produtos.</p>
      </main>
    );

  if (!data)
    return (
      <main className="min-h-screen bg-sky-200 p-4">
        <h1 className="text-3xl font-bold mb-4">Produtos</h1>
        <p>Sem dados disponíveis.</p>
      </main>
    );

  return (
    <main className="p-4 bg-sky-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Produtos</h1>

      <div className="grid grid-cols-1 gap-6">
        {data.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center space-y-4"
          >
            <Image
              src={p.image}
              width={220}
              height={220}
              alt={p.title}
              className="rounded-md object-contain"
            />

            <h2 className="text-xl font-semibold">{p.title}</h2>
            <p className="text-sm text-gray-500 italic">{p.category}</p>
            <p className="text-2xl font-bold">{p.price.toFixed(2)} €</p>

            <p className="text-base text-gray-700 leading-relaxed">
              {p.description}
            </p>

            <p className="text-base font-medium text-gray-800">
              ⭐ {p.rating?.rate ?? "N/A"}{" "}
              <span className="text-gray-500">
                ({p.rating?.count ?? 0} avaliações)
              </span>
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
