<template>
  <div id="opened_popup row" class="q-pa-md">
    <div class="text">
      <div class="title">
        {{ layer_data.markerTitle }} id:{{ layer_data.id }}
      </div>
      <q-separator spaced />
      <q-img
        class="layer_img"
        :src="
          layer_data.picture == ''
            ? 'https://assets.yuanshen.site/images/noImage.png'
            : layer_data.picture
        "
        spinner-color="primary"
        style="cursor: pointer"
        @click="full_img_window = true"
      >
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-primary text-white">
            没有相关图片
          </div>
        </template>
      </q-img>
      <div class="info">点位描述：{{ layer_data.content }}</div>
    </div>
    <div
      class="toggle_btn row justify-between items-center"
      :class="{
        on: marked,
        off: !marked,
      }"
      @click="marklayer"
    >
      <div class="text_first col">未完成</div>
      <div class="text_last col">已完成</div>
      <div class="thumb">
        <div class="thumb_sign"></div>
      </div>
    </div>
    <div class="close_btn" @click="closelayer"></div>
    <!-- 查看大图弹窗 -->
    <q-dialog v-model="full_img_window">
      <q-card style="width: 50vw; height: 50vh">
        <q-img
          class="layer_img"
          :src="
            layer_data.picture == ''
              ? 'https://assets.yuanshen.site/images/noImage.png'
              : layer_data.picture
          "
          style="height: 100%; width: 100%"
          spinner-color="primary"
        >
          <template v-slot:error>
            <div class="absolute-full flex flex-center bg-primary text-white">
              没有相关图片
            </div>
          </template>
        </q-img>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: "PopupWindow",
  data() {
    return {
      layer_data: {},
      full_img_window: false,
      marked: false,
    };
  },
  methods: {
    marklayer() {
      this.marked = !this.marked;
      this.$emit("callback", this.layer);
    },
    closelayer(){
      this.$emit("close");
    }
  },
  props: ["layer"],
  watch: {
    layer: function (val) {
      this.layer_data = val.target.options.data;
      let layerid = val.target.options.data.id;
      let arr = JSON.parse(localStorage.getItem("marked_layers"));
      let index = arr.findIndex((item) => item == layerid);
      if (index == -1) {
        this.marked = false;
      } else {
        this.marked = true;
      }
    },
  },
  mounted() {},
};
</script>
<style scoped>
.title {
  font-size: 18px;
  color: #4b5368;
}
.info {
  font-size: 14px;
  color: #4b5368;
  margin-top: 10px;
}
.layer_img {
  display: block;
  margin: 0 auto;
  width: 200px;
  height: 200px;
}
</style>