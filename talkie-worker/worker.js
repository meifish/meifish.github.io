// Talkie AI speech-to-text proxy (Cloudflare Worker).
// Holds the OpenAI key so the public test page never sees it.
//
//   POST /token       returns a short-lived OpenAI client secret; the phone then
//                     streams audio straight to OpenAI over WebRTC (no audio here)
//   POST /transcribe  relays one finished recording to OpenAI (upload mode)
//
// Settings in the Cloudflare dashboard (Worker > Settings > Variables and Secrets):
//   OPENAI_API_KEY  (Secret)  your OpenAI key
//   PASSCODE        (Secret)  the code testers type into the page
//   ALLOWED_ORIGIN  (Text)    https://meifish.github.io

const UPLOAD_MODELS = ['gpt-4o-mini-transcribe', 'gpt-4o-transcribe', 'whisper-1'];
const REALTIME_MODELS = ['gpt-live-transcribe', 'gpt-transcribe', 'gpt-4o-transcribe', 'gpt-4o-mini-transcribe'];
const TOKEN_SECONDS = 600; // a stolen token stops working after 10 minutes
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // about 10 minutes of compressed speech

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || 'https://meifish.github.io';
    const cors = {
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Passcode',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    const fail = (status, message) =>
      new Response(JSON.stringify({ error: { message } }), {
        status, headers: { ...cors, 'Content-Type': 'application/json' },
      });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return fail(405, 'Use POST.');
    if (origin !== allowed) return fail(403, 'This page is not allowed to use the service.');
    if (!env.OPENAI_API_KEY || !env.PASSCODE) return fail(500, 'The service is missing its settings.');
    if (request.headers.get('X-Passcode') !== env.PASSCODE) return fail(401, '通行碼錯誤 Wrong passcode.');

    const path = new URL(request.url).pathname;
    if (path === '/token') return token(request, env, cors, fail);
    if (path !== '/transcribe' && path !== '/') return fail(404, 'Unknown path.');

    let form;
    try { form = await request.formData(); } catch (e) { return fail(400, 'Send the audio as form data.'); }
    const file = form.get('file');
    const model = form.get('model');
    if (!file || typeof file === 'string') return fail(400, 'No audio file.');
    if (file.size > MAX_AUDIO_BYTES) return fail(413, 'Recording is too long.');
    if (!UPLOAD_MODELS.includes(model)) return fail(400, 'Unknown model.');

    const out = new FormData();
    out.append('file', file, file.name || 'speech.webm');
    out.append('model', model);
    for (const k of ['language', 'stream']) if (form.get(k)) out.append(k, form.get(k));

    const upstream = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      body: out,
    });
    const headers = new Headers(cors);
    headers.set('Content-Type', upstream.headers.get('Content-Type') || 'application/json');
    headers.set('Cache-Control', 'no-store');
    return new Response(upstream.body, { status: upstream.status, headers });
  },
};

async function token(request, env, cors, fail) {
  let body;
  try { body = await request.json(); } catch (e) { return fail(400, 'Send JSON.'); }
  if (!REALTIME_MODELS.includes(body.model)) return fail(400, 'Unknown model.');
  const upstream = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      expires_after: { anchor: 'created_at', seconds: TOKEN_SECONDS },
      session: {
        type: 'transcription',
        audio: { input: {
          transcription: { model: body.model },
          turn_detection: { type: 'server_vad', silence_duration_ms: 500 },
        } },
      },
    }),
  });
  const text = await upstream.text();
  let out = text;
  if (upstream.ok) {
    // Hand back only the secret, not the session details.
    try { const j = JSON.parse(text); out = JSON.stringify({ value: j.value, expires_at: j.expires_at }); } catch (e) {}
  }
  return new Response(out, {
    status: upstream.status,
    headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
