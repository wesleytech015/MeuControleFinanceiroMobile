/** URL pública do Express, incluindo /api. Não coloque segredos nesta variável. */
export function getApiBaseUrl(): string {
  const value = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!value) throw new Error('Configure EXPO_PUBLIC_API_URL no .env incluindo /api.');
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('EXPO_PUBLIC_API_URL deve ser HTTP(S), sem credenciais, query ou fragmento.');
  }
  return url.toString().replace(/\/+$/, '');
}

export const API_TIMEOUT_MS = 15_000;
