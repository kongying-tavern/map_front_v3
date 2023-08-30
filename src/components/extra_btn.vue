<template>
  <div>
    <!-- 横向布局 -->
    <div class="extra_btn row orientation-landscape">
      <div
        class="btn feedback"
        @click="openURL('https://yuanshen.site/docs/community.html')"
      >
        <q-tooltip> 加入讨论组 </q-tooltip>
      </div>
      <div
        class="btn discuss"
        @click="openURL('https://support.qq.com/product/321980')"
      >
        <q-tooltip> 反馈/建议 </q-tooltip>
      </div>
      <div
        class="btn desktop-only"
        @click="openURL('https://yuanshen.site/docs/download-client.html')"
      >
        <q-avatar
          square
          size="64rem"
          font-size="64rem"
          text-color="white"
          icon="laptop"
        >
        </q-avatar>
        <q-tooltip> 下载客户端 </q-tooltip>
      </div>
      <div class="btn" @click.alt.ctrl="show_ua" @click.exact="check_log_state">
        <q-avatar
          square
          size="64rem"
          font-size="64rem"
          text-color="white"
          :icon="is_logged ? 'mdi-content-save' : 'mdi-account-outline'"
        >
          <q-badge v-if="save_marked" color="red" rounded floating />
        </q-avatar>
        <q-tooltip v-if="!is_logged"> 登录 </q-tooltip>
        <q-tooltip v-else-if="!save_marked"> 存档 </q-tooltip>
        <q-tooltip v-else> 存档(有改动尚未保存) </q-tooltip>
      </div>
    </div>
    <!-- 纵向布局 -->
    <div class="extra_btn row orientation-portrait">
      <div class="btn" @click="show_bottom_sheet">
        <q-avatar
          square
          size="64rem"
          font-size="64rem"
          text-color="white"
          icon="mdi-dots-horizontal-circle"
        >
        </q-avatar>
        <q-tooltip anchor="center right" self="center left">
          功能菜单
        </q-tooltip>
      </div>
    </div>

    <q-dialog v-model="save_window">
      <div style="max-width: 100vw; max-height: 80vh">
        <save-dialog @load="load_save"></save-dialog>
        <q-inner-loading :showing="loading" style="z-index: 2000">
          <q-spinner-gears size="50rem" color="primary" />
        </q-inner-loading>
      </div>
    </q-dialog>
  </div>
  <!-- 功能按钮 -->
</template>

<script>
import _ from "lodash";
import { Dark, date } from "quasar";
import SaveDialog from "./save_dialogs.vue";
import { mapStores } from "pinia";
import { useCounterStore } from "../stores/example-store";
import { openURL } from "quasar";
import {
  get_gitee_token,
  refresh_gitee_token,
  get_gitee_gist,
} from "../service/user_request";
import {
  set_Cookies,
  set_Storage,
  get_Cookies,
  get_Storage,
  create_notify,
} from "../api/common";
import { client_list } from "../api/client";
import { opNonOfficialMsgShow } from "../api/operation";

