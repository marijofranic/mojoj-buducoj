# Narator: Azure Speech + besplatni glas preglednika

Aplikacija koristi `/api/narrate` za Microsoft Azure Speech. Backend koristi hrvatski neuralni glas `hr-HR-GabrijelaNeural`, ili `hr-HR-SreckoNeural` ako je tako konfigurirano. API ključ ostaje na serveru.

## Vercel Production environment variables

| Key | Value |
| --- | --- |
| `AZURE_SPEECH_KEY` | Tajna vrijednost **KEY 1** ili **KEY 2** iz Azure Speech resursa. Nikad je ne commitati. |
| `AZURE_SPEECH_REGION` | Identifikator regije tog istog resursa, npr. `westeurope` **samo ako je resurs ondje kreiran**. |
| `AZURE_SPEECH_VOICE` | Neobavezno: `hr-HR-GabrijelaNeural` (zadano) ili `hr-HR-SreckoNeural`. |

U Azure Portalu otvoriti Speech resurs > Keys and Endpoint. Za testiranje može se odabrati F0 razina ako je dostupna i dopuštena za račun. Provjeriti ograničenja i uvjete naplate. U Vercelu postaviti varijable za Production te pokrenuti novi deployment. Ne lijepiti tajne ključeve u chat ili GitHub.

## Ponašanje

- `POST /api/narrate` s JSON tijelom `{ "text": "Pozdrav" }` vraća MP3 kada je Azure konfiguriran.
- Bez Azure varijabli endpoint vraća HTTP 503, a preglednički TTS ostaje besplatna alternativa.
- `free-narrator.js` sadrži besplatnu pregledničku naraciju i uključuje se tijekom builda preko `prepare-build.cjs`.
- Azure endpoint i preglednički narator trenutačno su zasebne implementacije. Automatski prijelaz s Azurea na preglednički glas treba posebno testirati u korisničkom sučelju.

## Testiranje

1. Provjeriti da je novi Vercel deployment `READY`.
2. Otvoriti knjigu i napraviti hard refresh.
3. Isprobati čitanje hrvatskog teksta i listanje stranica.
4. Provjeriti Vercel runtime logs za greške API-ja bez ispisivanja tajnih ključeva.
