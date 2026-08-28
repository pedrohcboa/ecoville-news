import type { MetadataRoute } from "next";

/**
 * Ecoville News é material interno da rede: nada aqui deve ser indexado nem
 * divulgado publicamente. Não existe sitemap — o acesso acontece por link
 * compartilhado internamente.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
