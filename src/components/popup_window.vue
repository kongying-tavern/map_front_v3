<template>
  <div id="opened_popup row">
    <div class="text">
      <p>{{ layer_data.markerTitle }} id:{{ layer_data.id }}</p>
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
      <p>点位描述：{{ layer_data.content }}</p>
    </div>
    <q-checkbox
      v-model="marked"
      @update:model-value="marklayer"
      label="标记点位"
    />
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
      this.$emit("callback", this.layer);
    },
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
p {
  margin: 10px auto;
  font-size: 16px;
}
</style>
<style>
.leaflet-popup-content {
  width: 100% !important;
}
.layer_img {
  display: block;
  margin: 0 auto;
  width: 200px;
  height: 200px;
}
.leaflet-popup-close-button {
  zoom: 2;
}
</style>