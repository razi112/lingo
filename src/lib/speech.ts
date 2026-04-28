
export const speak = (text: string, lang: string = 'en-US') => {
  if (!window.speechSynthesis) {
    console.error("Speech synthesis not supported");
    return;
  }

  const doSpeak = () => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Look for high-quality English voices
    const preferredVoice = voices.find(v => 
      (v.lang.startsWith('en') && v.name.includes('Google')) ||
      (v.lang === 'en-US' && (v.name.includes('Natural') || v.name.includes('Enhanced'))) ||
      (v.lang === 'en-GB' && (v.name.includes('Natural') || v.name.includes('Enhanced')))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.lang = lang;
    utterance.rate = 0.85; // Clarity focus
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log("Voices loaded:", voices.length);
        doSpeak();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
    window.speechSynthesis.onvoiceschanged = checkVoices;
    // Fallback if event doesn't fire
    setTimeout(checkVoices, 200);
  } else {
    doSpeak();
  }
};

export const createSpeechRecognition = () => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error("Speech recognition not supported");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  return recognition;
};
