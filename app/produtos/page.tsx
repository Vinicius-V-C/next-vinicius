'use client'; 
// Next.js (App Router): indica que este ficheiro é um "Client Component".
// Ou seja, pode usar hooks (useState/useEffect), localStorage, eventos, etc.

import useSWR from 'swr';
// SWR: biblioteca para buscar dados com cache, revalidação, estados (loading/error), etc.

import { useEffect, useMemo, useState } from 'react';
// Hooks do React:
// - useState: estados locais
// - useEffect: efeitos (executa código quando algo muda / quando monta)
// - useMemo: memoriza cálculos pesados para não recalcular sempre

import type { Produto } from '@/models/interfaces';
// Tipo/Interface do produto (TypeScript): define os campos esperados (id, title, price, ...)

import ProdutoCard from '@/components/ProdutosCard/produtoCard';
// Componente de UI que mostra um produto (e botões: adicionar/remover, conforme props)

const API_URL = 'https://deisishop.pythonanywhere.com/products/';
// Endpoint para ir buscar a lista de produtos

const CART_KEY = 'cart';
// Chave usada no localStorage para guardar o carrinho

type CartItem = { produto: Produto; qty: number };
// Cada item do carrinho: o "produto" e a "qty" (quantidade)

/**
 * fetcher
 * Função padrão do SWR: recebe um URL e devolve dados (aqui: Produto[])
 * Regras:
 * - Se HTTP não for OK => lança erro com mensagem adequada
 * - Se o JSON não for uma lista => lança erro (proteção extra)
 */