export default {
  name: "ExtraBtn",
  data() {
    return {
      save_window: false,
      save_hint_window: false,
      saveid: null,
      save_data: [],
      loading: false,
      add_item: null,
      save_marked: false,
    };
  },
  components: {
    SaveDialog,
  },
  methods: {
    openURL,
    show_ua() {
      this.$q.dialog({
        title: "调试",
        html: true,
        message: `<div>UA: ${window.navigator?.userAgent}</div>`,
      });
    },
    show_bottom_sheet() {
      let options_list = [
        {
          label: "加入讨论组",
          img: "/imgs/icon_feedback.png",
          id: "discuss",
          executor: () => {
            openURL("https://yuanshen.site/docs/community.html");
          },
        },
        {
          label: "反馈/建议",
          img: "/imgs/icon_fankui.png",
          id: "feedback",
          executor: () => {
            openURL("https://support.qq.com/product/321980");
          },
        },
        {
          label: "下载客户端",
          icon: "laptop",
          id: "download-client",
          desktopOnly: true,
          executor: () => {
            openURL("https://yuanshen.site/docs/download-client.html");
          },
        },
        {
          label: () => {
            if (!this.is_logged) {
              return "登录";
            } else if (!this.save_marked) {
              return "存档";
            } else {
              return "存档(有改动尚未保存)";
            }
          },
          icon: () =>
            this.is_logged ? "mdi-content-save" : "mdi-account-outline",
          id: "save",
          executor: () => {
            this.check_log_state();
          },
        },
      ];

      options_list = _.chain(options_list)
        .map((v) => {
          v.label = _.isFunction(v.label) ? v.label() : v.label;
          v.icon = _.isFunction(v.icon) ? v.icon() : v.icon;
          v.img = _.isFunction(v.img) ? v.img() : v.img;

          if (v.desktopOnly && !this.is_desktop) {
            return null;
          }
          return v;
        })
        .filter((v) => v)
        .value();

      this.$q
        .bottomSheet({
          message: "功能菜单",
          class: 'q-pb-lg',
          dark: true,
          grid: true,
          actions: options_list,
        })
        .onOk((action) => {
          action = action || {};
          if (_.isFunction(action.executor)) {
            action.executor();
          }
        });
    },
    //检查登录状态：如果无code便请求code，如果有code则检查有无access_token，如果有access_token则检查其是否过期
    check_log_state() {
      if (this.is_logged) {
        if (get_Storage("_gitee_access_token") != undefined) {
          if (get_Cookies("_gitee_access_expires") == null) {
            refresh_gitee_token().then((res) => {
              set_Storage("_gitee_access_token", res.data.access_token);
              set_Cookies("_gitee_access_expires", true, res.data.expires_in);
              set_Storage("_gitee_refresh_token", res.data.refresh_token);
              this.save_window = true;
            });
          } else {
            this.save_window = true;
          }
        } else {
          get_gitee_token().then((res) => {
            set_Storage("_gitee_access_token", res.data.access_token);
            set_Cookies("_gitee_access_expires", true, res.data.expires_in);
            set_Storage("_gitee_refresh_token", res.data.refresh_token);
            this.save_window = true;
          });
        }
      } else {
        this.log_to_gitee();
      }
    },
    //跳转至gitee登录
    log_to_gitee() {
      this.$q
        .dialog({
          title: "跳转提示",
          html: true,
          message: `
            <div class="text-bold">你即将跳转至 Gitee 进行登录授权</div>
            <div class="text-red text-bold">空荧酒馆所属产品不会以 *任何理由* 要求用户使用米哈游通行证登录或授权，也无法以 *任何方式* 获取您的米哈游通行证的用户信息，敬请知晓</div>
          `,
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          if (process.env.DEV) {
            window.location.href =
              "https://gitee.com/oauth/authorize?client_id=277ea02bae5fce96d432b7609ba03266482c00ef2d99639c71f5d3389ff01228&redirect_uri=http://localhost:9000/&response_type=code";
          } else {
            let randomnum = Math.floor(Math.random() * 200);
            let client_id = client_list[randomnum][0];
            localStorage.setItem("_yuanshenmap_client_id", randomnum);
            window.location.href = `https://gitee.com/oauth/authorize?client_id=${client_id}&redirect_uri=https://yuanshen.site/login.html&response_type=code`;
          }
        });
    },
    //读取存档
    load_save(data) {
      if (this.save_marked) {
        if (
          !confirm(
            "本地有未保存的改动，读取存档会覆盖本地改动，建议您在读取存档之前，保存当前存档",
          )
        ) {
          return;
        }
      }
      this.loading = true;
      get_gitee_gist().then((res) => {
        localStorage.setItem("_yuanshenmap_saveid", data.data.id);
        let cloud_data = res.data.find((item) => item.id == data.data.id);
        let cloud_time = date.formatDate(
          cloud_data.updated_at,
          "YYYY-MM-DD HH:mm:ss",
        );
        localStorage.setItem("_yuanshenmap_save_time", cloud_time);
        this.$emit("load", cloud_data);
        create_notify("读取成功");
        this.loading = false;
        this.save_window = false;
      });
    },
    //自动保存
    auto_save() {
      setInterval(() => {
        this.loading = true;
        get_gitee_gist().then((res) => {
          this.save_data = [];
          this.loading = false;
          for (let i of res.data) {
            if (i.files.Data_KYJG != undefined) {
              this.save_data.push(i);
            }
          }
          if (this.save_marked) {
            create_notify("自动存档中，请稍后", "ongoing");
            this.update_save();
          } else {
            create_notify("同步数据中，请稍后", "ongoing");
            let savedata = this.save_data.find(
              (item) => item.id == this.saveid,
            );
            this.load_save(savedata, false);
          }
        });
      }, 300000);
    },
  },
  mounted() {
    //回调时，记录用户的code
    if (this.$route.query.code != undefined) {
      set_Storage("_gitee_usercode", this.$route.query.code);
      this.$router.push("/");
    }
    this.saveid = localStorage.getItem("_yuanshenmap_saveid");
    if (
      get_Storage("_gitee_usercode") != undefined &&
      get_Storage("_gitee_access_token") == null
    ) {
      get_gitee_token().then((res) => {
        set_Storage("_gitee_access_token", res.data.access_token);
        set_Cookies("_gitee_access_expires", true, res.data.expires_in);
        set_Storage("_gitee_refresh_token", res.data.refresh_token);
        this.save_window = true;
      });
    }

    this.$nextTick(() => {
      opNonOfficialMsgShow();
    });
  },
  computed: {
    //请参考pinia不使用组合式api的用法的说明文档
    //https://pinia.web3doc.top/cookbook/options-api.html
    ...mapStores(useCounterStore),
    is_logged() {
      return get_Storage("_gitee_usercode") != undefined;
    },
    is_desktop() {
      return !!this.$q.platform.is.desktop;
    },
  },
  watch: {
    "mainStore.change_mark": function (val) {
      this.save_marked = val;
    },
  },
};
</script>

<style scoped></style>
