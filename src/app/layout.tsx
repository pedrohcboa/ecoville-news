import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

/**
 * Tipografia da marca.
 * - Archivo: grotesca robusta, usada em títulos e no wordmark.
 * - Inter: alta legibilidade para o corpo das edições.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ecoville News",
    template: "%s · Ecoville News",
  },
  description:
    "Newsletter interna da rede Ecoville para franqueados: produtos, operação de loja e gestão financeira da unidade.",
  applicationName: "Ecoville News",
  // NÃO DIVULGAÇÃO: o conteúdo é interno da rede. Bloqueamos indexação em
  // todo o site (não há sitemap público — ver src/app/robots.ts).
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  referrer: "strict-origin-when-cross-origin",
};

export const viewport: Viewport = {
  themeColor: "#0213C1",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        {/* Tráfego agregado (visitantes, pageviews, origens). O detalhe por
            botão vem da nossa tabela `events` — ver src/lib/analytics.ts. */}
        <Analytics />
      </body>
    </html>
  );
}
