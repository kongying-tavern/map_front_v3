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
        class="btn save desktop-only"
        @click="openURL('https://yuanshen.site/docs/download-client.html')"
      >
        <q-tooltip> 下载客户端 </q-tooltip>
      </div>
      <div class="btn" @click="check_log_state">
        <q-avatar
          square
          size="64rem"
          font-size="64rem"
          text-color="white"
          icon="mdi-content-save"
        >
          <q-badge v-if="save_marked" color="red" rounded floating />
        </q-avatar>
        <q-tooltip v-if="!save_marked"> 存档 </q-tooltip>
        <q-tooltip v-else> 存档(有改动尚未保存) </q-tooltip>
      </div>
    </div>
    <q-dialog v-model="save_window">
      <q-card style="max-width: 100vw">
        <q-card-section>
          <q-table
            title="存档列表"
            :rows="save_data"
            :columns="save_columns"
            row-key="id"
            :rows-per-page-options="[0]"
            style="min-width: 70vh"
          >
            <!-- 表格头插槽 -->
            <template v-slot:top-right>
              <div class="row">
                <q-btn
                  color="primary"
                  label="新建存档"
                  @click="add_save"
                  style="margin-right: 15rem"
                />
                <q-btn
                  color="primary"
                  label="保存"
                  style="margin-right: 15rem"
                  @click="update_save"
                >
                  <q-badge v-if="save_marked" color="red" rounded floating />
                  <q-tooltip v-if="save_marked"> 有改动尚未保存 </q-tooltip>
                </q-btn>
                <q-btn color="red" label="注销" @click="log_out" />
              </div>
            </template>
            <template v-slot:body-cell-state="props">
              <q-td class="text-center handles">
                <div v-if="saveid == props.row.id" class="text-red text-bold">
                  激活中
                </div>
                <div v-else class="text-grey">未激活</div>
                <!-- <q-radio v-model="saveid" :val="props.row.id" :disable="true" /> -->
              </q-td>
            </template>
            <template v-slot:body-cell-handle="props">
              <q-td class="text-center handles">
                <a
                  href="javascript:;"
                  @click="edit_save(props.row)"
                  style="margin-right: 10px"
                  >重命名</a
                >
                <a
                  href="javascript:;"
                  @click="load_save(props.row)"
                  style="margin-right: 10px"
                  >读档</a
                >
                <a
                  href="javascript:;"
                  v-if="saveid != props.row.id"
                  @click="delete_save(props.row)"
                  >删除存档</a
                >
              </q-td>
            </template>
          </q-table>
        </q-card-section>
        <q-inner-loading :showing="loading">
          <q-spinner-gears size="50rem" color="primary" />
        </q-inner-loading>
      </q-card>
    </q-dialog>
  </div>
  <!-- 功能按钮 -->
</template>

