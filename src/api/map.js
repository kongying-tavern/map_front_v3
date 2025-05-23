//地图的构建函数

//地图初始化
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import _ from "lodash";
import { map_tiles_config, map_plugin_config } from "./config";
import { mapDom } from "./map_obj";

//初始化地图中心和地图尺寸
/**
 * 获取地图插件配置
 */
function get_map_plugin_config(area_code = "") {
  return map_plugin_config.value[area_code] || {};
}

/**
 * 注册地图瓦片
 * @param {string} area_code 地图别名 twt31：大世界 qd28：梦想群岛 yxg2：渊下宫/三界路飨祭 qd:群岛1 qd2:群岛2
 * @param {Array} mapCenter 地图中心坐标
 * @param {Array} mapSize 地图尺寸
 * @param {Array} mapTilesOffset 地图瓦片的偏移
 * @returns 地图瓦片对象
 */
function create_map_layer(
  area_idx,
  mapCenter,
  mapSize,
  mapTilesOffset = [0, 0],
  extension = "png",
) {
  const tiles_preUrl = "https://assets.yuanshen.site/tiles_";

  L.TileLayer.T = L.TileLayer.extend({
    getTileUrl(coords) {
      const { x } = coords;
      const { y } = coords;
      const z = coords.z + 13;
      return `${tiles_preUrl}${area_idx}/${z}/${x}_${y}.${extension}`;
    },
    // 如果此项为true，在平移后不可见的切片被放入一个队列中，在新的切片开始可见时他们会被取回（而不是动态地创建一个新的）。这理论上可以降低内存使用率并可以去除在需要新的切片时预留内存。
    reuseTiles: true,
  });
  const tiles = new L.TileLayer.T("", {
    maxZoom: 10,
    minZoom: -6,
    maxNativeZoom: 0,
    minNativeZoom: -3,
    bounds: L.latLngBounds(
      L.latLng(
        -mapCenter[0] + mapTilesOffset[0],
        -mapCenter[1] + mapTilesOffset[1],
      ),
      L.latLng(
        mapSize[0] - mapCenter[0] + mapTilesOffset[0],
        mapSize[1] - mapCenter[1] + mapTilesOffset[1],
      ),
    ),
  });
  return tiles;
}

function create_map_config(area_config_code = "") {
  let tiles_config_default = {
    center: [3568, 6286],
    size: [12288, 15360],
    tilesOffset: [0, 0],
    extension: "png",
  };

  // 获取基础配置
  let tiles_key = "";
  if (map_tiles_config.value[area_config_code]) {
    tiles_key = area_config_code;
  } else if (map_tiles_config.value["提瓦特-base0"]) {
    tiles_key = "提瓦特-base0";
  }
  let tiles_config = map_tiles_config.value[tiles_key] || {};

  // 继承配置
  const tiles_extend_name = tiles_config.extend || "";
  tiles_config = _.defaultsDeep(
    {},
    tiles_config,
    map_tiles_config.value[tiles_extend_name] || {},
    tiles_config_default,
  );

  return {
    tiles_key,
    tiles_config,
    area_code: area_config_code,
  };
}

function create_map_tiles(area_config_code = "") {
  let { tiles_config } = create_map_config(area_config_code);

  const area_code = tiles_config.code;
  if (!area_code) {
    return;
  }

  const { settings } = tiles_config;
  const mapCenter = tiles_config.center;
  const mapSize = tiles_config.size;
  const mapTilesOffset = tiles_config.tilesOffset;
  const extension = tiles_config.extension;

  // 设置地图要使用的坐标参考系（CRS），本地图使用simple类型CRS，将经度和纬度直接映射到x和y。
  const mapCRS = L.Util.extend({}, L.CRS.Simple, {
    // 用给定的系数表示变换对象。
    transformation: new L.Transformation(1, 0, 1, 0),
    projection: {
      // 将地理坐标投影为CRS所接受的单位坐标
      project(latlng) {
        return new L.Point(
          latlng.lat + mapCenter[0],
          latlng.lng + mapCenter[1],
        );
      },
      // 给定CRS坐标，反向投影为地理坐标
      unproject(point) {
        return new L.LatLng(point.x - mapCenter[0], point.y - mapCenter[1]);
      },
    },
    // 以像素坐标表示矩形区域
    bounds: L.bounds(L.point(0, 0), L.point(mapSize[0], mapSize[1])),
  });
  const map_bounds = [
    [
      -mapCenter[0] + mapTilesOffset[0] - 10000,
      -mapCenter[1] + mapTilesOffset[1] - 10000,
    ],
    [
      mapSize[0] - mapCenter[0] + mapTilesOffset[0] + 10000,
      mapSize[1] - mapCenter[1] + mapTilesOffset[1] + 10000,
    ],
  ];
  const map_settings = {
    crs: mapCRS,
    center: [2576, 1742],
    zoomDelta: 0,
    zoomSnap: 0.5,
    maxZoom: 2,
    minZoom: -4,
    zoom: -4,
    tap: false,
    maxBounds: L.latLngBounds(
      L.latLng(map_bounds[0][0], map_bounds[0][1]),
      L.latLng(map_bounds[1][0], map_bounds[1][1]),
    ),
    attributionControl: false,
    zoomControl: false,
    ...settings,
  };

  const tiles = create_map_layer(
    area_code,
    mapCenter,
    mapSize,
    mapTilesOffset,
    extension,
  );

  return { tiles_config, tiles, map_settings, map_bounds };
}

function create_map(settings = {}, tiles) {
  let map = L.map(mapDom.value, settings).addLayer(tiles);

  L.control
    .attribution({
      prefix: `
  <footer role='contentinfo' class='footer'>
      <a href='https://yuanshen.site/docs/disclaimer.html' target='_blank' title='空荧酒馆免责声明'>免责声明</a>
      <a href='https://yuanshen.site/docs/join.html' target='_blank' target='_blank' title='加入我们'>招募</a>
      <a href='https://yuanshen.site/docs/blog/changelog-web' target='_blank' rel='noopener noreferrer' title='空荧酒馆原神地图更新日志'>更新日志</a>
      <a href='https://github.com/kongying-tavern' target='_blank' rel='noopener noreferrer' title='GitHub'>GitHub</a>
      <a href='http://beian.miit.gov.cn' target='_blank' rel='noopener noreferrer' title='工业和信息化部域名信息备案管理系统'>蜀ICP备2020028219号-1</a>
  </footer>
      `,
      position: "bottomright",
    })
    .addTo(map);

  return { tiles, map };
}

function add_map_overlay(imageUrl, imageBounds, opts = {}) {
  return L.imageOverlay(imageUrl, imageBounds, opts);
}

function add_map_polygon(polygon = [], opts = {}) {
  return L.polygon(polygon, opts);
}

export {
  get_map_plugin_config,
  create_map_layer,
  create_map_config,
  create_map_tiles,
  create_map,
  add_map_overlay,
  add_map_polygon,
};
