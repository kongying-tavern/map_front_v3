<template>
  <q-layout class="main">
    <!-- 地图容器 -->
    <div class="map_containor">
      <div class="stars"></div>
      <div class="twinkling"></div>
      <div id="map"></div>
    </div>
  </q-layout>
</template>

<script>
import { create_map } from "../api/map";
export default {
  name: "IndexPage",
  data() {
    return {};
  },
  mounted() {
    this.map = create_map(
      "qd28",
      {
        center: [600, -2190],
        zoom: -2,
      },
      [3568, 6286],
      [8192, 8192]
    );
  },
};
</script>

<style lang="scss">
@import url("https://yuanshen.site/css/background.css");
@import "../css/map.scss";
</style>