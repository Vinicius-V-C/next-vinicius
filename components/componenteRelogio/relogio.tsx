"use client";

import { useEffect, useState } from "react";

export default function Relogio() {
  const [hora, setHora] = useState<string>(""); // começa vazio e igual no server e no client

  useEffect(() => {
    function atualizarHora() {
      setHora(new Date().toLocaleTimeString("pt-PT"));
    }

    // atualiza logo ao montar
    atualizarHora();

    // e depois de segundo em segundo
    const id = setInterval(atualizarHora, 1000);

    return () => clearInterval(id);
  }, []);

  return <span>{hora || "--:--:--"}</span>;
}


/*
================================================================================
MEGA COMENTÁRIO — COMO IMPLEMENTAR CADA PARTE DO PROJETO (PASSO A PASSO)
================================================================================

Este comentário explica, de forma prática e sequencial, COMO IMPLEMENTAR
cada uma das funcionalidades e tecnologias usadas nos códigos apresentados.
Não é teoria: é um guia de implementação.

------------------------------------------------------------------------------
1) CRIAR O PROJETO NEXT.JS (BASE)
------------------------------------------------------------------------------

1. Criar o projeto com Next.js, TypeScript e Tailwind:
   npx create-next-app@latest deisishop-front --ts --tailwind --app

2. Entrar na pasta do projeto:
   cd deisishop-front

3. Iniciar o servidor:
   npm run dev

4. Confirmar que existe a pasta "app/" (App Router).

------------------------------------------------------------------------------
2) USAR 'use client' NOS COMPONENTES
------------------------------------------------------------------------------

Sempre que um ficheiro:
- usa hooks (useState, useEffect, useMemo, use)
- usa eventos (onClick, onChange)
- usa localStorage
- usa SWR no client

DEVE começar com:
  'use client';

Caso contrário, o Next.js assume que é Server Component e o código falha.

------------------------------------------------------------------------------
3) DEFINIR O MODELO DE DADOS (INTERFACE Produto)
------------------------------------------------------------------------------

1. Criar o ficheiro:
   src/models/interfaces.ts

2. Definir a interface Produto de acordo com a API:

   export interface Produto {
     id: number;
     title: string;
     price: number;
     description: string;
     category: string;
     image: string;
     rating: {
       rate: number;
       count: number;
     };
   }

3. Importar esta interface em todos os componentes que usam produtos:
   import type { Produto } from '@/models/interfaces';

Isto garante segurança de tipos e evita erros de acesso a propriedades.

------------------------------------------------------------------------------
4) INSTALAR E USAR SWR PARA FETCH DE DADOS
------------------------------------------------------------------------------

1. Instalar a biblioteca:
   npm install swr

2. Criar uma função fetcher:
   - usa fetch
   - verifica res.ok
   - lança erro se falhar
   - devolve JSON se tiver sucesso

3. Usar no componente:
   const { data, error, isLoading } = useSWR<Produto[]>(url, fetcher);

4. Tratar sempre 3 estados:
   - isLoading → mostrar Spinner
   - error → mostrar ErrorBox
   - data → renderizar UI

------------------------------------------------------------------------------
5) CRIAR COMPONENTES DE APOIO (Spinner e ErrorBox)
------------------------------------------------------------------------------

Spinner:
- componente simples de carregamento
- usado sempre que isLoading === true

ErrorBox:
- componente reutilizável para erros
- recebe title e message
- evita repetir código de erro em várias páginas

------------------------------------------------------------------------------
6) IMPLEMENTAR A PÁGINA DE LISTA DE PRODUTOS
------------------------------------------------------------------------------

1. Criar o ficheiro:
   app/produtos/page.tsx

2. Fazer fetch da lista de produtos com SWR.

3. Criar estados com useState:
   - search (texto de pesquisa)
   - order (tipo de ordenação)
   - cart (carrinho)
   - filteredData (lista final para mostrar)

4. Usar useEffect para:
   - filtrar produtos pelo nome
   - ordenar produtos (nome/preço)

5. Renderizar produtos usando map() e o componente ProdutoCard.

------------------------------------------------------------------------------
7) IMPLEMENTAR PESQUISA E ORDENAÇÃO
------------------------------------------------------------------------------

1. Criar input de pesquisa:
   - ligado ao estado search
   - onChange atualiza o estado

2. Criar select de ordenação:
   - ligado ao estado order

3. No useEffect:
   - filtrar produtos por title.includes(search)
   - ordenar com sort() conforme order

------------------------------------------------------------------------------
8) IMPLEMENTAR O COMPONENTE ProdutoCard
------------------------------------------------------------------------------

1. Criar:
   src/components/ProdutosCard/produtoCard.tsx

2. Props do componente:
   - produto (obrigatório)
   - onAddToCart (opcional)
   - onRemoveFromCart (opcional)
   - isInCart (boolean)

3. Mostrar sempre:
   - imagem
   - categoria
   - título
   - preço
   - botão "+ info"

4. Mostrar botões condicionalmente:
   - "Adicionar" se NÃO estiver no carrinho
   - "Remover" se JÁ estiver no carrinho

Isto torna o componente reutilizável na lista e no carrinho.

------------------------------------------------------------------------------
9) IMPLEMENTAR O CARRINHO DE COMPRAS
------------------------------------------------------------------------------

1. Definir o tipo:
   type CartItem = { produto: Produto; qty: number };

2. Criar estado:
   const [cart, setCart] = useState<CartItem[]>([]);

3. Implementar:
   - adicionar produto (incrementa qty se já existir)
   - remover produto (decrementa qty ou remove)

4. Calcular o total com useMemo:
   - soma price * qty
   - evita cálculos desnecessários

------------------------------------------------------------------------------
10) PERSISTIR O CARRINHO COM localStorage
------------------------------------------------------------------------------

1. Ao iniciar a página:
   - ler localStorage
   - fazer JSON.parse
   - validar se é array
   - colocar no estado cart

2. Sempre que cart muda:
   - guardar no localStorage com JSON.stringify

Isto garante que o carrinho não desaparece ao recarregar a página.

------------------------------------------------------------------------------
11) IMPLEMENTAR A PÁGINA DE DETALHE DO PRODUTO
------------------------------------------------------------------------------

1. Criar rota dinâmica:
   app/produtos/[id]/page.tsx

2. Obter o id da rota:
   - no Next 15, params é Promise
   - usar: const { id } = use(params)

3. Validar o id:
   - converter para Number
   - verificar se é NaN

4. Fazer fetch do produto específico com SWR.

------------------------------------------------------------------------------
12) IMPLEMENTAR O COMPONENTE ProdutoDetalhe
------------------------------------------------------------------------------

1. Criar:
   src/components/produtosDetalhes/produtoDetalhes.tsx

2. Recebe apenas:
   - produto: Produto

3. Mostrar:
   - imagem
   - categoria
   - título
   - preço
   - descrição
   - rating

4. Corrigir imagens:
   - se image começa com "http", usar direto
   - senão, concatenar com IMAGE_BASE_URL

------------------------------------------------------------------------------
13) USAR next/image E next/link
------------------------------------------------------------------------------

next/image:
- melhora performance
- exige width e height
- faz lazy loading

next/link:
- navegação interna sem reload
- usado para:
  - ir para detalhe do produto
  - voltar à lista

------------------------------------------------------------------------------
14) IMPLEMENTAR FINALIZAÇÃO DA COMPRA
------------------------------------------------------------------------------

1. Criar função buy():
   - validar se carrinho não está vazio

2. Criar lista de IDs repetidos conforme qty:
   - usar flatMap + Array.from

3. Enviar POST para /buy/ com:
   - products
   - student
   - coupon
   - name

4. Tratar resposta:
   - sucesso → limpar carrinho
   - erro → mostrar mensagem

------------------------------------------------------------------------------
15) USAR PageShell PARA LAYOUT
------------------------------------------------------------------------------

1. Criar componente PageShell:
   - header fixo
   - main com largura máxima
   - children para conteúdo dinâmico

2. Envolver todas as páginas com PageShell.

Isto garante consistência visual.

------------------------------------------------------------------------------
16) EVITAR ERROS COM TSX
------------------------------------------------------------------------------

REGRA FUNDAMENTAL:
- Qualquer ficheiro com JSX (<div>, <span>, etc.)
  TEM de ser .tsx

Caso contrário ocorre erro:
  "Cannot find name 'span'"

------------------------------------------------------------------------------
RESUMO FINAL
------------------------------------------------------------------------------

A implementação segue uma ordem lógica:
1) Estrutura base do projeto
2) Tipagem dos dados
3) Fetch com SWR
4) Componentes reutilizáveis
5) Gestão de estado
6) Persistência
7) Navegação
8) Compra

Seguindo estes passos, o projeto funciona corretamente,
é escalável e cumpre boas práticas de React e Next.js.

================================================================================
FIM DO COMENTÁRIO
================================================================================
*/
