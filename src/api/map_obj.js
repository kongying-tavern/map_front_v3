import { ref } from "vue";
import { create_map, create_map_tiles } from "./map";

export const map = ref(null);

export const mapDom = ref(null);

export const mapTiles = ref(null);

export const mapOptions = ref({});

export const createMap = (areaCode = "提瓦特-base0") => {
  let mapConfig = create_map_tiles(areaCode);
  let tiles = mapConfig.tiles;
  let tilesConfig = mapConfig.tiles_config || {};
  let mapSettings = mapConfig.map_settings || {};
  let currentMapCode = mapOptions.value?.code || "";
  let newMapCode = tilesConfig.code || "";

  let redrawMap = false;
  if (currentMapCode === newMapCode) {
    // 同一张底图，只需要切换视图
    let center = tilesConfig.settings?.center;
    let zoom = tilesConfig.settings?.zoom;
    if (center) {
      map.value?.flyTo(center, zoom);
    }
    redrawMap = false;
  } else {
    // 不同底图，需要重绘地图
    removeMap();
    const { map: mapObj } = create_map(mapSettings, tiles);
    map.value = mapObj;
    redrawMap = true;
  }

  mapOptions.value = tilesConfig;
  return { redrawMap };
};

export const removeMap = () => {
  map.value?.remove();
};
