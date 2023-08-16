<!-- 地区选择器 -->
<template>
  <!-- 电脑版 -->
  <div class="area_selector" ref="areaSelector">
    <div class="area_selector_container">
      <!-- 右方地区信息和切换部分 -->
      <div
        class="area_selector_fold"
        @click="switch_area_show"
        v-if="selected_area.name != undefined"
      >
        <div class="row">
          <div class="area_info">
            <div class="row justify-end" style="margin-top: 10rem">
              <div class="row items-center area_switch_btn">
                <span class="area_switch_btn_icon"></span>
                <span class="area_switch_btn_text">更换地区</span>
              </div>
              <div class="area_name">{{ selected_area.name }}</div>
            </div>
            <div class="selected_area_child_name">
              当前选择 - {{ selected_child_area.name }}
            </div>
          </div>
          <div class="area_icon">
            <div
              class="color_bg"
              :class="`area_${get_css_code(selected_area.code)}`"
            ></div>
            <q-img
              :src="`/imgs/icons/${get_css_code(selected_area.code)}_off.png`"
              spinner-color="white"
            />
          </div>
        </div>
      </div>
      <!-- 地区选择器的展开部分 -->
      <div class="area_selector_unfold" :class="{ on: area_selector_show }">
        <span class="area_selector_background"></span>
        <span class="area_selector_line"></span>
        <span class="area_selector_icon"></span>
        <div class="parent_selector row justify-center">
          <div class="row">
            <div
              v-for="(item, index) in area_list_top"
              :key="index"
              class="row area_type_containor items-center justify-center"
              :class="{ on: selected_area.areaId == item.areaId }"
              @click="change_area(item)"
              v-on:mouseenter="
                check_child_area(selected_area.areaId == item.areaId)
              "
              v-on:mouseleave="check_child_area(true)"
            >
              <div
                :class="`area_icon_bg area_${get_css_code(item.code)}`"
              ></div>
              <div :class="`active_bg area_${get_css_code(item.code)}`"></div>
              <div :class="`active area_${get_css_code(item.code)}`"></div>
              <q-img
                class="area_icon"
                :src="`/imgs/icons/${get_css_code(item.code)}_off.png`"
                no-spinner
              >
              </q-img>
            </div>
          </div>
        </div>
        <!-- 展开部分的子地区部分 -->
        <div
          class="child_selector row justify-center"
          :class="{
            onshow: area_selector_show,
            on: child_area_show,
            off: child_area_hide,
          }"
        >
          <div class="col-12 row justify-center">
            <div class="area_name">
              <span>{{ selected_area.name }}</span>
            </div>
          </div>
          <div class="child_area_list col-6 row justify-center items-center">
            <div
              class="child_area col-shrink"
              :class="{ on: selected_child_area.areaId == item.areaId }"
              v-for="(item, index) in area_list_child"
              :key="index"
              @click="change_child_area(item)"
            >
              <p>
                {{ item.name }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import { ref } from "vue";
import { mapStores } from "pinia";
import { useCounterStore } from "../stores/example-store";
import { query_area } from "../service/base_request";
import { openURL } from "quasar";
import { onKeyUp } from "@vueuse/core";
import { create_notify } from "src/api/common";
import { map_web_config } from "src/api/config";

export default {
  name: "AreaSelector",
  setup() {
    const areaSelector = ref(null);

    const easterEggMode = ref(false);
    const easterEggSequence = ref([]);

    const easterShortKeyAllow = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "KeyA",
      "KeyB",
    ];
    const easterShortKeyIgnore = [
      "Tab",
      "CapsLock",
      "ShiftLeft",
      "ShiftRight",
      "AltLeft",
      "AltRight",
      "ControlLeft",
      "ControlRight",
      "Space",
      "Enter",
    ];
    const easterEggOnSeq = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "KeyB",
      "KeyA",
      "KeyB",
      "KeyA",
    ];
    const easterEggOnSeqLen = easterEggOnSeq.length;
    const easterEggOnSeqStr = easterEggOnSeq.join("|");
    const easterEggOffSeq = [
      "ArrowDown",
      "ArrowDown",
      "ArrowUp",
      "ArrowUp",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "KeyA",
      "KeyB",
      "KeyA",
      "KeyB",
    ];
    const easterEggOffSeqLen = easterEggOffSeq.length;
    const easterEggOffSeqStr = easterEggOffSeq.join("|");

    onKeyUp(
      (e) => {
        let code = e.code || "";
        if (easterShortKeyIgnore.indexOf(code) !== -1) {
          return;
        } else if (easterShortKeyAllow.indexOf(code) !== -1) {
          easterEggSequence.value.push(code);
        } else {
          easterEggSequence.value = [];
        }

        if (
          easterEggSequence.value.length >= easterEggOnSeqLen &&
          easterEggSequence.value.slice(-easterEggOnSeqLen).join("|") ===
            easterEggOnSeqStr
        ) {
          if (!easterEggMode.value) {
            create_notify("输入秘笈成功！开启隐藏模式！", "", "bottom");
          }
          easterEggMode.value = true;
          easterEggSequence.value = [];
        } else if (
          easterEggSequence.value.length >= easterEggOffSeqLen &&
          easterEggSequence.value.slice(-easterEggOffSeqLen).join("|") ===
            easterEggOffSeqStr
        ) {
          if (easterEggMode.value) {
            create_notify("输入秘笈成功！关闭隐藏模式！", "", "bottom");
          }
          easterEggMode.value = false;
          easterEggSequence.value = [];
        }
      },
      {
        target: areaSelector.value,
      },
    );

    return {
      areaSelector,

      easterEggMode,
      easterEggSequence,
    };
  },
  data() {
    return {
      selected_area: {},
      selected_child_area: {},
      area_list: [],
      area_selector_show: false,
      child_area_show: true,
      child_area_hide: false,
    };
  },
  methods: {
    openURL,
    //切换地区选择器的显隐
    switch_area_show() {
      this.area_selector_show = !this.area_selector_show;
      this.child_area_show = false;
      this.child_area_hide = false;
    },
    //切换主地区的触发事件
    async change_area(area) {
      this.selected_area = area;
      this.selected_child_area = this.area_first_child;
      this.mainStore.selected_area = this.selected_area.name;
      this.mainStore.selected_child_area = this.selected_child_area;
      this.child_area_show = true;
      this.child_area_hide = false;
    },
    //切换子地区的触发事件
    change_child_area(area) {
      this.selected_child_area = area;
      this.mainStore.selected_child_area = area;
      this.area_selector_show = false;
    },
    //子地区的显示隐藏
    check_child_area(e) {
      this.child_area_show = e;
      this.child_area_hide = !e;
    },
    get_css_code(code = "") {
      code = code || "";
      return code.replace(/:/giu, "_");
    },
  },
  mounted() {
    //查询地区信息
    query_area({
      isTraverse: true,
      parentId: -1,
    }).then((res) => {
      this.area_list = res.data.data || [];
      this.mainStore.area_list = this.area_list;
      this.selected_area = this.area_first_top;
      this.change_area(this.selected_area);
      this.area_selector_show = true;
    });
  },
  computed: {
    //请参考pinia不使用组合式api的用法的说明文档
    //https://pinia.web3doc.top/cookbook/options-api.html
    ...mapStores(useCounterStore),
    area_group() {
      let group = _.chain(this.area_list)
        .filter((v) => {
          const block_areas = map_web_config.value?.blockArea || [];
          return block_areas.indexOf(v.code) === -1;
        })
        .groupBy("parentId")
        .mapValues((v) => _.sortBy(v, (area) => -area.sortIndex))
        .value();
      return group;
    },
    area_list_top() {
      return this.easterEggMode
        ? this.area_list_top_full
        : _.filter(this.area_list_top_full, (v) => v.hiddenFlag !== 3);
    },
    area_list_top_full() {
      return this.area_group[-1] || [];
    },
    area_first_top() {
      return this.area_list_top[0] || {};
    },
    area_list_child() {
      return this.easterEggMode
        ? this.area_list_child_full
        : _.filter(this.area_list_child_full, (v) => v.hiddenFlag !== 3);
    },
    area_list_child_full() {
      return this.area_group[this.selected_area?.areaId] || [];
    },
    area_first_child() {
      return this.area_list_child[0] || {};
    },
  },
};
</script>
