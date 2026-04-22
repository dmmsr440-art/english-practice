// TTS（Web Speech API）
// - 英語音声で読み上げ
// - 声の選択はブラウザ任せ（en-US優先）

let cachedVoice = null;

function pickVoice() {
    if (cachedVoice) return cachedVoice;
    const voices = window.speechSynthesis?.getVoices() || [];
    cachedVoice =
        voices.find(v => v.lang === "en-US") ||
        voices.find(v => v.lang?.startsWith("en")) ||
        voices[0] ||
        null;
    return cachedVoice;
}

// 音声リスト読み込みは非同期のことがある
if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        cachedVoice = null;
        pickVoice();
    };
    pickVoice();
}

export function speak(text, { rate = 0.95, pitch = 1 } = {}) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.lang = v?.lang || "en-US";
    u.rate = rate;
    u.pitch = pitch;
    window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
}
