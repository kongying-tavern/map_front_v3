import { toneIsSupported, tonePlay } from "./tone";

const rythmAranaNotes = {
  大梦的曲调: [
    // 大梦的曲调
    { key: "F", beat: 1, gap: 1 },
    { key: "♭E", beat: 0.25, gap: 1 },
    { key: "G", beat: 0.25, gap: 1 },
    { key: "F", beat: 0.5, gap: 1 },
    { key: "C", beat: 0.5, gap: 1 },
  ],
  桓摩的曲调: [
    // 桓摩的曲调
    { key: "F", beat: 1, gap: 1 },
    { key: "♭E", beat: 0.5, gap: 1 },
    { key: "♭E", beat: 0.5, gap: 1 },
    { key: "♭D", beat: 0.5, gap: 1 },
    { key: "C", beat: 0.5, gap: 1 },
  ],
  黯道的曲调: [
    // 黯道的曲调
    { key: "♭E", beat: 1, gap: 1 },
    { key: "♭D", beat: 0.15, gap: 1 },
    { key: "♭E", beat: 0.35, gap: 1 },
    { key: "♭D", beat: 0.5, gap: 1 },
    { key: "♭A", beat: 1, gap: 1 },
  ],
  兽径的曲调: [
    // 兽径的曲调
    { key: "C", beat: 0.5, gap: 0 },
    { key: "G", beat: 0.5, gap: 0 },
    { key: "A", beat: 0.5, gap: 0 },
    { key: "♭E", beat: 0.5, gap: 0 },
    { key: "C", beat: 1, gap: 0 },
  ],
  新芽的曲调: [
    // 新芽的曲调
    { key: "C", beat: 0.25, gap: 0 },
    { key: "G", beat: 0.25, gap: 0 },
    { key: "G", beat: 0.5, gap: 0 },
    { key: "A", beat: 0.5, gap: 0 },
    { key: "♭B", beat: 1.5, gap: 0 },
  ],
  源水的曲调: [
    // 源水的曲调
    { key: "F", beat: 1, gap: 1 },
    { key: "♭E", beat: 0.25, gap: 1 },
    { key: "♭B", beat: 0.25, gap: 1 },
    { key: "F", beat: 0.5, gap: 1 },
    { key: "♭B", beat: 1.5, gap: 0 },
  ],
  苏生的曲调: [
    // 苏生的曲调
    { key: "D", beat: 0.25, gap: 1 },
    { key: "C", beat: 0.5, gap: 1 },
    { key: "♭B", beat: 0.5, gap: 0 },
    { key: "G", beat: 0.5, gap: 0 },
    { key: "C", beat: 1, gap: 0 },
  ],
};

const rythmAranaMatchKeywords = {
  大梦的曲调: "大梦的曲调",
  修梨薜那: "大梦的曲调",
  幻梦之门: "大梦的曲调",
  桓摩的曲调: "桓摩的曲调",
  桓摩达: "桓摩的曲调",
  黯道的曲调: "黯道的曲调",
  林中黯道: "黯道的曲调",
  兽径的曲调: "兽径的曲调",
  幽闭花: "兽径的曲调",
  新芽的曲调: "新芽的曲调",
  健壮的草种子: "新芽的曲调",
  源水的曲调: "源水的曲调",
  法留纳法宝: "源水的曲调",
  苏生的曲调: "苏生的曲调",
  苦舍桓: "苏生的曲调",
};

const rythmAranaMatchRegex = new RegExp(
  `(?<name>${Object.keys(rythmAranaMatchKeywords).join("|")})`,
  "ui",
);

export const rythmAranaIsSupported = (text = "") => !!rythmAranaGetKey(text);

export const rythmAranaGetKey = (text = "") =>
  rythmAranaMatchKeywords[
    (text || "").match(rythmAranaMatchRegex)?.groups?.name
  ] || "";

export const rythmAranaPlay = (text = "") => {
  if (!toneIsSupported.value) {
    return;
  }

  const matchKey = rythmAranaGetKey(text);
  const matchRythm = rythmAranaNotes[matchKey] || [];

  if (matchRythm && matchRythm.length > 0) {
    tonePlay(matchRythm);
  }
};
