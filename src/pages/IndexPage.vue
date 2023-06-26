<!-- 地图主页 -->
<template>
  <q-layout class="main">
    <!-- 地图容器 -->
    <div class="map_overlay"></div>
    <div class="map_containor">
      <div class="stars"></div>
      <div class="twinkling"></div>
      <div id="map"></div>
    </div>
    <!-- 地区选择器 -->
    <area-selector></area-selector>
    <!-- 物品筛选器 -->
    <item-selector
      @callback="item_selector_callback"
      @clear="clearall"
      @refresh="refresh_layergroup"
    ></item-selector>
    <!-- 地图上点位的弹窗 -->
    <div id="popup_window" ref="window" v-show="popup_window_show">
      <popup-window
        :layer="handle_layer"
        @callback="popup_callback"
        @close="close_popup"
      ></popup-window>
    </div>
    <!-- 左下侧各种开关 -->
    <div class="switch_list">
      <div class="switch row items-center">
        <div
          class="switch_btn"
          :class="{ on: teleport_state }"
          @click="teleport_switch"
        ></div>
        <div class="text">传送点位</div>
      </div>
      <div class="switch row items-center">
        <div
          class="switch_btn"
          :class="{ on: opacity_state }"
          @click="opacity_switch"
        ></div>
        <div class="text">标记点位</div>
      </div>
      <div class="xumi" v-if="xumi_show">
        <div class="switch row items-center">
          <div
            class="switch_btn"
            :class="{ on: xumi_opacity_state }"
            @click="xumi_underground_opacity_switch"
          ></div>
          <div class="text">仅显示须弥地下点位</div>
        </div>
      </div>
    </div>
    <!-- 左上侧各种开关 -->
    <extra-btn @load="load_savedata" @loading="toggle_loading"></extra-btn>
    <div class="area_components">
      <div class="xumi" v-if="xumi_show">
        <level-switch
          v-if="mainStore.selected_area == '须弥'"
          @underground_switch="xumi_underground_switch"
          @underground_area_switch="xumi_underground_child_area_switch"
        ></level-switch>
      </div>
    </div>
    <q-inner-loading :showing="loading" style="z-index: 2000">
      <q-spinner-gears size="50rem" color="primary" />
    </q-inner-loading>
  </q-layout>
</template>

