'use client';

import useSWR from 'swr';
import { usePathname } from 'next/navigation';
import type { Produto } from '@/models/interfaces';
import ProdutoDetalhe from '@/components/produtosDetalhes/produtoDetalhes';
import Link from 'next/link';

const API_URL = 'https://deisishop.pythonanywhere.com/products/';

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const textoErro = await res.text();
    console.error('Erro na API DEISI Shop:', res.status, res.statusText, textoErro);
    throw new Error(`Erro: ${res.status} ${res.statusText}`);
  }

  return res.json();
};

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">DEISI Shop</p>
            <h1 className="text-lg font-semibold leading-tight">Detalhe do produto</h1>
          </div>

          <Link
            href="/produtos"
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Voltar à lista
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

function ErrorBox({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <h2 className="font-semibold text-red-800">{title}</h2>
      <p className="mt-1 text-sm text-red-700">{message}</p>
    </div>
  );
}

function LoadingBox() {
  return (
    <div className="grid place-items-center py-16">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
      <p className="mt-3 text-sm text-gray-500">A carregar produto...</p>
    </div>
  );
}

export default function ProdutoPage() {
  const pathname = usePathname();
  const partes = pathname.split('/').filter(Boolean);
  const lastSegment = partes[partes.length - 1];

  const idNumber = Number(lastSegment);

  if (!lastSegment || Number.isNaN(idNumber)) {
    return (
      <PageShell>
        <ErrorBox
          title="ID inválido"
          message={`ID inválido na rota: ${String(lastSegment)}`}
        />
      </PageShell>
    );
  }

  const url = `${API_URL}${idNumber}`;
  console.log('URL do detalhe:', url);

  const { data, error, isLoading } = useSWR<Produto>(url, fetcher);

  if (error) {
    return (
      <PageShell>
        <ErrorBox
          title="Erro ao carregar produto"
          message={error.message}
        />
      </PageShell>
    );
  }

  if (isLoading || !data) {
    return (
      <PageShell>
        <LoadingBox />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
        <ProdutoDetalhe produto={data} />
      </section>

      <div className="mt-6 flex justify-center">
        <Link
          href="/produtos"
          className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Voltar à lista de produtos
        </Link>
      </div>
    </PageShell>
  );
}
