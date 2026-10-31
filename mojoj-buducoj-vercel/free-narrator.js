// Free browser-based narration. No external API or paid service.
(() => {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    const b = document.getElementById('tool-narrate');
    if (b) b.onclick = () => notify('Ovaj preglednik ne podržava glasovno čitanje.');
    return;
  }
  const synth = window.speechSynthesis;
  const originalStop = stopNarration;
  stopNarration = function() {
    synth.cancel();
    originalStop();
  };
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  const readPart = (text, token) => new Promise((resolve, reject) => {
    if (!narrating || token !== narrationToken) return resolve();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = preferredNarrator();
    if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
    else utterance.lang = 'hr-HR';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => resolve();
    utterance.onerror = event => event.error === 'canceled' || event.error === 'interrupted'
      ? resolve() : reject(new Error('Glasovno čitanje nije uspjelo: ' + event.error));
    synth.speak(utterance);
  });
  speakSpread = async function() {
    const text = spreadText().trim();
    if (!text || !narrating) return;
    const token = ++narrationToken;
    const voices = synth.getVoices();
    if (!voices.length) {
      await Promise.race([new Promise(resolve => synth.addEventListener('voiceschanged', resolve, {once:true})), pause(1200)]);
    }
    for (const segment of narrationSegments(text)) {
      if (!narrating || token !== narrationToken) return;
      await readPart(segment, token);
      if (!narrating || token !== narrationToken) return;
      await pause(/[.!?…]$/.test(segment) ? 280 : 100);
    }
  };
  const narrator = document.getElementById('tool-narrate');
  narrator.title = 'Besplatni narator (glas preglednika)';
  narrator.onclick = () => {
    if (narrating) { stopPlayback(); readerGeneration++; return; }
    synth.cancel();
    narrating = true;
    autoReading = true;
    narrator.classList.add('active');
    narrator.setAttribute('aria-pressed', 'true');
    const auto = document.getElementById('tool-auto');
    if (auto) { auto.classList.add('active'); auto.setAttribute('aria-pressed', 'true'); }
    notify('Besplatni narator: čitanje i automatsko listanje.');
    narrationLoop();
  };
})();
