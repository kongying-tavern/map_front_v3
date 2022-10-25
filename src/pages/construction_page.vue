<!-- 地图施工页 -->
<template>
  <div class="bg">
    <div class="infos">
      <span class="icon"></span>
      <div class="title1">网页版地图正在施工中</div>
      <div class="row justify-center" style="margin-top: 15px">
        <div class="btn">
          <div class="btn-text" @click="to_index">试用测试版</div>
        </div>
      </div>
      <div class="row justify-center" style="margin-top: 15px">
        <div class="title3">或者，不妨来试试全新的</div>
        <span class="title3_hint">3.1地图客户端版本</span>
      </div>
      <div class="row justify-center" style="margin-top: 15px">
        <div class="btn">
          <div
            class="btn-text"
            @click="openURL('https://yuanshen.site/docs/download-client.html')"
          >
            前往下载
          </div>
        </div>
        <div class="btn">
          <div
            class="btn-text"
            @click="openURL('https://yuanshen.site/index.html')"
          >
            浏览旧版地图
          </div>
        </div>
      </div>
    </div>
  </div>
<div id="map" style="position: relative;z-index: 9999;">
  <div class="leaflet-control-container"><div class="leaflet-bottom leaflet-left"><div class="leaflet-control-attribution leaflet-control">
      <footer role="contentinfo" class="footer">
        <a href="/docs/disclaimer.html" target="_blank" title="空荧酒馆免责声明">免责声明</a>
        <a href="/join" target="_blank" title="加入我们">招募</a>
        <a href="https://support.qq.com/products/321980/blog/505810" target="_blank" rel="noopener noreferrer" title="空荧酒馆原神地图更新日志">更新日志</a>
        <a href="https://github.com/kongying-tavern" target="_blank" rel="noopener noreferrer" title="GitHub">GitHub</a>
        <a href="http://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" title="工业和信息化部域名信息备案管理系统">蜀ICP备2020028219号-1</a>
      </footer>
		</div></div><div class="leaflet-bottom leaflet-right"></div></div></div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import { openURL } from "quasar";
export default {
  name: "ConstructionPage",
  methods: {
    openURL,
    to_index() {
      this.$router.push("/index");
    },
  },
  mounted() {},
};
</script>
<style lang="scss" scoped>
.leaflet-control-container .leaflet-control{
	background-color: rgba(255, 255, 255, .7);
	backdrop-filter: blur(10px);
	text-shadow: 0 0 20px rgb(0 0 0 / 80%);
	transition: all .3s;
	margin: 0;
	}
  .footer {
  display: table-cell;
  width: fit-content;
  float: left;
  user-select: none;
  padding: 1px 5px;
  font-size: 11px;
  white-space: normal;
  transition: all 0.3s;
}

.footer a {
  font-weight: 500;
  color: #0078a8;
  overflow-wrap: break-word;
}

.footer a:not(:last-child) {
  margin-right: 8px;
}
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
