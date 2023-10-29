import { computed } from "vue";

const toneConstructor = window.AudioContext || window.webkitAudioContext;

export const toneIsSupported = computed(() => !!toneConstructor);

export const toneFreqBase = 440; // Note 'A'

export const toneFreqCalc = (freq = 0, step = 0) =>
  freq * Math.pow(2, step / 12);

export const toneNotes = {
  C: toneFreqCalc(toneFreqBase, -9), // Do    C
  "♭D": toneFreqCalc(toneFreqBase, -8), //       ♯C    ♭D
  D: toneFreqCalc(toneFreqBase, -7), // Re    D
  "♭E": toneFreqCalc(toneFreqBase, -6), //       ♯D    ♭E
  E: toneFreqCalc(toneFreqBase, -5), // Mi    E
  F: toneFreqCalc(toneFreqBase, -4), // Fa    F
  "♭G": toneFreqCalc(toneFreqBase, -3), //       ♯F    ♭G
  G: toneFreqCalc(toneFreqBase, -2), // So    G
  "♭A": toneFreqCalc(toneFreqBase, -1), //       ♯G    ♭A
  A: toneFreqCalc(toneFreqBase, 0), // La    A
  "♭B": toneFreqCalc(toneFreqBase, 1), //       ♯A    ♭B
  B: toneFreqCalc(toneFreqBase, 2), // Ti    B
};

export const toneNormalizeNote = (noteKey = "") => {
  if (!noteKey) {
    return "";
  }

  // Normalize sharp and flat marks
  if (noteKey.match(/^b[CDEFGAB]/giu)) {
    noteKey = noteKey.replace(/^b/giu, "♭");
  }
  if (noteKey.match(/^#[CDEFGAB]/giu)) {
    noteKey = noteKey.replace(/^#/giu, "♯");
  }

  // Change sharps to equivalent flats
  const noteKeySequence = "CDEFGAB";
  const reTransSharp2Flat = /♯(?<key>[CDFGA])/iu;
  const reTransSharp2Norm = /♯(?<key>[EB])/iu;
  const reTransFlat2Norm = /♭(?<key>[CF])/iu;
  let reTransMatch = null;
  if ((reTransMatch = noteKey.match(reTransSharp2Flat))) {
    const key = reTransMatch?.groups?.key || "";
    const keyIndex = noteKeySequence.indexOf(key);
    const nextIndex = (keyIndex + 1) % noteKeySequence.length;
    noteKey = `♭${noteKeySequence.substring(nextIndex, nextIndex + 1)}`;
  } else if ((reTransMatch = noteKey.match(reTransSharp2Norm))) {
    const key = reTransMatch?.groups?.key || "";
    const keyIndex = noteKeySequence.indexOf(key);
    const nextIndex = (keyIndex + 1) % noteKeySequence.length;
    noteKey = noteKeySequence.substring(nextIndex, nextIndex + 1);
  } else if ((reTransMatch = noteKey.match(reTransFlat2Norm))) {
    const key = reTransMatch?.groups?.key || "";
    const keyIndex = noteKeySequence.indexOf(key);
    const prevIndex =
      (keyIndex + noteKeySequence.length - 1) % noteKeySequence.length;
    noteKey = noteKeySequence.substring(prevIndex, prevIndex + 1);
  }
  return noteKey;
};

export const tonePlay = (noteList = [], bpm = 60) => {
  if (!toneIsSupported.value) {
    return;
  }

  const beatPeriod = 60 / bpm;
  const context = new toneConstructor();
  const osc = context.createOscillator();
  const gainNode = context.createGain();
  osc.type = "sine";
  let timeline = 0;

  for (let noteItem of noteList) {
    const key = noteItem.key;
    const keyNormalized = toneNormalizeNote(key);
    const shift = (+noteItem.gap | 0) * 12;
    const noteFreq =
      shift !== 0
        ? toneFreqCalc(toneNotes[keyNormalized], shift)
        : toneNotes[keyNormalized];
    const duration = (+noteItem.beat || 0) * beatPeriod;

    osc?.frequency?.setValueAtTime(noteFreq, timeline);
    gainNode?.gain?.setValueAtTime(0, timeline);
    gainNode?.gain?.linearRampToValueAtTime(1, timeline + 0.01 * duration);
    gainNode?.gain?.exponentialRampToValueAtTime(0.5, timeline + duration);

    timeline += duration;
  }

  osc?.connect(gainNode);
  gainNode?.connect(context?.destination);
  osc?.start();
  osc?.stop(timeline);
};
