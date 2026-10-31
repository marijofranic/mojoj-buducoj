export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  const key=process.env.ELEVENLABS_API_KEY;
  const voice=process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voice) return res.status(503).json({error:'Narator još nije konfiguriran.'});
  const text=req.body?.text;
  if(typeof text!=='string'||text.length<1||text.length>2500)return res.status(400).json({error:'Neispravan tekst.'});
  try {
    const url=`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`;
    const response=await fetch(url,{method:'POST',headers:{'xi-api-key':key,'Content-Type':'application/json','Accept':'audio/mpeg'},body:JSON.stringify({text,model_id:process.env.ELEVENLABS_MODEL_ID||'eleven_v3'})});
    if(!response.ok)return res.status(502).json({error:`ElevenLabs pogreška ${response.status}.`});
    const audio=Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type','audio/mpeg');res.setHeader('Cache-Control','private, no-store');return res.status(200).send(audio);
  }catch(e){return res.status(502).json({error:'Generiranje zvuka nije uspjelo.'});}
}
