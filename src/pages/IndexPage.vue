<template>
  <q-layout class="main">
    <!-- 地图容器 -->
    <div class="map_containor">
      <div class="stars"></div>
      <div class="twinkling"></div>
      <div id="map"></div>
    </div>
    <!-- 地区选择器 -->
    <area-selector></area-selector>
    <!-- 物品筛选器 -->
    <item-selector></item-selector>
  </q-layout>
</template>

<script>
import ItemSelector from "../components/item_selector.vue";
import AreaSelector from "../components/area_selector.vue";
import { init_map } from "../api/map";
import { mapStores } from "pinia";
import { useCounterStore } from "../stores/example-store";
export default {
  name: "IndexPage",
  data() {
    return {};
  },
  components: {
    ItemSelector,
    AreaSelector,
  },
  methods: {
    switch(area) {},
  },
  mounted() {
    this.map = init_map('渊下宫');
  },
  computed: {
    //请参考pinia不使用组合式api的用法的说明文档
    //https://pinia.web3doc.top/cookbook/options-api.html
    ...mapStores(useCounterStore),
  },
  watch: {
    "mainStore.selected_child_area": function (val) {
      console.log(val);
    },
  },
};
</script>

<style lang="scss">
@import url("https://yuanshen.site/css/background.css");
@import "../css/map.scss";
@import "../css/selector.scss";
.map_containor {
  position: relative;
}
</style>