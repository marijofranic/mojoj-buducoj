"""Local secure ElevenLabs proxy. Run: ELEVENLABS_API_KEY=... python neural_narrator_server.py"""
import os, json, urllib.request, urllib.error
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

HOST='127.0.0.1'; PORT=int(os.environ.get('PORT','8765'))
HTML='mojoj_buducoj_neuralni_narator.html'
MODEL=os.environ.get('ELEVENLABS_MODEL_ID','eleven_v3')
VOICE=os.environ.get('ELEVENLABS_VOICE_ID','')
class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  if self.path in ('/','/index.html'):
   self.path='/'+HTML
  return super().do_GET()
 def do_POST(self):
  if self.path!='/api/narrate':self.send_error(404);return
  key=os.environ.get('ELEVENLABS_API_KEY','')
  if not key or not VOICE:
   return self.error_json(503,'Postavi ELEVENLABS_API_KEY i ELEVENLABS_VOICE_ID na serveru.')
  try:
   length=int(self.headers.get('Content-Length','0'))
   if length>12000 or length<1:return self.error_json(413,'Prevelik zahtjev.')
   body=json.loads(self.rfile.read(length))
   content=body.get('text','')
   if not isinstance(content,str) or not 1<=len(content)<=2500:return self.error_json(400,'Neispravan tekst.')
   data=json.dumps({'text':content,'model_id':MODEL,'language_code':'hr'}).encode()
   req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+urllib.parse.quote(VOICE),data=data,headers={'xi-api-key':key,'Content-Type':'application/json','Accept':'audio/mpeg'},method='POST')
   with urllib.request.urlopen(req,timeout=90) as res:audio=res.read()
   self.send_response(200);self.send_header('Content-Type','audio/mpeg');self.send_header('Content-Length',str(len(audio)));self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(audio)
  except urllib.error.HTTPError as exc:
   self.error_json(502,'ElevenLabs je vratio pogrešku '+str(exc.code)+'. Provjeri model, glas i pretplatu.')
  except Exception as exc:self.error_json(502,'Generiranje zvuka nije uspjelo: '+str(exc))
 def error_json(self,status,msg):
  raw=json.dumps({'error':msg},ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
if __name__=='__main__':
 print(f'Open http://{HOST}:{PORT}');ThreadingHTTPServer((HOST,PORT),Handler).serve_forever()
