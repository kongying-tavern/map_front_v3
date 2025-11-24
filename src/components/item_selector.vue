<!-- 物品选择器 -->
<template>
  <div class="item_selector" :class="{ off: selector_type }">
    <div class="item_selector_main">
      <!-- 折叠按钮 -->
      <div class="fold_btn" @click="selector_type = !selector_type">
        <div class="fold_btn_arrow" :class="{ on: selector_type }"></div>
      </div>
      <!-- 选择器的背景 -->
      <div class="item_selector_container">
        <div class="item_selector_header"></div>
        <div class="item_selector_body"></div>
        <div class="item_selector_footer"></div>
      </div>
      <!-- 选择器的内容 -->
      <div class="item_selector_list_container_background"></div>
      <div class="item_selector_list_container">
        <q-scroll-area
          style="height: 100%; width: 100%"
          :thumb-style="{
            width: '2rem',
            right: '4rem',
          }"
          :bar-style="{
            borderRadius: '1rem',
            backgroundColor: '#DDD8D3',
          }"
        >
          <div
            class="item_selector_item"
            v-for="(item, index) in type_list"
            :key="index"
            v-show="check_item_length(item)"
          >
            <!-- 标题项 -->
            <div
              class="item_header row items-center justify-between"
              @click="switch_item_fold(item)"
            >
              <div class="row items-center">
                <q-img
                  :src="`/imgs/itemicon_${item.name}.png`"
                  style="width: 32rem; height: 32rem; margin-left: 12rem"
                />
                <span class="item_name">{{ item.name }}</span>
              </div>
              <div
                class="item_fold_btn"
                :class="{ on: get_item_fold(item) }"
              ></div>
            </div>
            <!-- 下拉项 -->
            <q-slide-transition>
              <div class="item_body row" v-if="get_item_fold(item)">
                <div class="col-12 q-pa-sm" v-if="item.name == '宝箱'">
                  <q-btn-toggle
                    dense
                    padding="8rem"
                    v-model="chest_type"
                    color="toggle_btn_color"
                    toggle-color="toggle_btn_toggle_color"
                    text-color="toggle_btn_text_color"
                    unelevated
                    style="font-family: HYWH"
                    :options="[
                      { label: '宝箱品质', value: 10 },
                      { label: '宝箱形式', value: 11 },
                    ]"
                  />
                </div>
                <div
                  class="item_option row"
                  v-for="(i, index) in item_list[
                    item.id == 9 ? chest_type : item.id
                  ]"
                  :class="{
                    on:
                      selected_item_list.find((item) => item.id == i.id) !=
                      undefined,
                  }"
                  :key="index"
                  @click="insert_selected_item(i)"
                >
                  <div class="item_option_avatar">
                    <q-img
                      :src="get_itemicon(i)"
                      style="
                        width: 40rem;
                        height: 40rem;
                        vertical-align: initial;
                      "
                      referrerpolicy="no-referrer"
                      @error="handle_item_icon_error(i)"
                    />
                  </div>
                  <div class="col" style="height: 100%; position: relative">
                    <span class="item_option_title ellipsis">
                      {{ i.name }}
                    </span>
                    <span class="item_option_count ellipsis">
                      {{ count_layer(i) }}/{{ i.count }}
                    </span>
                    <span class="item_option_progress">
                      <span
                        class="item_option_progress_bar"
                        :style="{
                          width: `${(count_layer(i) / i.count) * 100}%`,
                        }"
                      >
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </q-slide-transition>
          </div>
        </q-scroll-area>
        <q-inner-loading :showing="item_loading">
          <q-spinner-gears size="50rem" color="primary" />
        </q-inner-loading>
      </div>
      <div class="item_selected_wrapper">
        <!-- 已选项 -->
        <div class="item_selected_bar" v-if="selected_item_list.length !== 0">
          <div class="close-all" @click="closeall">
            <q-tooltip
              anchor="center left"
              self="center right"
              :offset="[10, 10]"
              transition-show="jump-left"
              transition-hide="jump-right"
            >
              清除所有
            </q-tooltip>
          </div>
          <div class="item_list">
            <q-scroll-area
              style="height: 100%; width: 100%"
              :thumb-style="{ background: 'none' }"
            >
              <div
                class="item"
                v-for="(item, index) in selected_item_list"
                :key="index"
                @click="insert_selected_item(item)"
              >
                <div class="item_close"></div>
                <q-img
                  :src="get_itemicon(item)"
                  style="width: 48rem; height: 48rem; margin: 1rem"
                  referrerpolicy="no-referrer"
                  @error="handle_item_icon_error(item)"
                />
                <q-tooltip
                  anchor="center left"
                  self="center right"
                  :offset="[10, 10]"
                  transition-show="jump-left"
                  transition-hide="jump-right"
                >
                  {{ item.area }}-{{ item.name }}
                </q-tooltip>
              </div>
            </q-scroll-area>
          </div>
        </div>
        <!-- 地区选择器（远程挂载） -->
        <div ref="areaSelectorDom" class="area_selector_foreign"></div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import { mapStores } from "pinia";
import { useCounterStore } from "../stores/example-store";
import {
  query_type,
  query_itemlist,
  query_iconlist,
} from "../service/base_request";
import { mapSelectedItems } from "src/api/map_obj";
import { clearLayers } from "src/api/map_obj";
import { areaSelectorDom } from "src/api/area";
import { opNonOfficialMsgShow } from "src/api/operation";