async function fetcher(url: string): Promise<Produto[]> {
  // Faz o pedido HTTP
  const res = await fetch(url);

  // Se a resposta não for 200-299, tentamos extrair uma mensagem do servidor
  if (!res.ok) {
    let msg = `Erro HTTP ${res.status}`;

    try {
      // Tentamos ler JSON para ver se existe data.message
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {
      // Se não for JSON, ignoramos e usamos msg padrão
    }

    // Lançamos erro para o SWR/React mostrar na UI
    throw new Error(msg);
  }

  // Se chegou aqui, a resposta é OK => ler o JSON
  const data = await res.json();

  // Validação: a API deve devolver um array (lista)
  if (!Array.isArray(data)) {
    throw new Error('Resposta inválida da API: não é uma lista de produtos.');
  }

  // Garantimos para TypeScript que isto é Produto[]
  return data as Produto[];
}

/**
 * Spinner
 * Componente simples de loading (carregamento)
 * - Mostra uma bolinha a girar + texto
 * - Inclui CSS dentro do próprio componente (style jsx)
 */
function Spinner() {
  return (
    <div className="center">
      <div className="spinner" />
      <p className="muted">A carregar produtos...</p>

      <style jsx>{`
        .center {
          min-height: 55vh;
          display: grid;
          place-items: center;
          gap: 12px;
        }
        .spinner {
          width: 44px;
          height: 44px;
          border: 4px solid rgba(0, 0, 0, 0.12);
          border-top-color: rgba(0, 0, 0, 0.7);
          border-radius: 999px;
          animation: spin 0.9s linear infinite;
        }
        .muted {
          color: rgba(0, 0, 0, 0.6);
          margin: 0;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * ProdutosPage
 * Página principal do catálogo + carrinho + checkout
 */
export default function ProdutosPage() {
  /**
   * SWR:
   * - data: lista de produtos (quando chega)
   * - error: erro se o fetch falhar
   * - isLoading: true enquanto está a carregar
   */
  const { data, error, isLoading } = useSWR<Produto[]>(API_URL, fetcher);

  // texto de pesquisa
  const [search, setSearch] = useState('');

  // lista filtrada/ordenada que vamos mostrar no ecrã
  const [filteredData, setFilteredData] = useState<Produto[]>([]);

  // ordem selecionada (nome asc por defeito)
  const [order, setOrder] = useState('name-asc');

  // carrinho (lista de CartItem)
  const [cart, setCart] = useState<CartItem[]>([]);

  // checkout: estudante, cupão e nome
  const [isStudent, setIsStudent] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [name, setName] = useState('');

  // Resposta/erro do endpoint /buy/
  const [buyResponse, setBuyResponse] = useState<any>(null);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buyLoading, setBuyLoading] = useState(false);

  /**
   * useEffect #1: carregar carrinho do localStorage quando a página abre (monta)
   * - corre 1 vez (array de dependências vazio [])
   * - se existir JSON válido e for um array => coloca no state
   */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setCart(parsed as CartItem[]);
    } catch {
      // Se houver erro (JSON inválido, etc.), ignoramos e começamos com carrinho vazio
    }
  }, []);

  /**
   * useEffect #2: sempre que "cart" muda, guardamos no localStorage
   * - isto dá persistência: se recarregar a página, o carrinho não desaparece
   */
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // Se localStorage falhar (modo privado, quota, etc.), ignoramos
    }
  }, [cart]);

  /**
   * useEffect #3: filtrar + ordenar quando:
   * - search muda
   * - order muda
   * - data (produtos) muda (quando a API responde)
   */
  useEffect(() => {
    // Se ainda não há data, não há lista para filtrar
    if (!data) {
      setFilteredData([]);
      return;
    }

    // Normalizamos para minúsculas para pesquisa case-insensitive
    const termo = search.toLowerCase();

    // Filtramos por título
    const lista = data.filter((p) => p.title.toLowerCase().includes(termo));

    // Copiamos para não alterar o array original
    const ordenada = [...lista];

    // Aplicamos ordenação conforme a seleção
    switch (order) {
      case 'name-asc':
        ordenada.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        ordenada.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'price-asc':
        ordenada.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        ordenada.sort((a, b) => b.price - a.price);
        break;
    }

    // Atualizamos o estado que será usado no render
    setFilteredData(ordenada);
  }, [search, order, data]);

  /**
   * isInCart
   * verifica se um produto já está no carrinho (por id)
   * Usado para, por exemplo, esconder o botão "Adicionar" no card.
   */
  const isInCart = (produto: Produto) =>
    cart.some((i) => i.produto.id === produto.id);

  /**
   * handleAddToCart
   * adiciona um produto ao carrinho
   * - se já existir, aumenta qty
   * - senão, adiciona com qty=1
   *
   * Nota: usa setCart(prev => ...) para garantir que trabalha com o estado mais recente.
   */
  const handleAddToCart = (produto: Produto) => {
    setCart((prev) => {
      // Procuramos se o produto já existe
      const idx = prev.findIndex((i) => i.produto.id === produto.id);

      // Se existe, aumentamos a quantidade
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }

      // Se não existe, adicionamos novo item
      return [...prev, { produto, qty: 1 }];
    });
  };

  /**
   * handleRemoveFromCart
   * remove 1 unidade do produto:
   * - se qty <= 1 => remove o item do carrinho
   * - senão => decrementa qty
   */
  const handleRemoveFromCart = (produto: Produto) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.produto.id === produto.id);
      if (idx === -1) return prev;

      const item = prev[idx];

      // Se estava com 1 unidade, remover completamente
      if (item.qty <= 1) {
        return prev.filter((i) => i.produto.id !== produto.id);
      }

      // Caso contrário, reduzir a quantidade
      const copy = [...prev];
      copy[idx] = { ...item, qty: item.qty - 1 };
      return copy;
    });
  };

  /**
   * total
   * cálculo do total do carrinho
   * useMemo evita recalcular a cada render (só recalcula quando cart muda)
   */
  const total = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + (Number(item.produto.price) || 0) * item.qty,
      0
    );
  }, [cart]);

  /**
   * buy
   * finaliza a compra:
   * - não faz nada se carrinho estiver vazio
   * - cria um array de IDs repetidos conforme qty (garante quantidades)
   * - envia POST para /buy/
   * - se OK: guarda resposta e limpa carrinho
   * - se erro: guarda erro
   */
  const buy = async () => {
    if (cart.length === 0) return;

    setBuyLoading(true);
    setBuyError(null);
    setBuyResponse(null);

    // ids repetidos conforme qty (ex: qty=3 => [id, id, id])
    const productIds = cart.flatMap((item) =>
      Array.from({ length: item.qty }, () => item.produto.id)
    );

    try {
      const response = await fetch('https://deisishop.pythonanywhere.com/buy/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products: productIds,
          student: isStudent,
          coupon: coupon,
          name: name,
        }),
      });

      // Lemos como texto para conseguir mostrar erro bruto do servidor
      const text = await response.text();

      // Se falhou, lançamos erro com o texto devolvido
      if (!response.ok) throw new Error(text || response.statusText);

      // Se correu bem, o servidor devolve JSON em texto => parse
      setBuyResponse(JSON.parse(text));

      // Limpamos carrinho após compra bem-sucedida
      setCart([]);
    } catch (err: any) {
      setBuyError(err?.message ?? 'Erro ao comprar');
    } finally {
      setBuyLoading(false);
    }
  };

  /**
   * Renderizações condicionais:
   * - loading => spinner
   * - error => mensagem + botão recarregar
   * - data vazia => "sem produtos"
   */
  if (isLoading) return <PageShell><Spinner /></PageShell>;

  if (error) {
    return (
      <PageShell>
        <div className="notice error">
          <div>
            <h2>Não foi possível carregar os produtos</h2>
            <p className="muted">{error.message}</p>
          </div>

          {/* Recarrega a página para tentar novamente */}
          <button className="btn" onClick={() => location.reload()}>
            Tentar novamente
          </button>
        </div>

        <style jsx>{`
          .notice {
            margin-top: 18px;
            border-radius: 16px;
            padding: 16px;
            display: flex;
            gap: 16px;
            justify-content: space-between;
            align-items: center;
            border: 1px solid rgba(0, 0, 0, 0.1);
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(8px);
          }
          .error {
            border-color: rgba(220, 20, 60, 0.25);
            background: rgba(220, 20, 60, 0.06);
          }
          h2 {
            margin: 0 0 6px 0;
            font-size: 18px;
          }
          .muted {
            margin: 0;
            color: rgba(0, 0, 0, 0.6);
          }
          .btn {
            padding: 10px 14px;
            border-radius: 12px;
            border: 1px solid rgba(0, 0, 0, 0.15);
            background: white;
            cursor: pointer;
            font-weight: 600;
          }
          .btn:hover {
            border-color: rgba(0, 0, 0, 0.25);
          }
        `}</style>
      </PageShell>
    );
  }

  // Se data não existe ou veio vazia
  if (!data || data.length === 0) {
    return (
      <PageShell>
        <div className="empty">
          <h2>Sem produtos</h2>
          <p className="muted">A API não devolveu produtos para mostrar.</p>
        </div>

        <style jsx>{`
          .empty {
            margin-top: 18px;
            padding: 22px;
            border-radius: 16px;
            border: 1px dashed rgba(0, 0, 0, 0.2);
            background: rgba(255, 255, 255, 0.7);
          }
          .muted {
            margin: 6px 0 0 0;
            color: rgba(0, 0, 0, 0.6);
          }
          h2 {
            margin: 0;
          }
        `}</style>
      </PageShell>
    );
  }

  /**
   * Render principal:
   * - Pesquisa + ordenação
   * - Lista de produtos (filteredData)
   * - Carrinho com ProdutoCard + botões +/- qty
   * - Total
   * - Checkout (estudante, nome, cupão, comprar)
   */
  return (
    <PageShell>
      {/* Input de pesquisa */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Pesquisar produto pelo nome..."
        className="w-full max-w-md rounded-lg border px-3 py-2 mt-4"
      />

      {/* Select para ordenar */}
      <select
        value={order}
        onChange={(e) => setOrder(e.target.value)}
        className="w-full max-w-md rounded-lg border px-3 py-2 mt-3"
      >
        <option value="name-asc">Nome (A → Z)</option>
        <option value="name-desc">Nome (Z → A)</option>
        <option value="price-asc">Preço (crescente)</option>
        <option value="price-desc">Preço (decrescente)</option>
      </select>

      <h2 className="sectionTitle">Produtos</h2>

      {/* Lista de produtos filtrados/ordenados */}
      <div className="grid">
        {filteredData.map((produto) => (
          <ProdutoCard
            key={produto.id}
            produto={produto}
            onAddToCart={handleAddToCart}
            // isInCart: depois de adicionar, o ProdutoCard pode esconder o botão "Adicionar"
            isInCart={isInCart(produto)}
          />
        ))}
      </div>

      <h2 className="sectionTitle">Carrinho</h2>

      {/* Se carrinho está vazio */}
      {cart.length === 0 ? (
        <p className="muted">Carrinho vazio.</p>
      ) : (
        <>
          <div className="grid">
            {cart.map((item) => (
              <div key={item.produto.id} className="cartItem">
                {/* ProdutoCard no carrinho: aqui passamos onRemoveFromCart */}
                <ProdutoCard
                  produto={item.produto}
                  onRemoveFromCart={handleRemoveFromCart}
                  isInCart={true}
                />

                {/* botões para diminuir/aumentar qty */}
                <div className="qtyRow">
                  <button
                    className="qtyBtn"
                    onClick={() => handleRemoveFromCart(item.produto)}
                  >
                    -
                  </button>

                  <span className="qtyText">Quantidade: {item.qty}</span>

                  <button
                    className="qtyBtn"
                    onClick={() => handleAddToCart(item.produto)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total calculado */}
          <div className="totalBox">
            <strong>Total:</strong> {total.toFixed(2)} €
          </div>

          <h2 className="sectionTitle">Finalizar compra</h2>

          {/* Checkbox de estudante */}
          <label className="flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              checked={isStudent}
              onChange={(e) => setIsStudent(e.target.checked)}
            />
            Estudante DEISI
          </label>

          {/* Nome */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome (opcional)"
            className="mt-3 w-full max-w-md rounded-lg border px-3 py-2"
          />

          {/* Cupão */}
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Cupão de desconto"
            className="mt-3 w-full max-w-md rounded-lg border px-3 py-2"
          />

          {/* Botão comprar */}
          <button
            onClick={buy}
            disabled={buyLoading || cart.length === 0}
            className="mt-4 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {buyLoading ? 'A comprar...' : 'Comprar'}
          </button>

          {/* Resposta do servidor (debug/feedback) */}
          {buyResponse && (
            <pre className="mt-4 rounded-lg bg-gray-100 p-3 text-sm">
              {JSON.stringify(buyResponse, null, 2)}
            </pre>
          )}

          {/* Erro da compra */}
          {buyError && <p className="mt-4 text-red-600">{buyError}</p>}
        </>
      )}

      {/* CSS da página */}
      <style jsx>{`
        .grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }
        .sectionTitle {
          margin-top: 26px;
          font-size: 18px;
          font-weight: 700;
        }
        .muted {
          color: rgba(0, 0, 0, 0.6);
          margin-top: 12px;
        }
        .totalBox {
          margin-top: 16px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.8);
          display: inline-block;
        }
        .qtyRow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
        }
        .qtyBtn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.15);
          background: white;
          font-weight: 800;
          cursor: pointer;
        }
        .qtyBtn:hover {
          background: rgba(0, 0, 0, 0.04);
        }
        .qtyText {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.7);
        }
      `}</style>
    </PageShell>
  );
}

/**
 * PageShell
 * “Layout” simples da página:
 * - header fixo (sticky)
 * - área principal (main) com largura máxima
 * - estilos para fundo e topo
 */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <header className="header">
        <div className="brand">
          <span className="logo">DEISI</span>
          <div>
            <h1>Shop</h1>
            <p>Catálogo de produtos</p>
          </div>
        </div>
      </header>

      {/* children = tudo o que a página renderiza dentro do layout */}
      <main className="main">{children}</main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: radial-gradient(
              900px 400px at 10% 10%,
              rgba(0, 0, 0, 0.06),
              transparent 60%
            ),
            radial-gradient(
              700px 350px at 90% 0%,
              rgba(0, 0, 0, 0.05),
              transparent 55%
            ),
            #f7f7fb;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(247, 247, 251, 0.75);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 18px 16px 28px 16px;
        }

        .brand {
          max-width: 1100px;
          margin: 0 auto;
          padding: 14px 16px;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .logo {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          font-weight: 900;
          letter-spacing: -0.6px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: white;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
        }

        h1 {
          margin: 0;
          font-size: 18px;
          letter-spacing: -0.3px;
        }

        p {
          margin: 2px 0 0 0;
          color: rgba(0, 0, 0, 0.6);
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
