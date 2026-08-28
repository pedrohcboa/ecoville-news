"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { classesBotao } from "./ui";

/** Encerra a sessão do editor e devolve à tela de login. */
export function BotaoSair({ compacto = false }: { compacto?: boolean }) {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    try {
      await criarClienteNavegador().auth.signOut();
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={sair}
      disabled={saindo}
      className={classesBotao("fantasma", compacto ? "px-3 py-1.5 text-xs" : "")}
    >
      {saindo ? "Saindo…" : "Sair"}
    </button>
  );
}
