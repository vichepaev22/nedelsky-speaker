const configuredBase =
  (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? "/";

const normalizedBase = configuredBase === "/" ? "" : configuredBase.replace(/\/$/, "");

export function sitePath(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}` || "/";
}
