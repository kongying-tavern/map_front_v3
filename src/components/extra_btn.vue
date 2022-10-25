<!-- 左上方的功能按钮，页面的脚注和存档相关的功能页面 -->
<template>
  <div>
    <div class="extra_btn row">
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
        class="btn save"
        @click="openURL('https://yuanshen.site/docs/download-client.html')"
      >
        <q-tooltip> 下载客户端 </q-tooltip>
      </div>
      <div class="btn" v-show="false" @click="check_log_state">
        <q-avatar
          square
          size="64rem"
          font-size="64rem"
          text-color="white"
          icon="mdi-content-save"
        >
        </q-avatar>
      </div>
    </div>
    <q-dialog v-model="save_window">
      <q-card style="max-width: 100vw">
        <q-card-section>
          <q-table
            title="存档列表"
            :rows="save_data"
            :columns="save_columns"
            row-key="name"
            style="min-width: 70vh"
          >
            <!-- 表格头插槽 -->
            <template v-slot:top-right>
              <div class="row">
                <q-btn
                  color="primary"
                  label="新增存档"
                  style="margin-right: 15rem"
                />
                <q-btn color="primary" label="同步" />
              </div>
            </template>
            <template v-slot:body-cell-handle="props">
              <q-td class="text-center">
                <a href="javascript:;" @click="edit_save(props.row)"
                  >修改存档名称</a
                >
                <a href="javascript:;" @click="load_save(props.row)"
                  >读取存档</a
                >
                <a href="javascript:;" @click="delete_save(props.row)"
                  >删除存档</a
                >
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
  <!-- 功能按钮 -->
</template>

<script>
import { date } from "quasar";
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
} from "../api/common";
export default {
  name: "ExtraBtn",
  data() {
    return {
      save_window: false,
      save_data: [],
      save_columns: [
        {
          name: "description",
          align: "center",
          label: "存档名称",
          field: "description",
        },
        {
          name: "created_at",
          align: "center",
          label: "创建时间",
          field: "created_at",
          format: (val) => `${date.formatDate(val, "YYYY-MM-DD HH:mm:ss")}%`,
        },
        {
          name: "updated_at",
          align: "center",
          label: "最后修改时间",
          field: "updated_at",
          format: (val) => `${date.formatDate(val, "YYYY-MM-DD HH:mm:ss")}%`,
        },
        {
          name: "handle",
          align: "center",
          label: "操作",
          field: "handle",
        },
      ],
    };
  },
  methods: {
    openURL,
    //跳转至gitee登录
    log_to_gitee() {
      this.$q
        .dialog({
          title: "跳转提示",
          html: true,
          message: `<div class="text-bold">你即将跳转至gitee进行登录授权</div>
          <div class="text-red text-bold">请记住，空荧酒馆所属产品不会以*任何理由*要求用户使用米哈游通行证登录</div>
          `,
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          window.location.href =
            "https://gitee.com/oauth/authorize?client_id=277ea02bae5fce96d432b7609ba03266482c00ef2d99639c71f5d3389ff01228&redirect_uri=http://localhost:9000/&response_type=code";
        });
    },
    //检查登录状态：如果无code便请求code，如果有code则检查有无access_token，如果有access_token则检查其是否过期
    check_log_state() {
      if (get_Storage("_gitee_usercode") != undefined) {
        if (get_Storage("_gitee_access_token") != undefined) {
          if (get_Cookies("_gitee_access_expires") == null) {
            refresh_gitee_token().then((res) => {
              set_Storage("_gitee_access_token", res.data.access_token);
              set_Cookies("_gitee_access_expires", true, res.data.expires_in);
              set_Storage("_gitee_refresh_token", res.data.refresh_token);
              this.open_save_window();
            });
          } else {
            this.open_save_window();
          }
        } else {
          get_gitee_token().then((res) => {
            set_Storage("_gitee_access_token", res.data.access_token);
            set_Cookies("_gitee_access_expires", true, res.data.expires_in);
            set_Storage("_gitee_refresh_token", res.data.refresh_token);
            this.open_save_window();
          });
        }
      } else {
        this.log_to_gitee();
      }
    },
    //打开存档弹窗，获取存档
    open_save_window() {
      if (this.save_data.length == 0) {
        get_gitee_gist().then((res) => {
          this.save_data = res.data;
          this.save_window = true;
        });
      }
    },
    //编辑存档名称
    edit_save() {},
    //读取存档
    load_save() {},
    //删除存档
    delete_save() {},
  },
};
</script>

<style>
</style>