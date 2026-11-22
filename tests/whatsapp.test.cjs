const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLoader } = require('./helpers/load-typescript.cjs');
const load = createLoader({ development: true });
const service = load('src/services/whatsappService.ts');
const { ApiError } = load('src/services/httpClient.ts');
const response = value => new Response(JSON.stringify(value), { status: 200, headers: { 'Content-Type': 'application/json' } });
function setup(t) {
  const previous = process.env.EXPO_PUBLIC_API_URL;
  process.env.EXPO_PUBLIC_API_URL = 'https://example.invalid/api';
  t.after(() => { if (previous === undefined) delete process.env.EXPO_PUBLIC_API_URL; else process.env.EXPO_PUBLIC_API_URL = previous; });
}
test('uses the authenticated account for status, pairing and unlinking', async t => {
  setup(t);
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, method: options.method, auth: options.headers.get('Authorization'), body: options.body });
    if (options.method === 'GET') return response({ vinculado: false, numeroMascarado: null });
    if (options.method === 'POST') return response({ codigo: 'a'.repeat(32), comando: `vincular ${'a'.repeat(32)}`, expiraEmSegundos: 600 });
    return response({ mensagem: 'WhatsApp desvinculado.' });
  });
  assert.equal((await service.getWhatsAppStatus('test-token')).vinculado, false);
  assert.equal((await service.createWhatsAppPairing('test-token', '5562999999999')).expiraEmSegundos, 600);
  await service.unlinkWhatsApp('test-token');
  assert.deepEqual(calls.map(call => call.method), ['GET', 'POST', 'DELETE']);
  assert.ok(calls.every(call => call.url === 'https://example.invalid/api/whatsapp/vinculo' && call.auth === 'Bearer test-token'));
  assert.deepEqual(JSON.parse(calls[1].body), { numero: '5562999999999' });
});
test('rejects invalid numbers and unexpected pairing responses', async t => {
  setup(t);
  const mock = t.mock.method(globalThis, 'fetch', async () => response({ codigo: 'wrong', comando: 'wrong', expiraEmSegundos: 600 }));
  await assert.rejects(service.createWhatsAppPairing('token', '(62)99999-9999'));
  assert.equal(mock.mock.callCount(), 0);
  await assert.rejects(service.createWhatsAppPairing('token', '5562999999999'), { kind: 'invalid_response' });
});
test('explains unavailable backend and expired sessions without exposing server errors', () => {
  assert.match(service.getWhatsAppErrorMessage(new ApiError('secret', 'http', 404)), /não está disponível/);
  assert.match(service.getWhatsAppErrorMessage(new ApiError('secret', 'http', 401)), /sessão expirou/);
  assert.doesNotMatch(service.getWhatsAppErrorMessage(new ApiError('secret', 'http', 500)), /secret/);
});