<script>
import ItemSelector from "../components/item_selector.vue";
import AreaSelector from "../components/area_selector.vue";
import PopupWindow from "../components/popup_window.vue";
import ExtraBtn from "../components/extra_btn.vue";
import LevelSwitch from "../components/xumi/level_switch.vue";
import {
  init_map,
  add_map_overlay_XumiUnderground,
  create_xumi_underground_layers,
} from "../api/map";
import { mapStores } from "pinia";
import { useCounterStore } from "../stores/example-store";
import { xumi_underground_name } from "../api/extra_data/xumi_underground";
import {
  layergroup_register,
  subgroup_register,
  layer_mark,
  layer_register,
} from "../api/layer";
import { query_itemlayer_infolist } from "../service/base_request";
import { switch_area_list, set_Storage } from "../api/common";
import { query_itemlayer_byid, clear_cache } from "../service/base_request";
export default {
  name: "IndexPage",
  data() {
    return {
      loading: false,
      icon_list: [],
      item_list: [],
      popup_window_show: false,
      handle_layer: null,
      handle_layergroup: null,
      teleport_state: false,
      opacity_state: true,
      xumi_underground_name,
      xumi_opacity_state: false,
      xumi_underground_overlaygroup: null,
      xumi_underground_bg: null,
      xumi_show: false,
    };
  },
  components: {
    ItemSelector,
    AreaSelector,
    PopupWindow,
    ExtraBtn,
    LevelSwitch,
  },
  methods: {
    //返回图标数组
    item_selector_callback(value) {
      this.icon_list = value;
    },
    //查询物品类型对应的图标
    get_itemicon(value) {
      let icon = this.icon_list.find((item) => item.name == value.iconTag);
      if (icon != undefined) {
        return icon.url;
      }
      return "https://assets.yuanshen.site/icons/-1.png";
    },
    //切换点位的显隐
    switch_layergroup(value) {
      // console.log(value);
      //添加点位组
      if (value.type == 1) {
        //如果没有点位缓存，则请求点位信息
        if (!this.layergroup_map.has(value.item.itemId)) {
          this.loading = true;
          query_itemlayer_infolist({
            typeIdList: [],
            areaIdList: [],
            itemIdList: [value.item.itemId],
            getBeta: 0,
          }).then((res) => {
            let iconurl = this.get_itemicon(value.item);
            let layergroup;
            if (
              value.item.typeIdList.indexOf(10) != -1 ||
              value.item.typeIdList.indexOf(11) != -1
            ) {
              layergroup = subgroup_register(
                this.BXGroup,
                res.data.data,
                iconurl
              );
            } else {
              layergroup = layergroup_register(true, res.data.data, iconurl);
            }
            //为每个点位绑定点击时弹出弹窗函数
            layergroup.eachLayer((layer) => {
              layer.bindPopup(this.$refs.window);
              layer.on({
                popupopen: (layer) => {
                  this.handle_layer = layer;
                  this.popup_window_show = true;
                  this.handle_layergroup = layergroup;
                },
              });
              //检测点位是否已被标记，若标记则为该点位着色
              let arr = JSON.parse(localStorage.getItem("marked_layers"));
              let layerid = layer.options.data.id;
              if (arr.includes(layerid)) {
                layer_mark(layer);
              }
            });
            this.map.addLayer(layergroup);
            this.layergroup_map.set(value.item.itemId, layergroup);
            this.loading = false;
          });
          //否则使用缓存，直接从点位组map对象中调取队应的点位组
        } else {
          let layergroup = this.layergroup_map.get(value.item.itemId);
          layergroup.eachLayer((layer) => {
            layer_mark(layer, "on");
            let arr = JSON.parse(localStorage.getItem("marked_layers"));
            let layerid = layer.options.data.id;
            if (arr.includes(layerid)) {
              layer_mark(layer);
            }
          });
          this.map.addLayer(layergroup);
        }
        //移除点位组
      } else {
        let layergroup = this.layergroup_map.get(value.item.itemId);
        this.map.removeLayer(layergroup);
      }
    },
    //刷新点位的状态
    refresh_layergroup() {
      this.loading = true;
      this.clearall();
      for (let i of this.layergroup_map.keys()) {
        if (
          this.mainStore.selected_item_list.find((item) => item.itemId == i) !=
          undefined
        ) {
          let layergroup = this.layergroup_map.get(i);
          let arr = JSON.parse(localStorage.getItem("marked_layers"));
          layergroup.eachLayer((layer) => {
            layer_mark(layer, "on");
            let layerid = layer.options.data.id;
            if (arr.includes(layerid)) {
              layer_mark(layer);
            }
          });
          this.map.addLayer(this.layergroup_map.get(i));
        }
      }
      this.loading = false;
    },
    //清除所有点位
    clearall() {
      for (let i of this.layergroup_map.values()) {
        this.map.removeLayer(i);
      }
    },
    //点位的计数功能
    mark_count() {
      if (localStorage.getItem("marked_layers") != null) {
        let arr = JSON.parse(localStorage.getItem("marked_layers"));
        query_itemlayer_byid(arr).then((res) => {
          for (let i of res.data.data) {
            for (let j of i.itemList) {
              if (j.count == 1) {
                if (!this.mainStore.layer_count.get(j.itemId)) {
                  this.mainStore.layer_count.set(j.itemId, 1);
                } else {
                  this.mainStore.layer_count.set(
                    j.itemId,
                    this.mainStore.layer_count.get(j.itemId) + 1
                  );
                }
              }
            }
          }
          let count = JSON.stringify([...this.mainStore.layer_count]);
          localStorage.setItem("marked_count", count);
        });
      }
    },
    //弹窗的标记功能
    popup_callback(data) {
      let marklayer = this.handle_layergroup.getLayer(
        data[0].target._leaflet_id
      );
      layer_mark(marklayer);
      let layerid = data[0].target.options.data.id;
      let arr = JSON.parse(localStorage.getItem("marked_layers"));
      let index = arr.findIndex((item) => item == layerid);
      if (index == -1) {
        arr.push(layerid);
        localStorage.setItem("marked_layers", JSON.stringify(arr));
      } else {
        arr.splice(index, 1);
        localStorage.setItem("marked_layers", JSON.stringify(arr));
      }
      //物品选择器的计数
      if (data[1]) {
        for (let i of data[0].target.options.data.itemList) {
          if (this.mainStore.layer_count.get(i.itemId)) {
            this.mainStore.layer_count.set(
              i.itemId,
              this.mainStore.layer_count.get(i.itemId) + i.count
            );
          } else {
            this.mainStore.layer_count.set(i.itemId, i.count);
          }
        }
      } else {
        for (let i of data[0].target.options.data.itemList) {
          this.mainStore.layer_count.set(
            i.itemId,
            this.mainStore.layer_count.get(i.itemId) - i.count
          );
        }
      }
      let count = JSON.stringify([...this.mainStore.layer_count]);
      localStorage.setItem("marked_count", count);
      // 使用标记功能后，更新此节点的父级聚合点cluster信息
      this.updateClusterByMarker(data[0].target);
    },
    // 更新父级聚合点cluster信息
    updateClusterByMarker(marker) {
      let parent = marker.__parent;
      while (parent) {
        const updateForCluster = parent.silentlyUpdate;
        updateForCluster && updateForCluster();
        parent = parent.__parent;
      }
    },
    //关闭弹窗
    close_popup() {
      this.map.closePopup();
    },
    //查询并生成该地区的传送点
    teleport_layer_init() {
      if (this.teleport_group != null) {
        this.map.removeLayer(this.teleport_group);
      }
      if (
        !this.teleport_map.has(`${this.mainStore.selected_child_area.name}`)
      ) {
        //若无缓存，则从传送点位列表中找到所有传送点位类，由于传送点位有不同的类型（锚点/秘境），需要为不同的点位类型建立不同的对象
        this.loading = true;
        let item_list = [];
        let icon_list = [];
        for (let i of this.mainStore.teleport_list) {
          item_list.push(i.itemId);
          icon_list.push({
            itemId: i.itemId,
            itemName: i.name,
            iconurl: this.get_itemicon(i),
          });
        }
        let layergroup = layergroup_register(false);
        //生成传送点位列表
        query_itemlayer_infolist({
          typeIdList: [],
          areaIdList: [],
          itemIdList: item_list,
          getBeta: 0,
        }).then((res) => {
          for (let i of res.data.data) {
            let iconurl = "https://assets.yuanshen.site/icons/-1.png";
            let iconname = "off";
            if (icon_list.find((item) => item.itemId == i.itemList[0].itemId)) {
              iconurl = icon_list.find(
                (item) => item.itemId == i.itemList[0].itemId
              ).iconurl;
              iconname = icon_list.find(
                (item) => item.itemId == i.itemList[0].itemId
              ).itemName;
            }
            let marker = layer_register(i, iconurl, iconname);
            layergroup.addLayer(marker);
          }
          layergroup.eachLayer((layer) => {
            layer.bindPopup(this.$refs.window);
            layer.on({
              popupopen: (layer) => {
                this.handle_layer = layer;
                this.popup_window_show = true;
                this.handle_layergroup = layergroup;
              },
            });
          });
          this.teleport_map.set(
            `${this.mainStore.selected_child_area.name}`,
            layergroup
          );
          this.teleport_group = layergroup;
          this.map.addLayer(this.teleport_group);
          this.loading = false;
        });
      } else {
        this.map.removeLayer(this.teleport_group);
        this.teleport_group = this.teleport_map.get(
          `${this.mainStore.selected_child_area.name}`
        );
        this.map.addLayer(this.teleport_group);
      }
    },
    //切换传送点位显隐
    teleport_switch() {
      this.teleport_state = !this.teleport_state;
      if (this.teleport_state) {
        this.teleport_layer_init();
      } else {
        this.map.removeLayer(this.teleport_group);
      }
    },
    //读取存档数据
    load_savedata(data) {
      localStorage.setItem("marked_layers", JSON.stringify([]));
      let local_data = new Set(
        JSON.parse(localStorage.getItem("marked_layers"))
      );
      let save_data = JSON.parse(data.files.Data_KYJG.content);
      for (let i in save_data) {
        save_data[i] = parseInt(save_data[i]);
      }
      save_data = new Set(save_data);
      let new_data = Array.from(new Set([...local_data, ...save_data]));
      localStorage.setItem("marked_layers", JSON.stringify(new_data));
      this.refresh_layergroup();
      localStorage.setItem("marked_count", JSON.stringify([]));
      this.mainStore.layer_count = new Map();
      this.mark_count();
    },
    //切换地图的加载状态
    toggle_loading() {
      this.loading = !this.loading;
    },
    //切换点位的显隐状态
    opacity_switch() {
      this.opacity_state = !this.opacity_state;
      document.documentElement.style.setProperty(
        "--opacity",
        !this.opacity_state ? 0.3 : 1
      );
      let layers = document.getElementsByClassName("leaflet-shadow-pane");
      let imgs = document.getElementsByClassName("leaflet-marker-pane");
      if (!this.opacity_state) {
        layers[0].className = `${layers[0].className} opacity_on`;
        imgs[0].className = `${imgs[0].className} opacity_on`;
      } else {
        layers[0].className = layers[0].className.replace(/opacity_on/, "");
        imgs[0].className = imgs[0].className.replace(/opacity_on/, "");
      }
    },
    //切换须弥的地下和地上地图
    xumi_underground_switch(val) {
      this.loading = true;
      if (this.xumi_underground_overlaygroup == null) {
        this.xumi_underground_bg = add_map_overlay_XumiUnderground();
        this.xumi_underground_overlaygroup = create_xumi_underground_layers();
      }
      if (!val) {
        this.map_tiles.setOpacity(0.45);
        this.map.addLayer(this.xumi_underground_bg);
        for (let i of this.xumi_underground_overlaygroup.values()) {
          this.map.addLayer(i);
        }
      } else {
        this.map_tiles.setOpacity(1);
        this.map.removeLayer(this.xumi_underground_bg);
        for (let i of this.xumi_underground_overlaygroup.values()) {
          this.map.removeLayer(i);
        }
      }
      this.loading = false;
    },
    //切换须弥地下点位的显隐状态
    xumi_underground_opacity_switch() {
      this.xumi_opacity_state = !this.xumi_opacity_state;
      document.documentElement.style.setProperty(
        "--underground",
        this.xumi_opacity_state ? 0.3 : 1
      );
      let layers = document.getElementsByClassName("leaflet-shadow-pane");
      let imgs = document.getElementsByClassName("leaflet-marker-pane");
      if (this.xumi_opacity_state) {
        layers[0].className = `${layers[0].className} underground_on`;
        imgs[0].className = `${imgs[0].className} underground_on`;
      } else {
        layers[0].className = layers[0].className.replace(/underground_on/, "");
        imgs[0].className = imgs[0].className.replace(/underground_on/, "");
      }
    },
    //切换须弥地下地区子地区的状态
    xumi_underground_child_area_switch(data) {
      let area = xumi_underground_name[data.index][1];
      let area_group = "";
      switch (data.index) {
        //切换须弥的大赤沙海地区的层级显示
        case 1:
          area_group = this.xumi_underground_overlaygroup.get(area).getLayers();
          area_group.forEach((item) => {
            item.setOpacity(0);
          });
          for (let i of Object.entries(data.data)) {
            let item = area_group.find(
              (item) =>
                item.options.group[0] == i[0] && item.options.group[1] == i[1]
            );
            if (item) {
              item.setOpacity(1);
            }
          }
          break;
        //切换须弥的诸法丛林/千壑沙地/苍漠囿土地区的层级显示
        case 0:
        case 2:
        case 3:
          area_group = this.xumi_underground_overlaygroup.get(area).getLayers();
          for (let i of Object.entries(data.data)) {
            let arr = [];
            for (let item of area_group) {
              if (item.options.group) {
                if (item.options.group[0] == i[0]) {
                  arr.push(item);
                }
              }
              for (let j of arr) {
                j.setOpacity(1);
                if (j.options.group[1] != i[1]) {
                  j.setOpacity(0.2);
                }
                if (i[1] == -1) {
                  j.setOpacity(1);
                }
              }
            }
          }
          break;
      }
    },
  },
  mounted() {
    //生成地图和点位组map对象
    this.map = init_map();
    //获取地图背景所属的对象
    this.map.eachLayer((layer) => {
      this.map_tiles = layer;
    });
    this.teleport_group = null;
    this.layergroup_map = new Map();
    this.teleport_map = new Map();
    this.BXGroup = L.markerClusterGroup({
      maxClusterRadius: function (e) {
        let radius = 80;
        let radius_map = new Map([[4, 100], [(5, 80)], [(6, 55)], [(7, 25)]]);
        if (radius_map.has(e)) {
          radius = radius_map.get(e);
          return radius;
        }
        return radius;
      },
      iconUrl: "https://assets.yuanshen.site/icons/26.png",
    }).addTo(this.map);
    //点位缓存
    if (localStorage.getItem("marked_layers") == null) {
      localStorage.setItem("marked_layers", JSON.stringify([]));
    }
    if (localStorage.getItem("marked_timelayers") == null) {
      localStorage.setItem("marked_timelayers", JSON.stringify({}));
    }
    if (localStorage.getItem("marked_count") == null) {
      localStorage.setItem("marked_count", JSON.stringify([]));
    }
    //回调时，记录用户的code
    if (this.$route.query.code != undefined) {
      set_Storage("_gitee_usercode", this.$route.query.code);
      this.$router.push("/");
    }
    this.opacity_switch();
    this.mark_count();
  },
  computed: {
    //请参考pinia不使用组合式api的用法的说明文档
    //https://pinia.web3doc.top/cookbook/options-api.html
    ...mapStores(useCounterStore),
  },
  watch: {
    "mainStore.selected_area": function (val) {
      sessionStorage.setItem("area", val);
      if (val != "须弥") {
        this.xumi_show = false;
        this.xumi_underground_switch(true);
        if (this.xumi_opacity_state) {
          this.xumi_underground_opacity_switch();
        }
        return;
      }
      this.xumi_show = true;
    },
    "mainStore.selected_child_area": function (val, oldval) {
      if (
        switch_area_list.includes(val.name) ||
        switch_area_list.includes(oldval.name)
      ) {
        this.clearall();
        this.map.remove();
        this.map = init_map(val.name);
        this.BXGroup.addTo(this.map);
      }
    },
    "mainStore.changeitem": function (val) {
      this.switch_layergroup(val);
    },
    "mainStore.teleport_list": function (val) {
      if (this.teleport_state) {
        this.teleport_layer_init();
      }
    },
  },
};
</script>

<style lang="scss">
@import url("https://yuanshen.site/css/background.css");
@import "../css/map.scss";
@import "../css/selector.scss";
@import "../css/area_component.scss";
.map_containor {
  position: relative;
}
</style>
