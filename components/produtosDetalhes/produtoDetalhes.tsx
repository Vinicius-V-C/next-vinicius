'use client';
// Indica ao Next.js (App Router) que este componente é um Client Component.
// Isto permite usar hooks, eventos, estados, etc.
// Mesmo não usando hooks aqui, o componente é renderizado no client.

import Image from 'next/image';
// Componente Image do Next.js:
// - otimiza imagens automaticamente
// - faz lazy loading
// - melhora performance e SEO

import type { Produto } from '@/models/interfaces';
// Importação do tipo Produto (TypeScript).
// Garante que o objeto "produto" tem os campos esperados
// (ex: id, title, price, image, category, rating, etc.)

const IMAGE_BASE_URL = 'https://deisishop.pythonanywhere.com';
// URL base da API para imagens.
// Usada quando a imagem vem como caminho relativo (ex: /media/img.png)

/**
 * Interface das props do componente ProdutoDetalhe
 * Este componente recebe apenas:
 * - produto: um objeto do tipo Produto
 */
interface ProdutoDetalheProps {
  produto: Produto;
}

/**
 * ProdutoDetalhe
 * Componente responsável por mostrar o detalhe completo de um produto:
 * - imagem
 * - categoria
 * - título
 * - preço
 * - descrição
 * - rating
 */
export default function ProdutoDetalhe({ produto }: ProdutoDetalheProps) {
  /**
   * Construção do URL da imagem:
   * - Se a imagem já começa com "http", é uma URL absoluta → usar diretamente
   * - Caso contrário, é um caminho relativo → concatenar com IMAGE_BASE_URL
   *
   * Isto evita imagens partidas e torna o componente reutilizável.
   */
  const imageUrl = produto.image.startsWith('http')
    ? produto.image
    : IMAGE_BASE_URL + produto.image;

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border bg-white shadow-sm">
      {/* 
        Topo com imagem do produto 
        - fundo cinzento claro
        - imagem centrada
      */}
      <div className="bg-gray-50 p-6 flex justify-center">
        <Image
          src={imageUrl}          // URL final da imagem
          width={260}             // largura fixa (necessária no next/image)
          height={260}            // altura fixa (necessária no next/image)
          alt={produto.title}     // texto alternativo (acessibilidade/SEO)
          className="object-contain" // garante que a imagem não é cortada
        />
      </div>

      {/* Conteúdo textual do produto */}
      <div className="p-6">
        {/* Categoria do produto */}
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {produto.category}
          </span>
        </div>

        {/* Título do produto */}
        <h1 className="mb-2 text-center text-2xl font-semibold leading-tight">
          {produto.title}
        </h1>

        {/* Preço do produto */}
        <p className="mb-6 text-center text-3xl font-bold text-gray-900">
          {produto.price} €
        </p>

        {/* Descrição do produto */}
        <div className="mx-auto mb-6 max-w-2xl text-center text-gray-700">
          {produto.description}
        </div>

        {/* Rating (avaliação) */}
        <div className="flex justify-center">
          <div className="rounded-xl bg-gray-100 px-4 py-2 text-sm">
            {/* Nota média */}
            <strong>Rating:</strong> {produto.rating.rate} ⭐

            {/* Número de avaliações */}
            <span className="ml-2 text-gray-600">
              ({produto.rating.count} avaliações)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
