import type { NextConfig } from "next";

/**
 * O host do Supabase Storage é derivado da URL do projeto para que o
 * `next/image` possa otimizar as capas enviadas pelo editor.
 */
const hostSupabase = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: hostSupabase
      ? [
          {
            protocol: "https",
            hostname: hostSupabase,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Reforça a não divulgação também no nível de cabeçalho, para
          // crawlers que ignoram o robots.txt.
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
