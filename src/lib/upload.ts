"use client";

import { criarClienteNavegador } from "./supabase/client";
import { BUCKET_IMAGENS } from "./supabase/config";
import { gerarSlug } from "./utils";

/**
 * Envio de imagens para o Supabase Storage.
 *
 * Otimização básica antes do upload: a imagem é redesenhada num `<canvas>`
 * com largura máxima de 1600px e convertida para WebP com qualidade 82. Isso
 * costuma cortar 70–90% do peso de uma foto vinda do celular, sem depender de
 * nenhuma biblioteca externa.
 */

const LARGURA_MAXIMA = 1600;
const QUALIDADE = 0.82;
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // igual ao limite do bucket

export class ErroDeUpload extends Error {}

/** Redimensiona e recomprime. GIF passa direto (perderia a animação). */
async function otimizar(arquivo: File): Promise<Blob> {
  if (arquivo.type === "image/gif") return arquivo;

  const bitmap = await createImageBitmap(arquivo).catch(() => null);
  if (!bitmap) return arquivo;

  const escala = Math.min(1, LARGURA_MAXIMA / bitmap.width);
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;

  const contexto = canvas.getContext("2d");
  if (!contexto) return arquivo;
  contexto.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALIDADE),
  );

  // Se a conversão não ajudou (ou falhou), fica o arquivo original.
  return blob && blob.size < arquivo.size ? blob : arquivo;
}

/**
 * Envia a imagem e devolve a URL pública para usar na capa ou no corpo.
 * @param arquivo imagem escolhida pelo editor
 * @param pasta subpasta do bucket ("capas" ou "corpo")
 */
export async function enviarImagem(
  arquivo: File,
  pasta: "capas" | "corpo",
): Promise<string> {
  if (!arquivo.type.startsWith("image/")) {
    throw new ErroDeUpload("O arquivo escolhido não é uma imagem.");
  }
  if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
    throw new ErroDeUpload("A imagem passa de 5 MB. Reduza o tamanho e tente de novo.");
  }

  const otimizada = await otimizar(arquivo);
  const extensao = otimizada.type === "image/webp" ? "webp" : (arquivo.name.split(".").pop() ?? "jpg");
  const nomeBase = gerarSlug(arquivo.name.replace(/\.[^.]+$/, "")) || "imagem";
  const caminho = `${pasta}/${Date.now().toString(36)}-${nomeBase}.${extensao}`;

  const supabase = criarClienteNavegador();
  const { error } = await supabase.storage
    .from(BUCKET_IMAGENS)
    .upload(caminho, otimizada, {
      cacheControl: "31536000",
      contentType: otimizada.type || arquivo.type,
      upsert: false,
    });

  if (error) {
    throw new ErroDeUpload(`Falha ao enviar a imagem: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET_IMAGENS).getPublicUrl(caminho);
  return data.publicUrl;
}
