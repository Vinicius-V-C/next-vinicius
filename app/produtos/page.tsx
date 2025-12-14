'use client';

import useSWR from 'swr';
import { useEffect, useState } from 'react';
import type { Produto } from '@/models/interfaces';
import ProdutoCard from '@/components/ProdutosCard/produtoCard';

const API_URL = 'https://deisishop.pythonanywhere.com/products';

async function fetcher(url: string): Promise<Produto[]> {
  const res = await fetch(url);

  if (!res.ok) {
    let msg = `Erro HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {
      // ignora se não vier JSON
    }
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

 
  useEffect(() => {
    if (!data) {
      setFilteredData([]);
      return;
    }

    const termo = search.toLowerCase();
    const lista = data.filter((p) =>
      p.title.toLowerCase().includes(termo)
    );

    setFilteredData(lista);
  }, [search, data]);

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

      <div className="grid">
      
        {filteredData.map((produto) => (
          <ProdutoCard key={produto.id} produto={produto} />
        ))}
      </div>

      <style jsx>{`
        .grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
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
