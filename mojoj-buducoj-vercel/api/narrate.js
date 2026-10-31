const escapeXml = value => value.replace(/[<>&"']/g, char => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[char]));
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const text = req.body?.text;
  if (typeof text !== 'string' || !text.trim() || text.length > 2500) {
    return res.status(400).json({ error: 'Neispravan tekst.' });
  }
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) return res.status(503).json({ error: 'Azure narator nije konfiguriran. Koristi besplatni glas preglednika.' });
  if (!/^[a-z0-9-]{2,32}$/.test(region)) return res.status(503).json({ error: 'Azure regija nije ispravno konfigurirana.' });
  const voice = process.env.AZURE_SPEECH_VOICE === 'hr-HR-SreckoNeural' ? 'hr-HR-SreckoNeural' : 'hr-HR-GabrijelaNeural';
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="hr-HR"><voice name="${voice}"><prosody rate="-8%">${escapeXml(text.trim())}</prosody></voice></speak>`;
  try {
    const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'MojojBuducjojNarrator'
      },
      body: ssml,
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) {
      console.error('Azure Speech failed', { status: response.status });
      return res.status(502).json({ error: `Azure Speech pogreška ${response.status}. Koristi glas preglednika.` });
    }
    const audio = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).send(audio);
  } catch {
    return res.status(502).json({ error: 'Azure naracija trenutačno nije dostupna.' });
  }
}
