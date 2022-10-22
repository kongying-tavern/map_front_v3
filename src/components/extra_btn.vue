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
      <div class="btn" @click="check_log_state">
        <q-avatar
          square
          size="64px"
          font-size="64px"
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
                  style="margin-right: 15px"
                />
                <q-btn color="primary" label="同步" />
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
  <!-- 功能按钮 -->
</template>

<script>
import { openURL } from "quasar";
export default {
  name: "ExtraBtn",
  data() {
    return {
      save_window: false,
      save_data: [],
      save_columns: [],
    };
  },
  methods: {
    openURL,
    check_log_state() {
      this.log_to_gitee();
    },
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
          window.location.href='https://gitee.com/oauth/authorize?client_id=277ea02bae5fce96d432b7609ba03266482c00ef2d99639c71f5d3389ff01228&redirect_uri=http://localhost:9000/&response_type=code'
        });
    },
  },
};
</script>

<style>
</style>