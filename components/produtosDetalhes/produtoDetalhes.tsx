'use client';

import Image from 'next/image';
import type { Produto } from '@/models/interfaces';

const IMAGE_BASE_URL = 'https://deisishop.pythonanywhere.com';

interface ProdutoDetalheProps {
  produto: Produto;
}

export default function ProdutoDetalhe({ produto }: ProdutoDetalheProps) {
  const imageUrl = produto.image.startsWith('http')
    ? produto.image
    : IMAGE_BASE_URL + produto.image;

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border bg-white shadow-sm">
      {/* topo com imagem */}
      <div className="bg-gray-50 p-6 flex justify-center">
        <Image
          src={imageUrl}
          width={260}
          height={260}
          alt={produto.title}
          className="object-contain"
        />
      </div>

      {/* conteúdo */}
      <div className="p-6">
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {produto.category}
          </span>
        </div>

        <h1 className="mb-2 text-center text-2xl font-semibold leading-tight">
          {produto.title}
        </h1>

        <p className="mb-6 text-center text-3xl font-bold text-gray-900">
          {produto.price} €
        </p>

        <div className="mx-auto mb-6 max-w-2xl text-center text-gray-700">
          {produto.description}
        </div>

        <div className="flex justify-center">
          <div className="rounded-xl bg-gray-100 px-4 py-2 text-sm">
            <strong>Rating:</strong> {produto.rating.rate} ⭐
            <span className="ml-2 text-gray-600">
              ({produto.rating.count} avaliações)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