export default {
  name: "ItemSelector",
  setup() {
    return {
      selected_item_list: mapSelectedItems,
      areaSelectorDom,
    };
  },
  data() {
    return {
      icon_list: [],
      icon_list_map: new Map(),
      test: false,
      selector_type: false,
      selected_type: 0,
      type_list: [],
      type_list_map: new Map(),
      chest_type: 10,
      item_loading: false,
      item_list_map: new Map(),
      item_list: [],
      teleport_list: [],
    };
  },
  methods: {
    //切换下拉项的函数
    get_item_fold(item) {
      if (this.type_list.length != 0) {
        return this.type_list_map.get(item.name).fold;
      }
    },
    //切换下拉项的函数
    switch_item_fold(item) {
      let fold = this.type_list_map.get(item.name).fold;
      this.type_list_map.get(item.name).fold = !fold;
    },
    //改变宝箱状态
    change_chest_type() {
      this.get_itemlist(this.mainStore.selected_child_area.id, this.chest_type);
    },
    //查询类型下属的物品列表
    async get_itemlist(areaid) {
      this.item_loading = true;
      await query_itemlist({
        typeIdList: [],
        areaIdList: [areaid],
        current: 0,
        size: 9999,
        sort: ["sortIndex-"],
      }).then((res) => {
        this.teleport_list = [];
        this.item_loading = false;
        for (let i of this.type_list) {
          if (i.id != 9) {
            this.item_list[i.id] = [];
          } else {
            this.item_list[10] = [];
            this.item_list[11] = [];
          }
        }
        for (let i of res.data.data.record) {
          if (i.count > 0) {
            for (let j of i.typeIdList) {
              if (i.specialFlag != 1) {
                this.item_list[j]?.push(i);
              }
            }
            if (i.specialFlag == 1) {
              this.teleport_list.push(i);
            }
          }
        }
        this.mainStore.teleport_list = this.teleport_list;
      });
    },
    //查询物品类型对应的图标
    get_itemicon(value) {
      if (!this.icon_list_map.has(value.iconId)) {
        this.icon_list_map.set(
          value.iconId,
          "https://assets.yuanshen.site/icons/-1.png",
        );
      }
      return this.icon_list_map.get(value.iconId);
    },
    //添加物品选项
    insert_selected_item(value) {
      //宝箱的两种属性是互斥的，只能选择其中一种
      if (value.typeIdList.includes(10)) {
        let array = [];
        for (let i of mapSelectedItems.value) {
          if (i.typeIdList.includes(11) == false) {
            array.push(i);
          }
        }
        mapSelectedItems.value = array;
      } else if (value.typeIdList.includes(11)) {
        let array = [];
        for (let i of mapSelectedItems.value) {
          if (i.typeIdList.includes(10) == false) {
            array.push(i);
          }
        }
        mapSelectedItems.value = array;
      }
      //将已选项添加进数组
      let index = mapSelectedItems.value.findIndex(
        (item) => item.id == value.id,
      );
      if (index == -1) {
        value.area = this.mainStore.selected_child_area.name;
        mapSelectedItems.value.push(value);
        this.mainStore.changeitem = {
          item: value,
          type: 1,
        };
      } else {
        this.mainStore.changeitem = {
          item: _.cloneDeep(mapSelectedItems.value[index]),
          type: 0,
        };
        mapSelectedItems.value.splice(index, 1);
      }
      this.mainStore.selected_item_list = mapSelectedItems.value;
      if (value.typeIdList.includes(10) || value.typeIdList.includes(11)) {
        this.$emit("refresh");
      }
      opNonOfficialMsgShow();
    },
    //清除所有已选项
    closeall() {
      mapSelectedItems.value = [];
      clearLayers();
      opNonOfficialMsgShow();
    },
    // 图片路径映射表
    icon_list_cache() {
      this.icon_list.forEach(({ id, url }) => {
        this.icon_list_map.set(id, url);
      });
    },
    // 图片加载异常处理
    handle_item_icon_error(value) {
      this.icon_list_map.set(
        value.iconId,
        "https://assets.yuanshen.site/icons/-1.png",
      );
    },
    //隐藏无可选性的分类
    check_item_length(item) {
      if (item.id != 9) {
        if (
          this.item_list[item.id] == undefined ||
          this.item_list[item.id].length == 0
        ) {
          return false;
        }
      }
      return true;
    },
    //计算计数的点位数量，反映到物品选择器上
    count_layer(item) {
      if (this.mainStore.layer_count.get(item.id)) {
        return this.mainStore.layer_count.get(item.id);
      }
      return 0;
    },
  },
  mounted() {
    this.item_loading = true;
    this.$axios
      .all([
        //查询所有物品图标
        query_iconlist({
          iconIdList: [],
          typeIdList: [],
          current: 0,
          size: 9999,
        }),
        //查询所有分类
        query_type(1, {
          current: 1,
          typeIdList: [],
          size: 9999,
        }),
      ])
      .then(
        this.$axios.spread((res1, res2) => {
          this.icon_list = res1.data.data.record;
          this.$emit("callback", this.icon_list);
          for (let i of res2.data.data.record) {
            if (i.specialFlag != 1) {
              this.type_list.push(i);
              this.type_list_map.set(i.name, {
                ...i,
                fold: false,
              });
            }
          }
          this.item_loading = false;
          this.icon_list_cache();
        }),
      );
    // query_itemlist({
    //   typeIdList: [],
    //   areaIdList: [],
    //   current: 0,
    //   size: 9909,
    // }).then((res) => {
    //   console.log(this.mainStore.area_list);
    //   console.log(res);
    // });
  },
  computed: {
    //请参考pinia不使用组合式api的用法的说明文档
    //https://pinia.web3doc.top/cookbook/options-api.html
    ...mapStores(useCounterStore),
  },
  watch: {
    "mainStore.selected_child_area": function (val, oldval) {
      this.get_itemlist(val.id);
    },
  },
};
</script>
