"use client";

import { useState } from "react";
import { classesEntrada } from "./ui";
import { IconeFechar } from "@/components/ui/Icones";

/**
 * Entrada de tags em formato de "chips".
 * Enter ou vírgula confirmam a tag; Backspace no campo vazio apaga a última.
 */
export function CampoTags({
  id,
  tags,
  aoMudar,
}: {
  id: string;
  tags: string[];
  aoMudar: (tags: string[]) => void;
}) {
  const [rascunho, setRascunho] = useState("");

  function adicionar(texto: string) {
    const nova = texto.trim().replace(/,+$/, "");
    if (!nova) return;
    // Comparação sem diferenciar maiúsculas evita "Margem" e "margem" juntas.
    if (!tags.some((t) => t.toLowerCase() === nova.toLowerCase())) {
      aoMudar([...tags, nova]);
    }
    setRascunho("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue-soft py-1 pr-1 pl-3 text-sm font-medium text-brand-blue-deep"
          >
            {tag}
            <button
              type="button"
              onClick={() => aoMudar(tags.filter((t) => t !== tag))}
              className="inline-flex size-5 items-center justify-center rounded-full hover:bg-brand-blue hover:text-white"
            >
              <span className="sr-only">Remover tag {tag}</span>
              <IconeFechar className="size-3" />
            </button>
          </span>
        ))}
      </div>

      <input
        id={id}
        type="text"
        value={rascunho}
        onChange={(e) => {
          const valor = e.target.value;
          if (valor.includes(",")) adicionar(valor);
          else setRascunho(valor);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            adicionar(rascunho);
          } else if (e.key === "Backspace" && !rascunho && tags.length) {
            aoMudar(tags.slice(0, -1));
          }
        }}
        onBlur={() => adicionar(rascunho)}
        placeholder="Digite e tecle Enter"
        className={`${classesEntrada} ${tags.length ? "mt-2" : ""}`}
      />
    </div>
  );
}
