'use client';
// Client Component (Next.js App Router)
// Permite usar eventos (onClick), navegação client-side, etc.

import Image from 'next/image';
// Componente Image do Next.js:
// - otimiza imagens
// - lazy loading automático
// - melhora performance

import Link from 'next/link';
// Link do Next.js para navegação interna sem recarregar a página

import type { Produto } from '@/models/interfaces';
// Tipo Produto (TypeScript):
// garante que o objeto "produto" tem todos os campos esperados

const IMAGE_BASE_URL = 'https://deisishop.pythonanywhere.com';
// URL base usada quando a imagem vem como caminho relativo

/**
 * Interface das props do ProdutoCard
 *
 * Este componente é reutilizável e pode funcionar em dois contextos:
 * 1) Lista de produtos → botão "Adicionar"
 * 2) Carrinho → botão "Remover"
 *
 * Por isso:
 * - onAddToCart e onRemoveFromCart são opcionais
 * - isInCart controla qual botão aparece
 */
interface ProdutoCardProps {
  produto: Produto;
  onAddToCart?: (produto: Produto) => void;
  onRemoveFromCart?: (produto: Produto) => void;
  isInCart?: boolean;
}

/**
 * ProdutoCard
 * Componente visual de um produto em formato "card".
 * Mostra:
 * - imagem
 * - categoria
 * - título
 * - preço
 * - botões de ação (+ info / adicionar / remover)
 */
export default function ProdutoCard({
  produto,
  onAddToCart,
  onRemoveFromCart,
  isInCart,
}: ProdutoCardProps) {
  /**
   * Construção do URL da imagem:
   * - se já for absoluto (http) → usar diretamente
   * - se for relativo → concatenar com IMAGE_BASE_URL
   */
  const imageUrl = produto.image.startsWith('http')
    ? produto.image
    : IMAGE_BASE_URL + produto.image;

  return (
    <article className="group rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {/* 
        Imagem do produto
        - centrada
        - fundo cinzento claro
        - efeito de zoom ao passar o rato (hover)
      */}
      <div className="flex justify-center bg-gray-50 rounded-t-2xl p-4">
        <Image
          src={imageUrl}                // URL final da imagem
          width={160}                   // largura fixa (obrigatório no next/image)
          height={160}                  // altura fixa (obrigatório no next/image)
          alt={produto.title}           // acessibilidade + SEO
          className="object-contain transition group-hover:scale-105"
        />
      </div>

      {/* Conteúdo textual e ações */}
      <div className="p-4 flex flex-col gap-2">
        {/* Categoria do produto */}
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {produto.category}
        </span>

        {/* Título do produto */}
        <h2 className="font-semibold text-sm leading-tight line-clamp-2">
          {produto.title}
        </h2>

        {/* Preço do produto */}
        <p className="font-bold text-lg text-gray-900">
          {produto.price} €
        </p>

        {/* Área de ações (botões) */}
        <div className="mt-3 flex gap-2">
          {/* 
            Botão "+ info"
            - obrigatório no enunciado
            - leva para a página de detalhe do produto
          */}
          <Link
            href={`/produtos/${produto.id}`}
            className="flex-1 text-center rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-100"
          >
            + info
          </Link>

          {/* 
            Botão "Adicionar"
            - só aparece se:
              - existir onAddToCart
              - o produto NÃO estiver no carrinho
          */}
          {onAddToCart && !isInCart && (
            <button
              onClick={() => onAddToCart(produto)}
              className="flex-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
            >
              Adicionar
            </button>
          )}

          {/* 
            Botão "Remover"
            - só aparece se:
              - existir onRemoveFromCart
              - o produto JÁ estiver no carrinho
          */}
          {onRemoveFromCart && isInCart && (
            <button
              onClick={() => onRemoveFromCart(produto)}
              className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Remover
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
