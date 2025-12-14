'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Produto } from '@/models/interfaces';

const IMAGE_BASE_URL = 'https://deisishop.pythonanywhere.com';

interface ProdutoCardProps {
  produto: Produto;
  onAddToCart?: (produto: Produto) => void;
  onRemoveFromCart?: (produto: Produto) => void;
  isInCart?: boolean;
}

export default function ProdutoCard({
  produto,
  onAddToCart,
  onRemoveFromCart,
  isInCart,
}: ProdutoCardProps) {
  const imageUrl = produto.image.startsWith('http')
    ? produto.image
    : IMAGE_BASE_URL + produto.image;

  const rating = produto.rating?.rate ?? 0;
  const estrelasInteiras = Math.floor(rating);
  const meiaEstrela = rating % 1 >= 0.5;
  const maxEstrelas = 5;

  const estrelas =
    '⭐'.repeat(estrelasInteiras) +
    (meiaEstrela ? '✰' : '') +
    '☆'.repeat(maxEstrelas - estrelasInteiras - (meiaEstrela ? 1 : 0));

  return (
    <article className="group rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {/* imagem */}
      <div className="flex justify-center bg-gray-50 rounded-t-2xl p-4">
        <Image
          src={imageUrl}
          width={160}
          height={160}
          alt={produto.title}
          className="object-contain transition group-hover:scale-105"
        />
      </div>

      {/* conteúdo */}
      <div className="p-4 flex flex-col gap-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {produto.category}
        </span>

        <h2 className="font-semibold text-sm leading-tight line-clamp-2">
          {produto.title}
        </h2>

        <p className="font-bold text-lg text-gray-900">
          {produto.price} €
        </p>

        {/* rating */}
        <div className="text-sm text-yellow-500">
          {estrelas}
          <span className="text-gray-500 text-xs ml-2">
            ({produto.rating.rate}) · {produto.rating.count}
          </span>
        </div>

        {/* ações */}
        <div className="mt-3 flex gap-2">
          <Link
            href={`/produtos/${produto.id}`}
            className="flex-1 text-center rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-100"
          >
            Ver detalhes
          </Link>

          {onAddToCart && !isInCart && (
            <button
              onClick={() => onAddToCart(produto)}
              className="flex-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
            >
              Adicionar
            </button>
          )}

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
