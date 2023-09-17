import { ref } from "vue";
import { create_map, create_map_tiles } from "./map";

export const map = ref(null);

export const mapDom = ref(null);

export const mapTiles = ref(null);

export const mapOptions = ref({});

export const mapBounds = ref([
  [0, 0],
  [0, 0],
]);

export const createMap = (areaCode = "提瓦特-base0") => {
  let mapConfig = create_map_tiles(areaCode);
  let tiles = mapConfig.tiles;
  let tilesConfig = mapConfig.tiles_config || {};
  let mapSettings = mapConfig.map_settings || {};
  const mapMaxBounds = mapConfig.map_bounds || [
    [0, 0],
    [0, 0],
  ];
  let currentMapCode = mapOptions.value?.code || "";
  let newMapCode = tilesConfig.code || "";

  let redrawMap = false;
  if (currentMapCode === newMapCode) {
    // 同一张底图，只需要切换视图
    let center = tilesConfig.settings?.center;
    let zoom = tilesConfig.settings?.zoom;
    if (center) {
      map.value?.flyTo(center, zoom);
      mapBounds.value = mapMaxBounds;
    }
    redrawMap = false;
  } else {
    // 不同底图，需要重绘地图
    clearLayers();
    removeMap();
    const { map: mapObj, tiles: tilesObj } = create_map(mapSettings, tiles);
    mapTiles.value = tilesObj;
    map.value = mapObj;
    mapBounds.value = mapMaxBounds;
    clearSelectedItems();
    redrawMap = true;
  }

  mapOptions.value = tilesConfig;
  return { redrawMap };
};

export const removeMap = () => {
  map.value?.remove();
};

/** 图层映射 */
export const mapLayerMap = ref(new Map());

export const clearLayers = () => {
  for (let i of mapLayerMap.value?.values()) {
    map.value?.removeLayer(i);
  }
};

/** 已选择的物品 */
export const mapSelectedItems = ref([]);

export const clearSelectedItems = () => {
  mapSelectedItems.value = [];
};
