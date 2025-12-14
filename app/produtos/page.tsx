'use client';

import useSWR from 'swr';
import { useEffect, useMemo, useState } from 'react';
import type { Produto } from '@/models/interfaces';
import ProdutoCard from '@/components/ProdutosCard/produtoCard';

const API_URL = 'https://deisishop.pythonanywhere.com/products/';
const CART_KEY = 'cart';

type CartItem = { produto: Produto; qty: number };

async function fetcher(url: string): Promise<Produto[]> {
  const res = await fetch(url);

  if (!res.ok) {
    let msg = `Erro HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {}
    throw new Error(msg);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Resposta inválida da API: não é uma lista de produtos.');
  }

  return data as Produto[];
}

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

export default function ProdutosPage() {
  const { data, error, isLoading } = useSWR<Produto[]>(API_URL, fetcher);

  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState<Produto[]>([]);
  const [order, setOrder] = useState('name-asc');

  const [cart, setCart] = useState<CartItem[]>([]);

  const [isStudent, setIsStudent] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [name, setName] = useState('');
  const [buyResponse, setBuyResponse] = useState<any>(null);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buyLoading, setBuyLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setCart(parsed as CartItem[]);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    if (!data) {
      setFilteredData([]);
      return;
    }

    const termo = search.toLowerCase();
    const lista = data.filter((p) => p.title.toLowerCase().includes(termo));

    const ordenada = [...lista];
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

    setFilteredData(ordenada);
  }, [search, order, data]);

  const isInCart = (produto: Produto) =>
    cart.some((i) => i.produto.id === produto.id);

  const handleAddToCart = (produto: Produto) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.produto.id === produto.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { produto, qty: 1 }];
    });
  };

  const handleRemoveFromCart = (produto: Produto) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.produto.id === produto.id);
      if (idx === -1) return prev;

      const item = prev[idx];
      if (item.qty <= 1) {
        return prev.filter((i) => i.produto.id !== produto.id);
      }

      const copy = [...prev];
      copy[idx] = { ...item, qty: item.qty - 1 };
      return copy;
    });
  };

  const total = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + (Number(item.produto.price) || 0) * item.qty,
      0
    );
  }, [cart]);

  const buy = async () => {
    if (cart.length === 0) return;

    setBuyLoading(true);
    setBuyError(null);
    setBuyResponse(null);

    // ✅ ids repetidos conforme qty (garante quantidades)
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

      const text = await response.text();
      if (!response.ok) throw new Error(text || response.statusText);

      setBuyResponse(JSON.parse(text));
      setCart([]);
    } catch (err: any) {
      setBuyError(err?.message ?? 'Erro ao comprar');
    } finally {
      setBuyLoading(false);
    }
  };

  if (isLoading) return <PageShell><Spinner /></PageShell>;

  if (error) {
    return (
      <PageShell>
        <div className="notice error">
          <div>
            <h2>Não foi possível carregar os produtos</h2>
            <p className="muted">{error.message}</p>
          </div>

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

  return (
    <PageShell>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Pesquisar produto pelo nome..."
        className="w-full max-w-md rounded-lg border px-3 py-2 mt-4"
      />

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
      <div className="grid">
        {filteredData.map((produto) => (
          <ProdutoCard
            key={produto.id}
            produto={produto}
            onAddToCart={handleAddToCart}
            isInCart={isInCart(produto)} // ✅ depois de adicionar, o botão some
          />
        ))}
      </div>

      <h2 className="sectionTitle">Carrinho</h2>

      {cart.length === 0 ? (
        <p className="muted">Carrinho vazio.</p>
      ) : (
        <>
          <div className="grid">
            {cart.map((item) => (
              <div key={item.produto.id} className="cartItem">
                <ProdutoCard
                  produto={item.produto}
                  onRemoveFromCart={handleRemoveFromCart}
                  isInCart={true}
                />

                {/* ✅ botões para aumentar/diminuir quantidade */}
                <div className="qtyRow">
                  <button className="qtyBtn" onClick={() => handleRemoveFromCart(item.produto)}>
                    -
                  </button>

                  <span className="qtyText">Quantidade: {item.qty}</span>

                  <button className="qtyBtn" onClick={() => handleAddToCart(item.produto)}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="totalBox">
            <strong>Total:</strong> {total.toFixed(2)} €
          </div>

          <h2 className="sectionTitle">Finalizar compra</h2>

          <label className="flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              checked={isStudent}
              onChange={(e) => setIsStudent(e.target.checked)}
            />
            Estudante DEISI
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome (opcional)"
            className="mt-3 w-full max-w-md rounded-lg border px-3 py-2"
          />

          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Cupão de desconto"
            className="mt-3 w-full max-w-md rounded-lg border px-3 py-2"
          />

          <button
            onClick={buy}
            disabled={buyLoading || cart.length === 0}
            className="mt-4 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {buyLoading ? 'A comprar...' : 'Comprar'}
          </button>

          {buyResponse && (
            <pre className="mt-4 rounded-lg bg-gray-100 p-3 text-sm">
              {JSON.stringify(buyResponse, null, 2)}
            </pre>
          )}

          {buyError && <p className="mt-4 text-red-600">{buyError}</p>}
        </>
      )}

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
