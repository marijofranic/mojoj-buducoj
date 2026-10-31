export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.ELEVENLABS_API_KEY;
  const voice = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voice) return res.status(503).json({ error: 'Narator još nije konfiguriran.' });
  const text = req.body?.text;
  if (typeof text !== 'string' || !text.trim() || text.length > 2500) {
    return res.status(400).json({ error: 'Neispravan tekst.' });
  }
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`, {
      method: 'POST',
      headers: {
        'xi-api-key': key,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2'
      })
    });
    if (!response.ok) {
      let code = 'unknown';
      try {
        const body = await response.json();
        const status = body?.detail?.status;
        if (typeof status === 'string' && /^[a-z0-9_]{1,64}$/.test(status)) code = status;
      } catch {}
      console.error('ElevenLabs TTS failed', { httpStatus: response.status, code });
      return res.status(502).json({ error: `ElevenLabs pogreška ${response.status} (${code}).` });
    }
    const audio = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).send(audio);
  } catch (e) {
    console.error('ElevenLabs request failed');
    return res.status(502).json({ error: 'Generiranje zvuka nije uspjelo.' });
  }
}
