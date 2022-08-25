<template>
  <div class="bg">
    <div class="infos">
      <span class="icon"></span>
      <div class="title1">{{ $t("title1") }}</div>
      <div class="row justify-center" style="margin-top: 15px">
        <div class="btn">
          <div
            class="btn-text"
            @click="to_index"
          >
            {{ $t("btn_text3") }}
          </div>
        </div>
      </div>
      <div class="row justify-center" style="margin-top: 15px">
        <div class="title3">{{ $t("title3") }}</div>
        <span class="title3_hint">{{ $t("title3_hint") }}</span>
      </div>
      <div class="row justify-center" style="margin-top: 15px">
        <div class="btn">
          <div
            class="btn-text"
            @click="openURL('https://yuanshen.site/docs/download-client.html')"
          >
            {{ $t("btn_text1") }}
          </div>
        </div>
        <div class="btn">
          <div
            class="btn-text"
            @click="openURL('https://yuanshen.site/index.html')"
          >
            {{ $t("btn_text2") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { openURL } from "quasar";
export default {
  name: "ConstructionPage",
  methods: {
    openURL,
    to_index(){
      this.$router.push('/index');
    }
  },
  mounted() {
    this.$i18n.locale = this.$q.lang.getLocale();
    let area = this.$i18n.locale;
    if (area != "zh-CN" && area != "ja") {
      this.$i18n.locale = "en-US";
    }
    document.title = this.$t("page_title");
  },
};
</script>
<style lang="scss" scoped>
.bg {
  width: 100vw;
  height: 100vh;
  background: #424b63;
  overflow: hidden;
  .infos {
    width: 100vw;
    position: absolute;
    top: 100px;
  }
  .icon {
    display: block;
    width: 119px;
    height: 202px;
    margin: 0 auto;
    background: url(/imgs/construction_title_icon.png) no-repeat;
  }
  .title1 {
    width: 100%;
    margin: 40px 0 0 0;
    text-align: center;
    font-size: 34px;
    color: #fff;
  }
  .title2 {
    width: 100%;
    margin: 16px 0 0 0;
    text-align: center;
    font-size: 20px;

    color: #374056;
  }
  .title3 {
    text-align: center;
    font-size: 28px;

    color: #fff;
  }
  .title3_hint {
    text-align: center;
    font-size: 28px;

    color: #ffc147;
  }
  .btn {
    width: 327px;
    height: 88px;
    background: url(/imgs/construction_btn.png) no-repeat;
    background-size: 100% 100%;
    margin: 0 35px 0;
    cursor: pointer;
    .btn-text {
      width: 100%;
      height: 100%;
      text-align: center;
      font-size: 32px;
      color: #424b63;
      line-height: 88px;
    }
  }
  @media screen and (max-width: 400px) {
    .btn {
      zoom: 0.45;
    }
    .infos {
      top: 50px;
    }
  }
}
</style>