<script>
import { mapStores } from "pinia";
import { useCounterStore } from "../stores/example-store";
import { date } from "quasar";
import { openURL } from "quasar";
import {
  get_gitee_token,
  refresh_gitee_token,
  get_gitee_gist,
  add_gitee_gist,
  delete_gitee_gist,
  edit_gitee_gist,
} from "../service/user_request";
import {
  set_Cookies,
  set_Storage,
  get_Cookies,
  get_Storage,
  create_notify,
} from "../api/common";
import { client_list } from "../api/client";
export default {
  name: "ExtraBtn",
  data() {
    return {
      save_window: false,
      save_hint_window: false,
      save_data: [],
      save_columns: [
        {
          name: "state",
          align: "center",
          label: "状态",
          field: "state",
        },
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
          format: (val) => `${date.formatDate(val, "YYYY-MM-DD HH:mm:ss")}`,
        },
        {
          name: "updated_at",
          align: "center",
          label: "最后修改时间",
          field: "updated_at",
          format: (val) => `${date.formatDate(val, "YYYY-MM-DD HH:mm:ss")}`,
        },
        {
          name: "handle",
          align: "center",
          label: "操作",
          field: "handle",
        },
      ],
      save_arr: [],
      local_arr: [],
      selected: [],
      saveid: null,
      loading: false,
      add_item: null,
      save_marked: false,
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
          <div class="text-red text-bold">空荧酒馆所属产品不会以*任何理由*要求用户使用米哈游通行证登录或授权，也无法以*任何方式*获取您的米哈游通行证的用户信息，敬请知晓</div>
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
    //获取存档
    get_saves() {
      this.loading = true;
      this.save_data = [];
      get_gitee_gist().then((res) => {
        this.loading = false;
        for (let i of res.data) {
          if (i.files.Data_KYJG != undefined) {
            this.save_data.push(i);
          }
        }
      });
    },
    //打开存档弹窗，获取存档
    open_save_window(refresh = true) {
      if (this.save_data.length == 0 && refresh) {
        this.loading = true;
        get_gitee_gist().then((res) => {
          this.loading = false;
          for (let i of res.data) {
            if (i.files.Data_KYJG != undefined) {
              this.save_data.push(i);
            }
          }
          this.save_window = true;
        });
      } else {
        this.save_window = true;
      }
    },
    //新增存档
    async add_save(event, savename = "新的存档", hint = true) {
      this.loading = true;
      let marked_layers = JSON.parse(localStorage.getItem("marked_layers"));
      let marked_timelayers = JSON.parse(
        localStorage.getItem("marked_timelayers")
      );
      for (let i in marked_layers) {
        marked_layers[i] = marked_layers[i].toString();
      }
      let data = {
        files: {
          Data_KYJG: { content: JSON.stringify(marked_layers) },
          Time_KYJG: { content: JSON.stringify(marked_timelayers) },
        },
        description: savename,
      };
      await add_gitee_gist(data)
        .then((res) => {
          this.loading = false;
          if (res.status == 201) {
            create_notify("创建成功！");
            this.get_saves();
          }
          this.add_item = res;
        })
        .catch((error) => {
          create_notify(`创建失败！${error.response.data.message}`, "negative");
        });
    },
    //编辑存档名称
    edit_save(save) {
      this.$q
        .dialog({
          message: "请输入新的存档名称",
          prompt: {
            model: "",
            isValid: (val) => val.length > 0,
            type: "text", // optional
          },
          cancel: true,
        })
        .onOk((data) => {
          this.loading = true;
          let update_data = {
            id: save.id,
            description: data,
          };
          edit_gitee_gist(update_data)
            .then((res) => {
              this.loading = false;
              if (res.status == 200) {
                create_notify("修改成功！");
              }
              this.get_saves();
            })
            .catch((error) => {
              create_notify(
                `修改失败！${error.response.data.message}`,
                "negative"
              );
            });
        });
    },
    //检验存档同步性
    save_sync_check(data) {
      localStorage.setItem("_yuanshenmap_saveid", data);
    },
    //读取存档
    load_save(data, hint = true) {
      if (this.saveid != data.id) {
        if (this.save_marked) {
          if (confirm("建议您在切换存档前保存当前存档，是否继续切换？")) {
            this.saveid = data.id;
            localStorage.setItem("_yuanshenmap_saveid", this.saveid);
            if (hint) {
              create_notify("读取成功");
            }
            this.save_window = false;
            this.$emit("load", data);
            this.mainStore.change_mark = false;
          }
        } else {
          this.saveid = data.id;
          localStorage.setItem("_yuanshenmap_saveid", this.saveid);
          if (hint) {
            create_notify("读取成功");
          }
          this.save_window = false;
          this.$emit("load", data);
          this.mainStore.change_mark = false;
        }
      }
    },
    //删除存档
    delete_save(data) {
      if (confirm("你确定要删除存档吗?")) {
        delete_gitee_gist(data).then((res) => {
          if (res.status == 204) {
            create_notify("删除成功！");
            this.get_saves();
          }
        });
      }
    },
    //上传存档
    update_save() {
      this.loading = true;
      this.mainStore.change_mark = false;
      this.$emit("loading");
      let savedata = this.save_data.find((item) => item.id == this.saveid);
      let marked_layers = JSON.parse(localStorage.getItem("marked_layers"));
      let marked_timelayers = JSON.parse(
        localStorage.getItem("marked_timelayers")
      );
      for (let i in marked_layers) {
        marked_layers[i] = marked_layers[i].toString();
      }
      let update_data = {
        id: savedata.id,
        files: {
          Data_KYJG: { content: JSON.stringify(marked_layers) },
          Time_KYJG: { content: JSON.stringify(marked_timelayers) },
        },
      };
      edit_gitee_gist(update_data)
        .then((res) => {
          this.$emit("loading");
          this.loading = false;
          if (res.status == 200) {
            create_notify("保存成功！");
          }
          this.get_saves();
        })
        .catch((error) => {
          create_notify(`保存失败！${error.response.data.message}`, "negative");
        });
    },
    //登出
    log_out() {
      if (confirm("你确定要登出吗？")) {
        localStorage.removeItem("_gitee_usercode");
        window.location.reload();
      }
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
              (item) => item.id == this.saveid
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
    //如果登录了，检测是否有存档的逻辑
    if (
      get_Storage("_gitee_usercode") != undefined &&
      get_Storage("_gitee_access_token") == null
    ) {
      get_gitee_token().then((res) => {
        set_Storage("_gitee_access_token", res.data.access_token);
        set_Cookies("_gitee_access_expires", true, res.data.expires_in);
        set_Storage("_gitee_refresh_token", res.data.refresh_token);
        if (this.saveid == null) {
          let arr = JSON.parse(localStorage.getItem("marked_layers"));
          if (arr.length != 0) {
            alert("检测到你有本地存档未上传至云端，已自动为您新建存档");
            this.add_save().then(() => {
              this.open_save_window(false);
              this.saveid = this.add_item.data.id;
              localStorage.setItem(
                "_yuanshenmap_saveid",
                this.add_item.data.id
              );
            });
          }
        } else {
          this.$emit("loading");
          get_gitee_gist().then((res) => {
            this.$emit("loading");
            for (let i of res.data) {
              if (i.files.Data_KYJG != undefined) {
                this.save_data.push(i);
              }
            }
            let data = this.save_data.find((item) => item.id == this.saveid);
            this.load_save(data, false);
          });
        }
        this.auto_save();
      });
    }
  },
  computed: {
    //请参考pinia不使用组合式api的用法的说明文档
    //https://pinia.web3doc.top/cookbook/options-api.html
    ...mapStores(useCounterStore),
  },
  watch: {
    "mainStore.change_mark": function (val) {
      this.save_marked = val;
    },
  },
};
</script>

<style scoped>
</style>
