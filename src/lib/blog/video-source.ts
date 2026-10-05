export type ClassifiedVideoSource =
  | { type: "direct"; url: string; mimeType: string }
  | { type: "youtube" | "vimeo"; url: string }
  | { type: "unsupported" };

function parseHttpUrl(value: string) {
  try {
    const url = new URL(value);
    if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname || /(^|\.)example\.(com|org|net)$/i.test(url.hostname)) return null;
    return url;
  } catch { return null; }
}

function youtubeId(url: URL) {
  const host = url.hostname.toLowerCase();
  if (!["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"].includes(host)) return null;
  const id = host.includes("youtu.be") ? url.pathname.split("/").filter(Boolean)[0]
    : url.pathname === "/watch" ? url.searchParams.get("v")
      : url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
  return id && /^[A-Za-z0-9_-]{6,}$/.test(id) ? id : null;
}

function vimeoId(url: URL) {
  if (!["vimeo.com", "www.vimeo.com"].includes(url.hostname.toLowerCase())) return null;
  const id = url.pathname.split("/").filter(Boolean).at(-1);
  return id && /^\d+$/.test(id) ? id : null;
}

export function classifyVideoSource(value: string): ClassifiedVideoSource {
  const url = parseHttpUrl(value);
  if (!url) return { type: "unsupported" };
  const youtube = youtubeId(url);
  if (youtube) return { type: "youtube", url: `https://www.youtube-nocookie.com/embed/${youtube}` };
  const vimeo = vimeoId(url);
  if (vimeo) return { type: "vimeo", url: `https://player.vimeo.com/video/${vimeo}` };
  const pathname = url.pathname.toLowerCase();
  const ext = pathname.match(/\.(mp4|webm|mov)$/)?.[1];
  if (ext) return { type: "direct", url: url.href, mimeType: ext === "mov" ? "video/quicktime" : `video/${ext}` };
  return { type: "unsupported" };
}

export function classifyEmbedSource(value: string) {
  const url = parseHttpUrl(value);
  if (!url || url.protocol !== "https:") return null;
  const youtube = youtubeId(url);
  if (youtube) return { provider: "youtube" as const, url: `https://www.youtube-nocookie.com/embed/${youtube}` };
  const vimeo = vimeoId(url);
  if (vimeo) return { provider: "vimeo" as const, url: `https://player.vimeo.com/video/${vimeo}` };
  return null;
}
