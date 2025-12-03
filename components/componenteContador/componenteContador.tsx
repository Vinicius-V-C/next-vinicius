"use client";

import { useEffect, useState } from "react";

const MIN = 0;
const MAX = 10;

export default function Contador() {
    const [valor, setValor] = useState<number>(0);
    const [historico, setHistorico] = useState<number[]>([]);

    // Carregar valores do localStorage
    useEffect(() => {
        const guardado = localStorage.getItem("contador_valor");
        const guardadoHist = localStorage.getItem("contador_hist");

        if (guardado !== null) setValor(Number(guardado));

        if (guardadoHist !== null) {
            try {
                setHistorico(JSON.parse(guardadoHist));
            } catch {
                setHistorico([]);
            }
        }
    }, []);

    // Guardar valor E histórico sempre que mudarem
    useEffect(() => {
        localStorage.setItem("contador_valor", String(valor));
        localStorage.setItem("contador_hist", JSON.stringify(historico));
    }, [valor, historico]);

    function registar(novo: number) {
        setValor(() => {
            const limitado = Math.min(MAX, Math.max(MIN, novo));
            setHistorico((h) => [...h, limitado]);
            return limitado;
        });
    }

    function incrementar() {
        registar(valor + 1);
    }

    function decrementar() {
        registar(valor - 1);
    }

    function reset() {
        registar(0);
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

            {/* LISTA <ul> com os valores por onde passou */}
            <div className="mt-4 w-full text-center">
                <h2 className="font-semibold mb-2">Histórico de valores</h2>

                {historico.length === 0 ? (
                    <p className="text-gray-500 text-sm">Ainda sem valores registados...</p>
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
