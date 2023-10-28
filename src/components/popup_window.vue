<!-- 点击地图上的点位的弹窗 -->
<template>
  <div id="opened_popup row" class="q-pa-md">
    <div class="text">
      <div class="title">
        {{ layer_data.markerTitle }}
      </div>
      <div class="id">id:{{ layer_data.id }}</div>
      <q-separator spaced />
      <div class="info scroll hide-scrollbar">
        {{ layer_data.content }}
      </div>
      <div class="layer_img_content">
        <q-img
          v-if="!teleport_type"
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
        <q-avatar
          v-if="isSpeechSupported"
          class="sound_btn"
          :icon="sound_playing ? 'mdi-volume-off' : 'mdi-volume-high'"
          font-size="30px"
          text-color="white"
          @click="playSound(layer_data.content)"
        >
        </q-avatar>
        <q-avatar
          v-if="layer_data.videoPath != ''"
          class="video_btn"
          icon="mdi-play-speed"
          font-size="50px"
          text-color="white"
          @click="openURL(layer_data.videoPath)"
        >
          <q-tooltip> 点击播放视频 </q-tooltip>
        </q-avatar>
      </div>
    </div>
    <div
      class="toggle_btn row justify-between items-center"
      :class="{
        on: marked,
        off: !marked,
      }"
      @click="marklayer"
      v-if="!teleport_type"
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
    <div class="opened_popup_down"></div>
  </div>
</template>

<script>
import { mapStores } from "pinia";
import { useCounterStore } from "../stores/example-store";
import { openURL } from "quasar";
export default {
  name: "PopupWindow",
  data() {
    return {
      layer_data: {},
      full_img_window: false,
      marked: false,
      teleport_type: false,
      sound_player: null,
      sound_playing: false,
    };
  },
  methods: {
    openURL,
    playSound(text = "") {
      if (!this.sound_player) {
        this.sound_player = new window.SpeechSynthesisUtterance();
        this.sound_player.lang = "zh-CN";
        this.sound_player.pitch = 1.5;
        this.sound_player.onstart = () => {
          this.sound_playing = true;
        };
        this.sound_player.onend = () => {
          this.sound_playing = false;
        };
      }

      if (this.sound_playing) {
        window.speechSynthesis.cancel();
        this.sound_playing = false;
      } else {
        text = (text || "").replace(/[【】]/giu, "");
        this.sound_player.text = text;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(this.sound_player);
      }
    },
    marklayer() {
      this.marked = !this.marked;
      this.$emit("callback", [this.layer, this.marked]);
      this.mainStore.change_mark = true;
    },
    closelayer() {
      this.$emit("close");
    },
  },
  props: ["layer"],
  watch: {
    layer: function (val) {
      this.layer_data = val.target.options.data;
      this.teleport_type = val.target.options.icon.options.teleport;
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
  computed: {
    //请参考pinia不使用组合式api的用法的说明文档
    //https://pinia.web3doc.top/cookbook/options-api.html
    ...mapStores(useCounterStore),
    isSpeechSupported() {
      const speechSupported =
        !!window.SpeechSynthesisUtterance && !!window.speechSynthesis;
      return speechSupported;
    },
  },
};
</script>
<style lang="scss" scoped>
.title {
  font-size: 16rem;
  color: #4b5368;
  max-width: 90%;
}
.info {
  font-size: 14rem;
  color: #4b5368;
  margin-top: 10rem;
  white-space: pre-line;
  max-height: 300rem;
}
.layer_img {
  display: block;
  margin: 0 auto;
  width: 200rem;
  height: 200rem;
}
.video_btn {
  position: absolute;
  left: 68%;
  top: 60%;
  cursor: pointer;
}

.sound_btn {
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
  opacity: 0.2;

  .layer_img_content:hover & {
    opacity: 1;
  }
}
</style>
