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
      message: `
          <div class="text-bold">
            <div class="text-red">本地图由 <span class="text-teal">空荧酒馆</span> 提供，但您当前可能正使用非官方软件访问该页面。</div>
            <div class="text-red">非官方应用访问此地图会产生色差，为正常现象。</div>
            <div>&nbsp;</div>
            <div>官方声明：</div>
            <div>网页版地址：<a target="_blank" href="https://yuanshen.site/">https://yuanshen.site/</a></div>
            <div>PC客户端下载：<a target="_blank" href="https://yuanshen.site/docs/download-client">点击此处</a></div>
            <div>&nbsp;</div>
            <div>目前 <span class="text-teal">空荧酒馆</span> 暂未提供手机版，<br>可使用网页版，或 <a target="_blank" href="https://yuanshen.site/docs/join">加入开发</a></div>
          </div>
        `,
      persistent: true,
    }).onOk(() => {
      opNonOfficialMsgVisible.value = false;
    });
  }
};
