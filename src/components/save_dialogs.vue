<template>
  <div class="saves">
    <div class="pc_saves desktop-only">
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
              <!-- <q-badge v-if="save_marked" color="red" rounded floating />
            <q-tooltip v-if="save_marked"> 有改动尚未保存 </q-tooltip> -->
            </q-btn>
            <q-btn color="red" label="注销" @click="log_out" />
          </div>
        </template>
        <template v-slot:body-cell-state="props">
          <q-td class="text-center handles">
            <div v-if="save_id == props.row.id" class="text-red text-bold">
              激活中
            </div>
            <div v-else class="text-grey">未激活</div>
          </q-td>
        </template>
        <template v-slot:body-cell-handle="props">
          <q-td class="text-center handles">
            <a
              href="javascript:;"
              @click="edit_save_name(props.row)"
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
              v-if="save_id != props.row.id"
              @click="delete_save(props.row)"
              >删除存档</a
            >
          </q-td>
        </template>
      </q-table>
    </div>
    <div class="mobile-only">
      <q-card class="q-pa-sm mobile_saves scroll">
        <div class="title row items-center justify-between">
          <div class="text text-bold">存档列表</div>
          <div class="btns row items-center">
            <q-icon
              name="mdi-plus-circle"
              color="primary"
              size="28px"
              @click="add_save"
            />
            <q-icon
              name="mdi-arrow-up-bold-circle"
              style="margin-left: 5px"
              @click="update_save"
              color="secondary"
              size="28px"
            />
            <q-icon
              name="mdi-minus-circle"
              style="margin-left: 5px"
              @click="log_out"
              color="red"
              size="28px"
            />
            <q-icon
              name="mdi-close"
              style="margin-left: 5px"
              size="28px"
              v-close-popup
            />
          </div>
        </div>
        <div
          v-for="(i, index) in save_data"
          :key="index"
          class="mobile_save_container q-pa-sm"
          :class="{ on: save_id == i.id }"
        >
          <div
            class="row items-center justify-between"
            style="margin-bottom: 10px"
          >
            <div class="title text-bold" :class="{ on: save_id == i.id }">
              {{
                save_id == i.id ? `${i.description}(当前激活)` : i.description
              }}
            </div>
            <div class="btns row justify-end">
              <q-icon
                name="mdi-arrow-down-circle"
                color="primary"
                size="26px"
                @click="load_save(i)"
              />
              <q-icon
                name="mdi-pencil-circle"
                color="secondary"
                size="26px"
                @click="edit_save_name(i)"
                style="margin-left: 3px"
              />
              <q-icon
                name="mdi-delete"
                color="red"
                size="26px"
                style="margin-left: 3px"
                v-if="save_id != i.id"
                @click="delete_save(i)"
              />
            </div>
          </div>
          <div class="date">创建时间：{{ dateformat(i.created_at) }}</div>
          <div class="date">最后更新时间:{{ dateformat(i.updated_at) }}</div>
        </div>
      </q-card>
    </div>
    <q-dialog v-model="save_compare_window">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-bold" style="font-size: 24px">解决存档冲突</div>
          <div style="font-size: 16px; margin-top: 5px">
            您的本地存档和云文档之间有所冲突，请选择您要使用的存档
          </div>
        </q-card-section>
        <q-card-section style="padding-top: 0">
          <div
            class="local_saves row items-center cursor-pointer"
            @click="save_compare(1)"
          >
            <div>
              <q-icon name="mdi-laptop" color="purple" size="48px" />
            </div>
            <div style="margin-left: 20px; font-size: 16px">
              <div class="text-bold">本地存档</div>
              <div>最后修改时间：{{ local_save.time }}</div>
            </div>
          </div>
        </q-card-section>
        <q-separator color="black" inset />
        <q-card-section>
          <div
            class="cloud_saves row items-center cursor-pointer"
            @click="save_compare(2)"
          >
            <div>
              <q-icon name="mdi-cloud-outline" color="primary" size="48px" />
            </div>
            <div style="margin-left: 20px; font-size: 16px">
              <div class="text-bold">云端存档</div>
              <div>最后修改时间：{{ cloud_save.time }}</div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions vertical align="right" style="padding-top: 0">
          <q-btn color="primary" flat v-close-popup>关闭</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-inner-loading :showing="loading" style="z-index: 2000">
      <q-spinner-gears size="50rem" color="primary" />
    </q-inner-loading>
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useCounterStore } from "../stores/example-store";
import { date } from "quasar";
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
export default {
  name: "SaveDialog",
  data() {
    return {
      save_id: "",
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
      loading: false,
      save_marked: false,
      save_compare_window: false,
      local_save: {
        data: "",
        time: "",
      },
      cloud_save: {
        data: "",
        time: "",
      },
    };
  },
  methods: {
    dateformat(val) {
      return date.formatDate(val, "YYYY-MM-DD HH:mm:ss");
    },
    //查询存档信息
    async query_saves() {
      this.loading = true;
      this.save_data = [];
      await get_gitee_gist().then((res) => {
        this.loading = false;
        for (let i of res.data) {
          if (i.files.Data_KYJG != undefined) {
            this.save_data.push(i);
          }
        }
      });
    },
    //新增存档
    add_save() {
      this.loading = true;
      let data = {
        files: {
          Data_KYJG: { content: "[]" },
          Time_KYJG: { content: "{}" },
        },
        description: "新的存档",
      };
      add_gitee_gist(data).then((res) => {
        this.loading = false;
        if (res.status == 201) {
          create_notify("新存档创建成功！");
          this.query_saves();
        }
      });
    },
    //保存
    update_save() {
      get_gitee_gist().then((res) => {
        let local_data = this.save_data.find((item) => item.id == this.save_id);
        let cloud_data = res.data.find((item) => item.id == this.save_id);
        if (!cloud_data) {
          alert("未查询到该存档在服务器上的信息，请刷新后重试");
          return;
        }
        if (cloud_data.updated_at != local_data.updated_at) {
          this.local_save = {
            data: local_data,
            time: localStorage.getItem("_yuanshenmap_save_time"),
          };
          this.cloud_save = { data: cloud_data, time: cloud_time };
          this.save_compare_window = true;
        } else {
          this.submit_data();
        }
      });
    },
    //存档冲突解决
    save_compare(index) {
      switch (index) {
        case 1:
          if (confirm("你确定要使用本地存档吗")) {
            localStorage.setItem(
              "_yuanshenmap_saveid",
              this.local_save.data.id
            );
            localStorage.setItem(
              "_yuanshenmap_save_time",
              this.local_save.time
            );
          }
          this.submit_data();
          break;
        case 2:
          if (confirm("你确定要使用云端存档吗")) {
            localStorage.setItem(
              "_yuanshenmap_saveid",
              this.cloud_save.data.id
            );
            localStorage.setItem(
              "_yuanshenmap_save_time",
              this.cloud_save.time
            );
          }
          break;
      }
      this.save_compare_window = false;
    },
    submit_data() {
      this.loading = true;
      let marked_layers = JSON.parse(localStorage.getItem("marked_layers"));
      let marked_timelayers = JSON.parse(
        localStorage.getItem("marked_timelayers")
      );
      for (let i in marked_layers) {
        marked_layers[i] = marked_layers[i].toString();
      }
      let update_data = {
        id: this.save_id,
        files: {
          Data_KYJG: { content: JSON.stringify(marked_layers) },
          Time_KYJG: { content: JSON.stringify(marked_timelayers) },
        },
      };
      edit_gitee_gist(update_data)
        .then((res) => {
          this.loading = false;
          if (res.status == 200) {
            create_notify("保存成功！");
            this.query_saves();
            this.mainStore.change_mark = false;
          }
        })
        .catch((error) => {
          create_notify(`保存失败！${error.response.data.message}`, "negative");
        });
    },
    //存档更名
    edit_save_name(savedata) {
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
            id: savedata.id,
            description: data,
          };
          edit_gitee_gist(update_data)
            .then((res) => {
              this.loading = false;
              if (res.status == 200) {
                create_notify("修改成功！");
              }
              this.query_saves();
            })
            .catch((error) => {
              create_notify(
                `修改失败！${error.response.data.message}`,
                "negative"
              );
            });
        });
    },
    //读档
    load_save(data) {
      this.$emit("load", {
        data: data,
        id: this.save_id,
      });
    },
    //删除存档
    delete_save(data) {
      if (confirm("你确定要删除存档吗?")) {
        delete_gitee_gist(data).then((res) => {
          if (res.status == 204) {
            create_notify("删除成功！");
            this.query_saves();
          }
        });
      }
    },
    //注销
    log_out() {
      if (confirm("你确定要登出吗？")) {
        localStorage.removeItem("_gitee_usercode");
        window.location.reload();
      }
    },
  },
  computed: {
    //请参考pinia不使用组合式api的用法的说明文档
    //https://pinia.web3doc.top/cookbook/options-api.html
    ...mapStores(useCounterStore),
  },
  mounted() {
    this.save_id = localStorage.getItem("_yuanshenmap_saveid");
    this.query_saves().then(() => {
      let local_save = JSON.parse(localStorage.getItem("marked_layers"));
      if (this.save_id == null) {
        if (local_save.length != 0) {
          alert("检测到你有本地存档未上传至云端，已自动为您新建存档");
          this.loading = true;
          let data = {
            files: {
              Data_KYJG: { content: "[]" },
              Time_KYJG: { content: "{}" },
            },
            description: "新的存档",
          };
          add_gitee_gist(data).then((res) => {
            if (res.status == 201) {
              create_notify("新存档创建成功！");
              this.save_id = res.data.id;
              localStorage.setItem("_yuanshenmap_saveid", res.data.id);
              let marked_layers = JSON.parse(
                localStorage.getItem("marked_layers")
              );
              let marked_timelayers = JSON.parse(
                localStorage.getItem("marked_timelayers")
              );
              let update_data = {
                id: this.save_id,
                files: {
                  Data_KYJG: { content: JSON.stringify(marked_layers) },
                  Time_KYJG: { content: JSON.stringify(marked_timelayers) },
                },
              };
              edit_gitee_gist(update_data).then((res) => {
                if (res.status == 200) {
                  create_notify("已读取存档");
                  get_gitee_gist().then((res) => {
                    this.save_data = [];
                    this.loading = false;
                    for (let i of res.data) {
                      if (i.files.Data_KYJG != undefined) {
                        this.save_data.push(i);
                      }
                    }
                  });
                } else {
                  create_notify(
                    `读取失败！${error.response.data.message}`,
                    "negative"
                  );
                }
              });
            } else {
              create_notify(
                `创建失败！${error.response.data.message}`,
                "negative"
              );
            }
          });
        }
      }
    });
  },
  watch: {
    "mainStore.change_mark": function (val) {
      this.save_marked = val;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../css/component.scss";
.mobile_saves {
  width: 85vw;
  height: 80vh;
  max-height: 80vh;
  .title {
    .text {
      font-size: 24px;
    }
  }
  .mobile_save_container {
    margin-top: 10px;
    width: 100%;
    height: 90px;
    border: 1px solid grey;
    border-radius: 1% 1%;
    .title {
      font-size: 14px;
    }
    .title.on {
      color: #1976d2;
    }
  }
  .mobile_save_container.on {
    border: 2px solid #1976d2;
  }
}
</style>