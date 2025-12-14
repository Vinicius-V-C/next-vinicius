'use client';
// Next.js (App Router): este ficheiro é um Client Component.
// Permite usar hooks do React, fazer fetch no client, usar SWR, etc.

import { use } from 'react';
// Hook especial do React (usado no Next 15 em alguns cenários):
// Aqui serve para "desembrulhar" (unwrap) uma Promise, neste caso params.

import useSWR from 'swr';
// SWR: busca dados com cache, revalidação e estados (isLoading/error/data).

import Link from 'next/link';
// Link do Next.js para navegação interna sem recarregar a página.

import type { Produto } from '@/models/interfaces';
// Tipo Produto (TypeScript): garante que "data" tem a estrutura esperada.

import ProdutoDetalhe from '@/components/produtosDetalhes/produtoDetalhes';
// Componente que renderiza o detalhe do produto (layout/infos/botões, etc).

const API_URL = 'https://deisishop.pythonanywhere.com/products/';
// Endpoint base da API para produtos. O detalhe vai ser: `${API_URL}${id}`

/**
 * fetcher
 * Função usada pelo SWR para buscar dados.
 * Boas práticas que estão aqui:
 * - verifica res.ok
 * - em caso de erro, lê o corpo como texto (muitas APIs devolvem mensagem útil)
 * - faz console.error (ajuda debugging)
 * - lança Error para o SWR ativar a UI de erro
 */
const fetcher = async (url: string) => {
  const res = await fetch(url);

  // Se o HTTP não for OK (ex: 404, 500...)
  if (!res.ok) {
    // Lê o corpo da resposta como texto para ter mais detalhe no console
    const textoErro = await res.text();

    // Log para debugging (não aparece ao utilizador final, só no console)
    console.error('Erro na API DEISI Shop:', res.status, res.statusText, textoErro);

    // Lança erro para o SWR/React tratar
    throw new Error(`Erro: ${res.status} ${res.statusText}`);
  }

  // Se está OK, devolve o JSON (o SWR mete isto em data)
  return res.json();
};

/**
 * Spinner
 * Componente visual de carregamento.
 * - Usa Tailwind para criar uma “rodinha” a rodar (animate-spin).
 */
function Spinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * ErrorBox
 * Componente reutilizável para mostrar erros de forma consistente.
 * Recebe:
 * - title: título do erro
 * - message: detalhe/explicação (normalmente error.message)
 */
function ErrorBox({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <h2 className="font-semibold text-red-800">{title}</h2>
      <p className="mt-1 text-sm text-red-700">{message}</p>
    </div>
  );
}

/**
 * PageShell
 * “Layout” da página de detalhe:
 * - fundo cinzento
 * - header sticky com título e botão "Voltar"
 * - main com largura máxima (max-w-5xl)
 *
 * children: tudo o que a página colocar “por dentro” do layout
 */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">DEISI Shop</p>
            <h1 className="text-lg font-semibold leading-tight">Detalhe do produto</h1>
          </div>

          {/* Link de navegação para voltar para /produtos */}
          <Link
            href="/produtos"
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Voltar à lista
          </Link>
        </div>
      </header>

      {/* Conteúdo principal da página */}
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

/**
 * ProdutoPage
 * Página de detalhe: /produtos/[id]
 *
 * Atenção (Next 15):
 * - params vem como Promise
 * - por isso é necessário usar: const { id } = use(params)
 */
export default function ProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  /**
   * Next 15: params é Promise → precisa de use(params)
   * Isto “resolve” a Promise e devolve o objeto { id }
   */
  const { id } = use(params);

  // Converte id (string) para número, porque a API espera um ID numérico.
  const idNumber = Number(id);

  /**
   * Validação do id:
   * - se id não existir
   * - ou se não for número válido (NaN)
   * mostramos um erro amigável na UI, em vez de chamar a API.
   */
  if (!id || Number.isNaN(idNumber)) {
    return (
      <PageShell>
        <ErrorBox
          title="ID inválido"
          message={`ID inválido na rota: ${String(id)}`}
        />
      </PageShell>
    );
  }

  /**
   * Monta o URL final do detalhe, ex:
   * https://deisishop.pythonanywhere.com/products/5
   */
  const url = `${API_URL}${idNumber}`;

  /**
   * SWR:
   * - data: produto carregado
   * - error: erro no fetch (404, 500, etc.)
   * - isLoading: true enquanto está a carregar
   */
  const { data, error, isLoading } = useSWR<Produto>(url, fetcher);

  /**
   * Se houve erro no fetch:
   * - mostramos ErrorBox com a mensagem
   */
  if (error) {
    return (
      <PageShell>
        <ErrorBox title="Erro ao carregar produto" message={error.message} />
      </PageShell>
    );
  }

  /**
   * Enquanto carrega (ou se data ainda não existe):
   * - mostramos o Spinner
   *
   * Nota: aqui estás a usar (isLoading || !data) para garantir que nunca renderizas
   * o ProdutoDetalhe com data undefined.
   */
  if (isLoading || !data) {
    return (
      <PageShell>
        <Spinner />
      </PageShell>
    );
  }

  /**
   * Render final (sucesso):
   * - mostra o ProdutoDetalhe dentro de um "card"
   * - mostra um botão/link para voltar à lista
   */
  return (
    <PageShell>
      <section className="rounded-2xl border bg-white p-4 sm:p-6 shadow-sm">
        {/* Passa o produto carregado para o componente de detalhe */}
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
