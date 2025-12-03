"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";

async function fetcher(url: string) {
  const res = await fetch(url);
  return res.json();
}

export default function CategoriaDetalhes() {
  const { id } = useParams();

  const { data, error, isLoading } = useSWR(
    `https://deisishop.pythonanywhere.com/categories/${id}/products`,
    fetcher
  );

  if (isLoading) return <p>A carregar...</p>;
  if (error) return <p>Erro ao carregar produtos da categoria.</p>;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Produtos da Categoria
      </h1>

      <div className="grid grid-cols-2 gap-4">
        {data.map((p: any) => (
          <Link href={`/produtos/${p.id}`} key={p.id}>
            <div className="bg-white rounded-xl shadow p-3 flex flex-col items-center gap-2 hover:opacity-80">
              <Image
                src={p.image}
                width={120}
                height={120}
                alt={p.title}
              />
              <p>{p.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
