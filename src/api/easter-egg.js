import { ref } from "vue";
import { onKeyUp } from "@vueuse/core";
import { create_notify } from "src/api/common";
import { areaSelectorDom } from "./area";

export const easterEggMode = ref(false);
export const easterEggSequence = ref([]);
export const easterEggMotionClass = ref([]);
export const easterEggMotionDom = ref(null);

const easterShortKeyAllow = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "KeyA",
  "KeyB",
];
const easterShortKeyClass = {
  ArrowLeft: "key_arrow_left",
  ArrowRight: "key_arrow_right",
  ArrowUp: "key_arrow_up",
  ArrowDown: "key_arrow_down",
  KeyA: "key_a",
  KeyB: "key_b",
};
const easterShortKeyIgnore = [
  "Tab",
  "CapsLock",
  "ShiftLeft",
  "ShiftRight",
  "AltLeft",
  "AltRight",
  "ControlLeft",
  "ControlRight",
  "Space",
  "Enter",
];
const easterEggOnSeq = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
  "KeyB",
  "KeyA",
];
const easterEggOnSeqLen = easterEggOnSeq.length;
const easterEggOnSeqStr = easterEggOnSeq.join("|");
const easterEggOffSeq = [
  "ArrowDown",
  "ArrowDown",
  "ArrowUp",
  "ArrowUp",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "KeyA",
  "KeyB",
  "KeyA",
  "KeyB",
];
const easterEggOffSeqLen = easterEggOffSeq.length;
const easterEggOffSeqStr = easterEggOffSeq.join("|");

export const easterEggMotionHanlder = () => {
  easterEggMotionClass.value = [];
};

export const easterEggKeyBind = () => {
  onKeyUp(
    (e) => {
      easterEggMotionDom.value.removeEventListener(
        "animationend",
        easterEggMotionHanlder,
      );
      easterEggMotionDom.value.addEventListener(
        "animationend",
        easterEggMotionHanlder,
      );

      let code = e.code || "";
      if (easterShortKeyIgnore.indexOf(code) !== -1) {
        return;
      } else if (easterShortKeyAllow.indexOf(code) !== -1) {
        const className = easterShortKeyClass[code] || "";
        const classArr = className ? ["key_motion", className] : [];

        easterEggSequence.value.push(code);
        easterEggMotionClass.value = classArr;
      } else {
        easterEggSequence.value = [];
      }

      if (
        easterEggSequence.value.length >= easterEggOnSeqLen &&
        easterEggSequence.value.slice(-easterEggOnSeqLen).join("|") ===
          easterEggOnSeqStr
      ) {
        if (!easterEggMode.value) {
          create_notify("输入秘笈成功！开启隐藏模式！", "", "bottom");
        }
        easterEggMode.value = true;
        easterEggSequence.value = [];
      } else if (
        easterEggSequence.value.length >= easterEggOffSeqLen &&
        easterEggSequence.value.slice(-easterEggOffSeqLen).join("|") ===
          easterEggOffSeqStr
      ) {
        if (easterEggMode.value) {
          create_notify("输入秘笈成功！关闭隐藏模式！", "", "bottom");
        }
        easterEggMode.value = false;
        easterEggSequence.value = [];
      }
    },
    {
      target: areaSelectorDom.value,
    },
  );
};
