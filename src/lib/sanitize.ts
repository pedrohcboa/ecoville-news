import sanitizeHtml from "sanitize-html";

/**
 * Higienização do HTML vindo do editor visual.
 *
 * O conteúdo é escrito por um editor autenticado (baixo risco), mas como ele é
 * renderizado com `dangerouslySetInnerHTML` mantemos uma allowlist estrita:
 * qualquer `<script>`, `on*` ou `javascript:` que entrasse por um "colar de
 * outro site" é removido antes de chegar ao leitor.
 */
const OPCOES: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr",
    "h2", "h3", "h4",
    "strong", "em", "u", "s", "mark", "span", "code", "sub", "sup",
    "ul", "ol", "li",
    "blockquote",
    "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td", "colgroup", "col",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    // O editor aplica o acento azul da marca via `style="color: ..."`.
    span: ["style"],
    mark: ["style"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
    col: ["style"],
  },
  allowedSchemes: ["https", "http", "mailto"],
  allowedSchemesByTag: { img: ["https", "http", "data"] },
  // Restringe `style` a cor/realce, evitando CSS arbitrário na página.
  allowedStyles: {
    "*": {
      color: [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^var\(--/],
      "background-color": [/^#[0-9a-fA-F]{3,8}$/, /^rgb\(/, /^var\(--/],
      width: [/^\d+(?:px|%)$/],
    },
  },
  // Links externos nunca devem carregar o `window.opener` da nossa página.
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: attribs.target === "_blank"
        ? { ...attribs, rel: "noopener noreferrer" }
        : attribs,
    }),
  },
};

export function higienizarHtml(html: string): string {
  return sanitizeHtml(html ?? "", OPCOES);
}
