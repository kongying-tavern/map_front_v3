//地图的构建函数

//地图初始化
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import _ from "lodash";
import { map_tiles_config } from "./config";
import { mapDom, mapTiles } from "./map_obj";

//初始化地图中心和地图尺寸
/**
 * 注册地图瓦片
 * @param {string} area_code 地图别名 twt31：大世界 qd28：梦想群岛 yxg2：渊下宫/三界路飨祭 qd:群岛1 qd2:群岛2
 * @param {Array} mapCenter 地图中心坐标
 * @param {Array} mapSize 地图尺寸
 * @param {Array} mapTilesOffset 地图瓦片的偏移
 * @returns 地图瓦片对象
 */
function create_map_layer(
  area_code,
  mapCenter,
  mapSize,
  mapTilesOffset = [0, 0],
  extension = "png",
) {
  let imgform = "png";
  if (area_code == "qd" || area_code == "qd1") {
    imgform = "jpg";
  }
  let tiles_preUrl = "https://assets.yuanshen.site/tiles_";

  L.TileLayer.T = L.TileLayer.extend({
    getTileUrl: function (coords) {
      var x = coords.x,
        y = coords.y,
        z = coords.z + 13;
      return `${tiles_preUrl}${area_code}/${z}/${x}_${y}.${imgform}`;
    },
    //如果此项为true，在平移后不可见的切片被放入一个队列中，在新的切片开始可见时他们会被取回（而不是动态地创建一个新的）。这理论上可以降低内存使用率并可以去除在需要新的切片时预留内存。
    reuseTiles: true,
  });
  let tiles = new L.TileLayer.T("", {
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
/**
 * 生成地图的实例对象
 * @param {string} area_idx 地图别名 twt29：大世界 qd28：梦想群岛 yxg2：渊下宫/三界路飨祭 qd:群岛1 qd2:群岛2
 * @param {object} settings leaflet 地图设置
 * @param {Array} mapCenter 地图中心坐标
 * @param {Array} mapSize 地图尺寸
 * @param {Array} mapTilesOffset 地图瓦片的偏移
 * @returns 地图对象
 */
function create_map(area_config_code = "") {
  let tiles_config =
    map_tiles_config.value[area_config_code] ||
    map_tiles_config.value["提瓦特-base0"] ||
    {};
  const tiles_extend_name = tiles_config.extend || "";
  if (tiles_extend_name) {
    tiles_config = _.defaultsDeep(
      {},
      tiles_config,
      map_tiles_config.value[tiles_extend_name] || {},
    );
  }

  const area_code = tiles_config.code;
  if (!area_code) {
    return;
  }

  const { settings } = tiles_config;
  const mapCenter = tiles_config.center || [3568, 6286];
  const mapSize = tiles_config.size || [12288, 15360];
  const mapTilesOffset = tiles_config.tilesOffset || [0, 0];
  const extension = tiles_config.extension || "png";

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
  const map_setting = {
    crs: mapCRS,
    center: [2576, 1742],
    zoomDelta: 0,
    zoomSnap: 0.5,
    maxZoom: 2,
    minZoom: -4,
    zoom: -4,
    tap: false,
    maxBounds: L.latLngBounds(
      L.latLng(
        -mapCenter[0] + mapTilesOffset[0] - 10000,
        -mapCenter[1] + mapTilesOffset[1] - 10000,
      ),
      L.latLng(
        mapSize[0] - mapCenter[0] + mapTilesOffset[0] + 10000,
        mapSize[1] - mapCenter[1] + mapTilesOffset[1] + 10000,
      ),
    ),
    attributionControl: false,
    zoomControl: false,
    ...settings,
  };

  mapTiles.value = create_map_layer(
    area_code,
    mapCenter,
    mapSize,
    mapTilesOffset,
    extension,
  );
  const map = L.map(mapDom.value, map_setting).addLayer(mapTiles.value);
  L.control
    .attribution({
      prefix: `
  <footer role='contentinfo' class='footer'>
      <a href='https://yuanshen.site/docs/disclaimer.html' target='_blank' title='空荧酒馆免责声明'>免责声明</a>
      <a href='https://yuanshen.site/docs/join.html' target='_blank' target='_blank' title='加入我们'>招募</a>
      <a href='https://support.qq.com/products/321980/blog-archive' target='_blank' rel='noopener noreferrer' title='空荧酒馆原神地图更新日志'>更新日志</a>
      <a href='https://github.com/kongying-tavern' target='_blank' rel='noopener noreferrer' title='GitHub'>GitHub</a>
      <a href='http://beian.miit.gov.cn' target='_blank' rel='noopener noreferrer' title='工业和信息化部域名信息备案管理系统'>蜀ICP备2020028219号-1</a>
  </footer>
      `,
      position: "bottomright",
    })
    .addTo(map);
  return map;
}

export { create_map_layer, create_map };
