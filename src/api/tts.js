import { ref, computed } from "vue";

export const ttsIsSupported = computed(
  () => !!window?.SpeechSynthesisUtterance && !!window?.speechSynthesis,
);

export const ttsSpeechPlayer = window?.SpeechSynthesisUtterance
  ? new window.SpeechSynthesisUtterance()
  : null;

export const ttsIsPlaying = ref(false);

if (ttsSpeechPlayer) {
  ttsSpeechPlayer.lang = "zh-CN";
  ttsSpeechPlayer.pitch = 1.5;
  ttsSpeechPlayer.onstart = () => {
    ttsIsPlaying.value = true;
  };
  ttsSpeechPlayer.onend = () => {
    ttsIsPlaying.value = false;
  };
}

export const ttsSpeechPlay = (text = "") => {
  if (!ttsIsSupported.value) {
    return;
  }

  if (ttsIsPlaying.value) {
    window?.speechSynthesis.cancel();
    ttsIsPlaying.value = false;
  } else {
    text = (text || "").replace(/[【】]/giu, "");
    ttsSpeechPlayer.text = text;
    window?.speechSynthesis.cancel();
    window?.speechSynthesis.speak(ttsSpeechPlayer);
  }
};
