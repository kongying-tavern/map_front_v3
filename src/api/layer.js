//点位相关
// import * as L from 'leaflet'
// import "leaflet/dist/leaflet.css";
// import "../api/leaflet_markercluster/leaflet.markercluster-src.js";
// import "leaflet.markercluster/dist/MarkerCluster.css"
// import "../api/leaflet_markercluster/MarkerCluster.Default.css"
// import "leaflet.featuregroup.subgroup";
import {
  MarkerLayer
} from "@7c00/canvas-tilemap";

import domtoimage from 'dom-to-image';
/**
 * 生成点位背景
 * @param {Object} url 点点位图标地址
 * @param {string} type 点位背景的类型 off：默认；on：选中态；none：无背景
 * @param {string} extra 额外字段
 * @returns {Object} icon对象
 */
function create_icon_options(tilemap, url, type = "off", extra = false) {
  const node = document.createElement("div");
  node.style.position = "relative";

  node.style.width = "32px";
  node.style.height = "35px";
  node.innerHTML = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink">
      <g id="Page_01_PC" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="展开/包含切图" transform="translate(-912.000000, -444.000000)">
          <g id="loc_02_off" transform="translate(902.000000, 434.000000)">
            <circle id="椭圆形" fill-opacity="0.298595935" fill="#000000" cx="42" cy="42" r="32"></circle>
            <path
              d="M42,13 C58.0162577,13 71,25.9837423 71,42 C71,58.0162577 58.0162577,71 42,71 C25.9837423,71 13,58.0162577 13,42 C13,25.9837423 25.9837423,13 42,13 Z M42,20 C29.8497355,20 20,29.8497355 20,42 C20,54.1502645 29.8497355,64 42,64 C54.1502645,64 64,54.1502645 64,42 C64,29.8497355 54.1502645,20 42,20 Z"
              id="形状结合" fill="#FFFFFF"></path>
          </g>
        </g>
      </g>
    </svg>
    <img id="markerIcon" width="22" height="22" style="margin: 0 auto;left: 0;right: 0;top: 5px; position: absolute" src="${url == '' ? 'https://assets.yuanshen.site/icons/-1.png' : url}" onerror="javascript:this.src='https://assets.yuanshen.site/icons/-1.png';"/>
    <svg width="32" height="32" viewBox="0 0 64 64" version="1.1"
      style="margin: 0 auto;left: 0;right: 0;top: 0px; position: absolute" xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink">
      <g id="Page_01_PC" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="展开/包含切图" transform="translate(-1103.000000, -336.000000)">
          <g id="loc_02_on" transform="translate(1093.000000, 326.000000)">
            <g id="形状结合"
              transform="translate(42.000000, 42.000000) rotate(-315.000000) translate(-42.000000, -42.000000) ">
              <path
              d="M42,13 C58.0162577,13 71,25.9837423 71,42 L64,42 L64,42 C64,29.8497355 54.1502645,20 42,20 C29.8497355,20 20,29.8497355 20,42 C20,54.1502645 29.8497355,64 42,64 L42,71 L42,71 C25.9837423,71 13,58.0162577 13,42 C13,25.9837423 25.9837423,13 42,13 Z"
              id="path-1" fill="${type == 'on' ? '#00FFFD' : '#E0E0E0'}" fill-rule="evenodd"></path>
            </g>
          </g>
        </g>
      </g>
    </svg>
    <svg width="12px" height="12px" viewBox="0 0 24 24" version="1.1"
      style="margin: 0 auto;left: 0;right: 0;top: 24px; position: absolute" xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink">
      <g id="Page_01_PC" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="展开/包含切图" transform="translate(-1123.000000, -383.000000)">
          <g id="nail_on" transform="translate(1123.000000, 383.000000)">
            <polygon id="矩形备份" fill-opacity="0.298595935" fill="#000000"
              transform="translate(12.020815, 12.020815) rotate(-225.000000) translate(-12.020815, -12.020815) "
              points="3.52081528 3.52081528 20.5208153 3.52081528 20.5208153 20.5208153 3.52081528 20.5208153"></polygon>
            <polygon id="矩形备份-2" fill="#FFFFFF"
              transform="translate(12.020815, 12.020815) rotate(-225.000000) translate(-12.020815, -12.020815) "
              points="6.52081528 6.52081528 17.5208153 6.52081528 17.5208153 17.5208153 6.52081528 17.5208153"></polygon>
            <g id="矩形备份-3"
              transform="translate(12.020815, 8.485281) rotate(-225.000000) translate(-12.020815, -8.485281) ">
              <path
                d="M9.02081528,5.48528137 C12.3345238,5.48528137 15.0208153,8.17157288 15.0208153,11.4852814 L15.0208153,11.4852814 L15.0208153,11.4852814 L9.02081528,11.4852814 L9.02081528,5.48528137 Z"
                id="path-2" fill="${type == 'on' ? '#00FFFD' : '#E0E0E0'}" fill-rule="evenodd"></path>
            </g>
          </g>
        </g>
      </g>
    </svg>`
  if (type == 'off' || type == 'on') {
    if (extra) {
      node.innerHTML = `${node.innerHTML}
      <div class="xumu_underground_marker"></div>
      `
    }
  } else {
    options = {
      ...options,
      // html: '',
      shadowUrl: undefined,
      teleport: true
    }
    switch (type) {
      case "七天神像":
        node.style.width = "30px";
        node.style.height = "43px";
        node.innerHTML = `
        <img id="markerIcon" width="30" height="43" style="margin: 0 auto;left: 0;right: 0;top: 5px; position: absolute" src="${url == '' ? 'https://assets.yuanshen.site/icons/-1.png' : url}" onerror="javascript:this.src='https://assets.yuanshen.site/icons/-1.png';"/>
        `
        break;
      case "传送锚点":
        node.style.width = "23px";
        node.style.height = "33px";
        node.innerHTML = `
        <img id="markerIcon" width="23" height="33" style="margin: 0 auto;left: 0;right: 0;top: 5px; position: absolute" src="${url == '' ? 'https://assets.yuanshen.site/icons/-1.png' : url}" onerror="javascript:this.src='https://assets.yuanshen.site/icons/-1.png';"/>
        `
        break;
      default:
        node.style.width = "33px";
        node.style.height = "33px";
        node.innerHTML = `
        <img id="markerIcon" width="33" height="33" style="margin: 0 auto;left: 0;right: 0;top: 5px; position: absolute" src="${url == '' ? 'https://assets.yuanshen.site/icons/-1.png' : url}" onerror="javascript:this.src='https://assets.yuanshen.site/icons/-1.png';"/>
        `
        break;
    }
    if (extra) {
      node.innerHTML = `${node.innerHTML}
      <div class="xumu_underground_teleport_marker"></div>
      `
    }
  }
  const image = new Image();
  // icon.addEventListener("load", () => {
  // const canvas2d = canvas.getContext("2d")!;
  document.body.appendChild(node);
  domtoimage.toPng(node).then(function (dataUrl) {
    image.src = dataUrl;
    // image.addEventListener("load", () => {
    // canvas.width = iconSize;
    // canvas.height = iconSize;

    // let size = [image.width, image.height];
    // if (image.width > image.height) {
    //   size = [iconSize, (size[1] * iconSize) / size[0]];
    // } else {
    //   size = [(size[0] * iconSize) / size[1], iconSize];
    // }
    // canvas2d.drawImage(
    //   image,
    //   (iconSize - size[0]) / 2,
    //   (iconSize - size[1]) / 2,
    //   size[0],
    //   size[1]
    // );
    // tilemap.draw();
    // })
    tilemap.draw();
    document.body.removeChild(node);
  })
  // });
  return image;
}
/**
 * 生成点位
 * @param {array} data  要生成点位的点位数据数组
 * @param {String} iconurl 点位图标链接
 * @returns {Object} marker对象
 */
function layer_register(tilemap, markersMap, data, iconurl, type = 'off', extra = false) {
  let marker = new MarkerLayer(tilemap, {
    positions: data.map((i) =>
      i.position.split(",").map((i) => parseInt(i))
    ),
    image: create_icon_options(tilemap, iconurl, type, extra)
  });
  markersMap.set(marker, data);
  tilemap.markerLayers.add(marker);
  return marker;
}
/**
 * 再生成点位
 * @param {array} data  要生成点位的点位数据数组
 * @param {String} iconurl 点位图标链接
 * @returns {Object} marker对象
 */
async function layer_Reregister(tilemap, marker) {
  tilemap.markerLayers.add(
    marker
  );
  return marker
}
/**
 * 生成点位组
 * @param {array} data  要生成点位的点位数据数组
 * @param {String} iconurl 点位图标链接
 * @returns {Object} layerGroup对象
 */
function layergroup_register(tilemap, markersMap, markerChecked, teleport = false, data = [], iconurl) {
  let layers = new Map();
  data.forEach(a => {
    if (teleport) {
      if (a.extra.search('sumeru') != -1) {
        layers['teleport_underground'].add(a);
      } else {
        layers['teleport'].add(a);
      }
    } else {
      if (markerChecked.has(a.id)) {
        if (a.extra.search('sumeru') != -1) {
          layers['underground_checked'].add(a);
        } else {
          layers['checked'].add(a);
        }
      } else {
        if (a.extra.search('sumeru') != -1) {
          layers['underground'].add(a);
        } else {
          layers['normal'].add(a);
        }
      }
    }
  });
  let registedLayers = new Set();
  layers.forEach((val, key) => {
    switch (key) {
      case 'normal':
        registedLayers.add(layer_register(tilemap, markersMap, val, iconurl));
        break;
      case 'checked':
        registedLayers.add(layer_register(tilemap, markersMap, val, iconurl, 'on'));
        break;
      case 'underground':
        registedLayers.add(layer_register(tilemap, markersMap, val, iconurl, 'off', true));
        break;
      case 'underground_checked':
        registedLayers.add(layer_register(tilemap, markersMap, val, iconurl, 'on', true));
        break;
      case 'teleport':
        registedLayers.add(layer_register(tilemap, markersMap, val, iconurl, 'teleport'));
        break;
      case 'teleport_underground':
        registedLayers.add(layer_register(tilemap, markersMap, val, iconurl, 'teleport', true));
        break;
      default:
        registedLayers.add(layer_register(tilemap, markersMap, val, iconurl));
        break;
    }
  })
  return registedLayers;
}

/**
 * 标记/取消标记点位
 * @param {array} layer  要标记/取消标记的点位
 * @returns {Object} 标记/取消标记后的点位
 */
function layer_mark(layer, marktype) {
  return layer
}

export {
  create_icon_options,
  layer_register,
  layergroup_register,
  layer_mark,
  layer_Reregister
}
