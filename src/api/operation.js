import { ref, computed } from "vue";
import { Dialog } from "quasar";

export const opIsOfficial = computed(() => {
  let ua = (window?.navigator?.userAgent || "").trim();
  if (!ua) {
    return false;
  }

  if (/FusionWeb/giu.test(ua)) {
    return false;
  }

  return true;
});

export const opNonOfficialMsgVisible = ref(false);

export const opNonOfficialMsgShow = () => {
  if (opNonOfficialMsgVisible.value) {
    return;
  }

  if (!opIsOfficial.value) {
    opNonOfficialMsgVisible.value = true;
    Dialog.create({
      title: "【空荧酒馆】通知",
      html: true,
      ok: false,
      cancel: false,
      message: `
          <div class="text-bold">
            <div class="text-red">你使用的软件非官方出品，使用中出现的一切问题我方概不负责。</div>
            <div class="text-red">本地图为 <span class="text-teal">空荧酒馆</span> 提供的网页版本。</div>
            <div>&nbsp;</div>
            <div><span class="text-teal">空荧酒馆</span> 暂未提供手机客户端</div>
            <div>手机请使用官网：<a target="_blank" href="https://yuanshen.site">yuanshen.site</a></div>
            <div>电脑客户端下载：<a target="_blank" href="https://yuanshen.site/docs/download-client">点此下载</a></div>
            <div>&nbsp;</div>
            <div>急缺美术，如果您是 UI/UX 设计师，可以 <a target="_blank" href="https://yuanshen.site/docs/join">加入开发</a>，以推进移动端开发进度</div>
          </div>
        `,
      persistent: true,
    });
  }
};
