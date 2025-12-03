"use client";

import { useState } from "react";

type Tarefa = {
  id: number;
  texto: string;
  tecnologia: string;
};

export default function Input() {
  // 1) Input único (texto aparece em baixo E vira tarefa)
  const [textoDigitado, setTextoDigitado] = useState("");

  // 2) Categoria selecionada
  const [categoria, setCategoria] = useState("React");

  // 3) Lista de tarefas
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);

  // 4) Estado para edição
  const [idAEditar, setIdAEditar] = useState<number | null>(null);
  const [textoEdicao, setTextoEdicao] = useState("");
  const [tecEdicao, setTecEdicao] = useState("React");

  function adicionarTarefa() {
    if (textoDigitado.trim() === "") return;

    const nova: Tarefa = {
      id: Date.now(),
      texto: textoDigitado,
      tecnologia: categoria,
    };

    setTarefas((t) => [...t, nova]);

    // limpar input depois de inserir
    setTextoDigitado("");
  }

  function apagarTarefa(id: number) {
    setTarefas((t) => t.filter((tarefa) => tarefa.id !== id));
  }

  function comecarEdicao(tarefa: Tarefa) {
    setIdAEditar(tarefa.id);
    setTextoEdicao(tarefa.texto);
    setTecEdicao(tarefa.tecnologia);
  }

  function guardarEdicao(id: number) {
    if (textoEdicao.trim() === "") return;

    setTarefas((t) =>
      t.map((tarefa) =>
        tarefa.id === id
          ? { ...tarefa, texto: textoEdicao, tecnologia: tecEdicao }
          : tarefa
      )
    );
    setIdAEditar(null);
  }

  function cancelarEdicao() {
    setIdAEditar(null);
  }

  const estiloInput = "border px-2 py-1 rounded w-full";
  const estiloBotao = "px-3 py-1 bg-blue-600 text-white rounded text-sm";
  const estiloBotaoPerigo =
    "px-3 py-1 bg-red-600 text-white rounded text-sm";
  const estiloBotaoCinza =
    "px-3 py-1 bg-gray-500 text-white rounded text-sm";

  return (
    <main className="p-6 flex flex-col gap-8 items-center">

      {/* 1 — INPUT DE TEXTO (ÚNICO) */}
      <section className="w-full max-w-xl">
        <h2 className="text-lg font-semibold">Input de Texto</h2>

        <input
          className={estiloInput}
          type="text"
          placeholder="Escreva algo..."
          value={textoDigitado}
          onChange={(e) => setTextoDigitado(e.target.value)}
        />

        <p className="mt-2">
          <strong>Texto digitado:</strong> {textoDigitado}
        </p>
      </section>

      {/* 2 — SELECT DE TECNOLOGIAS */}
      <section className="w-full max-w-xl">
        <h2 className="text-lg font-semibold">Tecnologia</h2>

        <select
          className={estiloInput}
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option>React</option>
          <option>Next.js</option>
          <option>JavaScript</option>
          <option>Python</option>
          <option>Java</option>
        </select>

        <p className="mt-2">
          <strong>Tecnologia escolhida:</strong> {categoria}
        </p>
      </section>

      {/* 3 — LISTA DE TAREFAS */}
      <section className="w-full max-w-xl">
        <h2 className="text-lg font-semibold">Lista de Tarefas</h2>

        <button
          className={`${estiloBotao} mb-4`}
          onClick={adicionarTarefa}
        >
          Inserir Tarefa
        </button>

        {tarefas.length === 0 ? (
          <p className="text-sm text-gray-500">Ainda não há tarefas.</p>
        ) : (
          <ul className="space-y-2">
            {tarefas.map((tarefa) => (
              <li
                key={tarefa.id}
                className="border rounded px-2 py-2 flex flex-col gap-2"
              >
                {idAEditar === tarefa.id ? (
                  // 🔧 MODO EDIÇÃO
                  <>
                    <input
                      className={estiloInput}
                      value={textoEdicao}
                      onChange={(e) => setTextoEdicao(e.target.value)}
                    />
                    <select
                      className={estiloInput}
                      value={tecEdicao}
                      onChange={(e) => setTecEdicao(e.target.value)}
                    >
                      <option>React</option>
                      <option>Next.js</option>
                      <option>JavaScript</option>
                      <option>Python</option>
                      <option>Java</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        className={estiloBotao}
                        onClick={() => guardarEdicao(tarefa.id)}
                      >
                        Guardar
                      </button>
                      <button
                        className={estiloBotaoCinza}
                        onClick={cancelarEdicao}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  // 👀 MODO NORMAL
                  <>
                    <div>
                      <div>
                        <strong>Tarefa:</strong> {tarefa.texto}
                      </div>
                      <div>
                        <strong>Tecnologia:</strong> {tarefa.tecnologia}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className={estiloBotao}
                        onClick={() => comecarEdicao(tarefa)}
                      >
                        Editar
                      </button>
                      <button
                        className={estiloBotaoPerigo}
                        onClick={() => apagarTarefa(tarefa.id)}
                      >
                        Apagar
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
