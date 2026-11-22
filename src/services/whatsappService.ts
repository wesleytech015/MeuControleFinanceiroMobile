import { ApiError, httpRequest } from './httpClient';

export type WhatsAppStatus = { vinculado: boolean; numeroMascarado: string | null };
export type WhatsAppPairing = { codigo: string; comando: string; expiraEmSegundos: number };

function headers(token: string) { return { Authorization: `Bearer ${token}` }; }
function invalid(): never { throw new ApiError('A API retornou uma resposta inesperada.', 'invalid_response'); }

export function getWhatsAppErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404 || error.status === 503) return 'A integração com WhatsApp ainda não está disponível neste servidor.';
    if (error.status === 401) return 'Sua sessão expirou. Saia e entre novamente para continuar.';
    if (error.status === 400) return error.message;
    if (error.kind === 'timeout') return 'A API demorou para responder. Tente novamente.';
    if (error.kind === 'connection') return 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.';
  }
  if (error instanceof Error && error.message === 'Informe o número com DDI e DDD, somente números.') return error.message;
  return 'Não foi possível concluir a operação. Tente novamente.';
}

export async function getWhatsAppStatus(token: string, signal?: AbortSignal): Promise<WhatsAppStatus> {
  const { data } = await httpRequest<unknown>('/whatsapp/vinculo', { headers: headers(token), signal });
  if (typeof data !== 'object' || data === null || !('vinculado' in data) || typeof data.vinculado !== 'boolean' ||
    !('numeroMascarado' in data) || !(data.numeroMascarado === null || typeof data.numeroMascarado === 'string')) return invalid();
  return { vinculado: data.vinculado, numeroMascarado: data.numeroMascarado };
}

export async function createWhatsAppPairing(token: string, numero: string, signal?: AbortSignal): Promise<WhatsAppPairing> {
  if (!/^[1-9]\d{9,14}$/.test(numero)) throw new Error('Informe o número com DDI e DDD, somente números.');
  const { data } = await httpRequest<unknown>('/whatsapp/vinculo', { method: 'POST', headers: headers(token), body: { numero }, signal });
  if (typeof data !== 'object' || data === null || !('codigo' in data) || typeof data.codigo !== 'string' || !/^[a-f0-9]{32}$/.test(data.codigo) ||
    !('comando' in data) || data.comando !== `vincular ${data.codigo}` || !('expiraEmSegundos' in data) ||
    typeof data.expiraEmSegundos !== 'number' || !Number.isSafeInteger(data.expiraEmSegundos) || data.expiraEmSegundos <= 0 || data.expiraEmSegundos > 600) return invalid();
  return { codigo: data.codigo, comando: data.comando, expiraEmSegundos: data.expiraEmSegundos };
}

export async function unlinkWhatsApp(token: string, signal?: AbortSignal): Promise<void> {
  await httpRequest('/whatsapp/vinculo', { method: 'DELETE', headers: headers(token), signal });
}
