"use client";

import { useEffect, useState } from "react";

const MIN = 0;
const MAX = 10;

export default function Contador() {
    const [valor, setValor] = useState<number>(0);
    const [historico, setHistorico] = useState<number[]>([]);

    // Ao carregar a página: lê apenas o valor do localStorage e limpa o histórico
    useEffect(() => {
        const salvoValor = localStorage.getItem("contador.valor");

        if (salvoValor !== null) {
            setValor(Number(salvoValor));
        } else {
            setValor(0);
        }

        // histórico começa sempre vazio
        setHistorico([]);
    }, []);

    useEffect(() => {
        localStorage.setItem("contador.valor", String(valor));
    }, [valor]);

    function atualizarValor(novo: number) {
        const limitado = Math.min(MAX, Math.max(MIN, novo));
        setValor(limitado);
        setHistorico((h) => [...h, limitado]); // histórico só vive na memória
    }

    function incrementar() {
        atualizarValor(valor + 1);
    }

    function decrementar() {
        atualizarValor(valor - 1);
    }

    function reset() {
        atualizarValor(0);
    }

    function corNumero(n: number) {
        if (n >= 0 && n <= 3) return "text-red-600";
        if (n >= 4 && n <= 7) return "text-yellow-500";
        return "text-green-600";
    }

    const estiloBotao =
        "px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition";

    return (
        <div className="flex flex-col items-center gap-4">
            <h1 className={`text-5xl font-bold ${corNumero(valor)}`}>
                {valor}
            </h1>

            <div className="flex gap-3">
                <button className={estiloBotao} onClick={decrementar}>−1</button>
                <button className={estiloBotao} onClick={reset}>Reset</button>
                <button className={estiloBotao} onClick={incrementar}>+1</button>
            </div>

            <div className="mt-4 w-full text-center">
                <h2 className="font-semibold mb-2">Histórico de valores</h2>

                {historico.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                        Ainda sem valores registados...
                    </p>
                ) : (
                    <ul className="list-disc list-inside">
                        {historico.map((v, i) => (
                            <li key={i}>{v}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
