# Mojoj budućoj

Interaktivna knjiga. Vercel static HTML + serverless ElevenLabs narrator.

## Vercel Environment Variables

- `ELEVENLABS_API_KEY` (secret)
- `ELEVENLABS_VOICE_ID` (Croatian-compatible voice)
- `ELEVENLABS_MODEL_ID` (optional, defaults to `eleven_v3`)

Do not commit credentials. Neural narration requires the variables above and a valid ElevenLabs subscription. The `/api/narrate` endpoint is not rate limited or authenticated; restrict access before publishing broadly to avoid unexpected API costs.
