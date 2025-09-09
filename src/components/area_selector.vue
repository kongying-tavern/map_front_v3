<!-- 地区选择器 -->
<template>
  <!-- 电脑版 -->
  <div class="area_selector">
    <div class="area_selector_container">
      <!-- 右方地区信息和切换部分 -->
      <div
        class="area_selector_fold"
        @click.stop="switch_area_show"
        v-if="area_selected_top.name != undefined"
      >
        <div class="row">
          <div class="area_info">
            <div class="row justify-end" style="margin-top: 10rem">
              <div
                class="row items-center area_switch_btn orientation-landscape"
              >
                <span class="area_switch_btn_icon"></span>
                <span class="area_switch_btn_text area_switch_btn_text">
                  更换地区
                </span>
              </div>
              <div class="area_name">{{ area_selected_top.name }}</div>
            </div>
            <div class="selected_area_child_name">
              {{ area_selected_child.name }}
            </div>
          </div>
          <div class="area_icon">
            <div
              class="color_bg"
              :class="`area_${get_css_code(area_selected_top.code)}`"
            ></div>
            <q-img
              :src="`/imgs/icons/${get_css_code(
                area_selected_top.code,
              )}_off.png`"
              spinner-color="white"
            />
          </div>
        </div>
      </div>

      <!-- 地区选择器的展开部分 -->
      <div
        class="area_selector_unfold orientation-landscape"
        :class="{ on: area_selector_show }"
      >
        <span class="area_selector_background"></span>
        <span class="area_selector_line">
          <span
            class="area_selector_icon"
            :class="easterEggMotionClass"
            ref="easterEggMotionDom"
          >
          </span>
        </span>

        <div class="parent_selector row justify-center">
          <div class="row" style="column-gap: 20rem">
            <div
              v-for="(item, index) in area_list_top"
              :key="index"
              class="row area_type_container items-center justify-center"
              :class="{ on: area_selected_top.id == item.id }"
              @click.stop="change_area(item)"
              v-on:mouseenter="
                check_child_area(area_selected_top.id == item.id)
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
          class="child_selector row justify-center q-mt-sm"
          :class="{
            onshow: area_selector_show,
            on: child_area_show,
            off: child_area_hide,
          }"
        >
          <div class="col-12 row justify-center">
            <div class="area_name">
              <span>{{ area_selected_top.name }}</span>
            </div>
          </div>
          <div class="child_area_list col-6 row justify-center items-center">
            <div
              class="child_area col-shrink"
              :class="{ on: area_selected_child.id == item.id }"
              v-for="(item, index) in area_list_child"
              :key="index"
              @click.stop="change_child_area(item)"
            >
              <p>
                {{ item.name }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <teleport :to="areaSelectorDom">
        <div class="area_selector_unfold orientation-portrait">
          <!-- 父级地区选择器 -->
          <div class="parent_selector">
            <div
              v-for="(item, index) in area_list_top"
              :key="index"
              class="area_button"
              :class="{ on: area_selected_top.id == item.id }"
              @click.stop="change_area(item, true)"
            >
              <div class="area_icon">
                <div :class="`bg area_${get_css_code(item.code)}`"></div>
                <q-img
                  class="icon"
                  :src="`/imgs/icons/${get_css_code(item.code)}_off.png`"
                  no-spinner
                >
                </q-img>
              </div>

              <!-- 子级地区选择器 -->
              <div
                v-if="area_selected_top.id == item.id"
                class="child_selector"
                :class="{
                  on: area_selector_show,
                  off: !area_selector_show,
                }"
              >
                <div class="child_area_list">
                  <div
                    class="child_area"
                    :class="{ on: area_selected_child.id == child.id }"
                    v-for="(child, index) in area_list_child"
                    :key="index"
                    @click.stop="change_child_area(child)"
                  >
                    {{ child.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </teleport>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import { mapStores } from "pinia";
import { useCounterStore } from "../stores/example-store";
import { query_area } from "../service/base_request";
import { openURL } from "quasar";
import {
  easterEggMode,
  easterEggMotionClass,
  easterEggMotionDom,
  easterEggKeyBind,
} from "src/api/easter-egg";
import {
  areaSelectorDom,
  area_selected_top,
  area_selected_child,
  area_list,
  area_group,
  area_list_top,
  area_list_top_full,
  area_first_top,
  area_list_child,
  area_list_child_full,
  area_first_child,
} from "src/api/area";
import { opNonOfficialMsgShow } from "src/api/operation";

export default {
  name: "AreaSelector",
  setup() {
    easterEggKeyBind();

    return {
      easterEggMode,
      easterEggMotionClass,
      easterEggMotionDom,

      areaSelectorDom,

      area_selected_top,
      area_selected_child,
      area_list,
      area_group,
      area_list_top,
      area_list_top_full,
      area_first_top,
      area_list_child,
      area_list_child_full,
      area_first_child,
    };
  },
  data() {
    return {
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
      opNonOfficialMsgShow();
    },
    //切换主地区的触发事件
    change_area(area, autoCloseChild = false) {
      let resetChild = true;
      if (
        this.area_selected_child?.code &&
        this.area_selected_top.code === area.code
      ) {
        resetChild = false;
      }
      this.area_selected_top = area;
      this.mainStore.selected_area = area.name;
      if (resetChild) {
        this.area_selected_child = this.area_first_child;
        this.mainStore.selected_child_area = this.area_first_child;
      }
      this.child_area_show = true;
      this.child_area_hide = false;

      if (autoCloseChild && !resetChild) {
        this.switch_area_show();
      }

      opNonOfficialMsgShow();
    },
    //切换子地区的触发事件
    change_child_area(area) {
      this.area_selected_child = area;
      this.mainStore.selected_child_area = area;
      this.area_selector_show = false;
      opNonOfficialMsgShow();
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
      this.area_selected_top = this.area_first_top;
      this.change_area(this.area_selected_top);
      this.area_selector_show = true;
    });
  },
  computed: {
    //请参考pinia不使用组合式api的用法的说明文档
    //https://pinia.web3doc.top/cookbook/options-api.html
    ...mapStores(useCounterStore),
  },
};
</script>
