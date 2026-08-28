import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

/** Página 404 — mantém a marca e devolve o leitor ao arquivo. */
export default function NaoEncontrada() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="text-center">
        <Wordmark tamanho="lg" />
        <p className="mt-8 font-display text-6xl font-extrabold text-brand-blue">
          404
        </p>
        <h1 className="mt-4 text-2xl font-extrabold text-ink">
          Esta edição não está por aqui
        </h1>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">
          O endereço pode ter mudado ou a edição ainda não foi publicada.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/edicoes"
            className="rounded-lg bg-brand-blue px-6 py-3 font-bold text-white hover:bg-brand-blue-deep"
          >
            Ir para o arquivo
          </Link>
          <Link
            href="/"
            className="rounded-lg border-2 border-brand-blue px-6 py-3 font-bold text-brand-blue hover:bg-brand-blue hover:text-white"
          >
            Voltar à home
          </Link>
        </div>
      </div>
    </main>
  );
}
