"use client";

import { useEffect, useState } from "react";

type ContadorPersonalizadoProps = {
  title: string;
};

const PREFIXO_STORAGE = "likes_tech_";

export default function Contador({ title }: ContadorPersonalizadoProps) {
  const [likes, setLikes] = useState(0);

  // Ler do localStorage quando o componente monta
  useEffect(() => {
    if (typeof window === "undefined") return;

    const chave = PREFIXO_STORAGE + title;
    const guardado = window.localStorage.getItem(chave);

    if (guardado !== null) {
      setLikes(Number(guardado));
    }
  }, [title]);

  function incrementar() {
    setLikes((anterior) => {
      const novo = anterior + 1;

      if (typeof window !== "undefined") {
        const chave = PREFIXO_STORAGE + title;
        window.localStorage.setItem(chave, String(novo));
      }

      return novo;
    });
  }

  return (
    <button
      onClick={incrementar}
      className="mt-2 px-3 py-1 rounded-full bg-pink-500 text-white text-sm font-semibold hover:bg-pink-600 transition"
    >
      ❤️ {likes} like{likes === 1 ? "" : "s"}
    </button>
  );
}

/*
================================================================================
COMENTÁRIO — VISÃO GERAL COMPLETA DO PROJETO
================================================================================

Este projeto é uma aplicação Web desenvolvida com Next.js (App Router),
React, TypeScript, SWR e Tailwind CSS, que implementa uma loja online simples
(“DEISI Shop”) com as seguintes funcionalidades principais:

- Listagem de produtos obtidos a partir de uma API externa
- Pesquisa e ordenação de produtos
- Visualização do detalhe de um produto
- Carrinho de compras com controlo de quantidades
- Persistência do carrinho no localStorage
- Finalização de compra através de um endpoint da API
- Interface responsiva e moderna

------------------------------------------------------------------------------
1) NEXT.JS E CLIENT COMPONENTS
------------------------------------------------------------------------------

Todos os ficheiros começam com:

  'use client';

Isto indica ao Next.js (App Router) que o componente é um Client Component.
Client Components:
- São renderizados no browser
- Permitem usar hooks do React (useState, useEffect, useMemo, use)
- Permitem lidar com eventos (onClick, onChange, etc.)
- Permitem aceder a APIs do browser (localStorage, window, etc.)

Como a aplicação usa interatividade (carrinho, botões, inputs, fetch no client),
estes componentes precisam obrigatoriamente de ser Client Components.

------------------------------------------------------------------------------
2) TYPESCRIPT E TIPAGEM (Produto, Props, Segurança)
------------------------------------------------------------------------------

O projeto usa TypeScript para garantir segurança e clareza no código.

A interface Produto (importada de '@/models/interfaces') define a estrutura
dos dados vindos da API, por exemplo:
- id
- title
- price
- image
- category
- description
- rating (rate, count)

Vantagens:
- Evita erros de acesso a propriedades inexistentes
- Melhora o autocomplete e a leitura do código
- Torna os componentes mais previsíveis

Cada componente define também a sua interface de props, por exemplo:
- ProdutoDetalheProps
- ProdutoCardProps

Isto garante que cada componente recebe exactamente os dados de que precisa.

------------------------------------------------------------------------------
3) FETCH DE DADOS COM SWR
------------------------------------------------------------------------------

A listagem de produtos e o detalhe de produto usam a biblioteca SWR.

SWR fornece:
- Cache automático
- Estados de loading e erro
- Revalidação automática dos dados

É usado assim:
  const { data, error, isLoading } = useSWR(url, fetcher);

Onde:
- data → dados carregados da API
- error → erro ocorrido no fetch
- isLoading → indica se o pedido ainda está em progresso

A função fetcher:
- Usa fetch nativo
- Verifica res.ok
- Lança erros quando o HTTP falha
- Devolve JSON quando o pedido é bem-sucedido

Isto permite tratar facilmente:
- Loading (Spinner)
- Erros (ErrorBox)
- Sucesso (renderização dos componentes)

------------------------------------------------------------------------------
4) COMPONENTES PRINCIPAIS
------------------------------------------------------------------------------

A aplicação está organizada em componentes reutilizáveis:

● ProdutosPage
- Página principal da loja
- Mostra pesquisa, ordenação e lista de produtos
- Gere o carrinho
- Calcula o total
- Envia a compra para a API

● ProdutoCard
- Representação visual de um produto em formato “card”
- Usado tanto na lista de produtos como no carrinho
- Mostra imagem, categoria, título e preço
- Mostra botões diferentes consoante o contexto:
  - “+ info”
  - “Adicionar”
  - “Remover”

● ProdutoDetalhe
- Página de detalhe de um produto específico
- Mostra informação completa:
  - imagem
  - categoria
  - título
  - preço
  - descrição
  - rating

● PageShell
- Componente de layout
- Define header fixo, fundo e largura máxima
- Envolve todas as páginas para manter consistência visual

● Spinner
- Componente visual de carregamento

● ErrorBox
- Componente reutilizável para mostrar mensagens de erro

------------------------------------------------------------------------------
5) NAVEGAÇÃO COM NEXT/LINK
------------------------------------------------------------------------------

A navegação interna usa o componente Link do Next.js:

- Permite mudar de página sem recarregar o browser
- Mantém a aplicação rápida e fluida

Exemplos:
- /produtos → lista de produtos
- /produtos/[id] → detalhe do produto

------------------------------------------------------------------------------
6) ROTAS DINÂMICAS E NEXT 15 (use(params))
------------------------------------------------------------------------------

Na página de detalhe do produto, a rota é dinâmica:
  /produtos/[id]

No Next 15, params é uma Promise, por isso é usado:
  const { id } = use(params);

Depois:
- O id é convertido para número
- É validado (evita chamadas inválidas à API)
- É usado para montar o URL do fetch

------------------------------------------------------------------------------
7) GESTÃO DE ESTADO COM REACT HOOKS
------------------------------------------------------------------------------

useState:
- Pesquisa (search)
- Ordenação (order)
- Carrinho (cart)
- Dados do checkout (nome, cupão, estudante)
- Estados de compra (loading, erro, resposta)

useEffect:
- Carregar carrinho do localStorage ao iniciar
- Guardar carrinho no localStorage sempre que muda
- Filtrar e ordenar produtos quando search, order ou data mudam

useMemo:
- Cálculo do total do carrinho
- Evita recalcular o total a cada render desnecessário

use:
- Usado para resolver params (Promise) no Next 15

------------------------------------------------------------------------------
8) CARRINHO DE COMPRAS
------------------------------------------------------------------------------

O carrinho é um array de objetos do tipo:
  { produto: Produto, qty: number }

Funcionalidades:
- Adicionar produto
- Remover produto
- Aumentar/diminuir quantidade
- Remover automaticamente quando qty chega a 0
- Calcular total (price * qty)
- Persistir dados no localStorage

Persistência:
- localStorage é usado para manter o carrinho mesmo após refresh da página

------------------------------------------------------------------------------
9) FINALIZAÇÃO DA COMPRA
------------------------------------------------------------------------------

A compra é enviada para o endpoint:
  POST /buy/

O payload inclui:
- products: lista de IDs (repetidos conforme qty)
- student: boolean (desconto estudante)
- coupon: string
- name: string

Fluxo:
- Ativa loading
- Envia pedido
- Se sucesso:
  - Mostra resposta da API
  - Limpa carrinho
- Se erro:
  - Mostra mensagem de erro ao utilizador

------------------------------------------------------------------------------
10) IMAGENS COM NEXT/IMAGE
------------------------------------------------------------------------------

Todas as imagens usam o componente Image do Next.js:
- Otimização automática
- Lazy loading
- Melhor desempenho

Existe uma lógica para garantir que a imagem funciona:
- Se image começa com "http" → URL absoluta
- Caso contrário → concatena com IMAGE_BASE_URL

------------------------------------------------------------------------------
11) ESTILOS COM TAILWIND CSS
------------------------------------------------------------------------------

A interface usa Tailwind CSS:
- Classes utilitárias
- Layout responsivo
- Componentes consistentes
- Sem CSS tradicional separado

Exemplos:
- flex, grid, gap
- rounded, shadow, hover
- cores, tamanhos e tipografia

------------------------------------------------------------------------------
12) BOAS PRÁTICAS APLICADAS
------------------------------------------------------------------------------

- Componentes pequenos e reutilizáveis
- Separação clara de responsabilidades
- Tipagem forte com TypeScript
- Tratamento explícito de loading e erro
- Validação de dados antes de chamar a API
- Código legível e organizado
- UI consistente e responsiva

------------------------------------------------------------------------------
RESUMO FINAL
------------------------------------------------------------------------------

Este conjunto de códigos implementa uma aplicação completa de loja online
no frontend, usando tecnologias modernas do ecossistema React/Next.js.
O projeto demonstra domínio de:
- React Hooks
- Next.js App Router
- Fetch de dados com SWR
- Componentização
- Gestão de estado
- Tipagem com TypeScript
- UI moderna com Tailwind CSS

================================================================================
FIM DO COMENTÁRIO
================================================================================
*/

