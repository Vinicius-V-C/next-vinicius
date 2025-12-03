"use client";

import useSWR from "swr";
import { Spinner } from "@heroui/react";
import type { Product } from "@/models/interfaces";

const API_URL = "https://deisishop.pythonanywhere.com/products";

// Função para ir buscar os produtos + tratamento de erros
async function fetcher(url: string): Promise<Product[]> {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Erro ao carregar produtos");
  }

  return res.json();
}

export default function ProdutosPage() {
  // useSWR devolve { data, error, isLoading }
  const { data, error, isLoading } = useSWR<Product[]>(API_URL, fetcher);

  // 4) Tratamento de loading → mostra spinner do HeroUI
  if (isLoading) {
    return (
      <main className="p-6 flex justify-center">
        <Spinner label="A carregar produtos..." />
      </main>
    );
  }

  // 4) Tratamento de erro
  if (error) {
    return (
      <main className="p-6">
        <p className="text-red-600">
          Ocorreu um erro ao carregar os produtos.
        </p>
      </main>
    );
  }

  // Se por algum motivo não houver dados
  if (!data) {
    return (
      <main className="p-6">
        <p>Sem dados.</p>
      </main>
    );
  }

  // 5) Testar se recebe os dados (consola)
  console.log("Produtos recebidos:", data);

  // Opcional: ver JSON na própria página
  // <pre>{JSON.stringify(data, null, 2)}</pre>

  // 6) Usar a variável data para iterar e mostrar só o nome (title)
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Produtos</h1>

      <ul className="list-disc list-inside">
        {data.map((produto) => (
          <li key={produto.id}>{produto.title}</li>
        ))}
      </ul>
    </main>
  );
}