//点位相关
import * as L from 'leaflet'
import "leaflet/dist/leaflet.css";
import "../api/leaflet_markercluster/leaflet.markercluster-src.js";
import "leaflet.markercluster/dist/MarkerCluster.css"
import "../api/leaflet_markercluster/MarkerCluster.Default.css"
import "leaflet.featuregroup.subgroup";
/**
 * 生成点位背景
 * @param {Object} data 点位数据对象
 * @param {string} type 点位背景的类型 off：默认；on：选中态；none：无背景
 * @returns {Object} icon对象
 */
function create_icon_options(url, type = "off") {
  let options = {
    html: `
    <svg width="32" height="32" viewBox="0 0 64 64" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Page_01_PC" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="展开/包含切图" transform="translate(-912.000000, -444.000000)">
            <g id="loc_02_off" transform="translate(902.000000, 434.000000)">
                <circle id="椭圆形" fill-opacity="0.298595935" fill="#000000" cx="42" cy="42" r="32"></circle>
                <path d="M42,13 C58.0162577,13 71,25.9837423 71,42 C71,58.0162577 58.0162577,71 42,71 C25.9837423,71 13,58.0162577 13,42 C13,25.9837423 25.9837423,13 42,13 Z M42,20 C29.8497355,20 20,29.8497355 20,42 C20,54.1502645 29.8497355,64 42,64 C54.1502645,64 64,54.1502645 64,42 C64,29.8497355 54.1502645,20 42,20 Z" id="形状结合" fill="#FFFFFF"></path>
            </g>
        </g>
    </g>
</svg>
<img id="markerIcon" width="22" height="22" style="margin: 0 auto;left: 0;right: 0;top: 5px; position: absolute" src="${url == '' ? 'https://assets.yuanshen.site/icons/-1.png' : url}" onerror="javascript:this.src='https://assets.yuanshen.site/icons/-1.png';"/>
<svg width="32" height="32" viewBox="0 0 64 64" version="1.1"
    style="margin: 0 auto;left: 0;right: 0;top: 0px; position: absolute"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <path d="M42,13 C58.0162577,13 71,25.9837423 71,42 L64,42 L64,42 C64,29.8497355 54.1502645,20 42,20 C29.8497355,20 20,29.8497355 20,42 C20,54.1502645 29.8497355,64 42,64 L42,71 L42,71 C25.9837423,71 13,58.0162577 13,42 C13,25.9837423 25.9837423,13 42,13 Z" id="path-1"></path>
        <filter x="-10.3%" y="-10.3%" width="120.7%" height="120.7%" filterUnits="objectBoundingBox" id="filter-1">
            <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 1   0 0 0 0 0.992156863  0 0 0 1 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
        <filter x="-10.3%" y="-10.3%" width="120.7%" height="120.7%" filterUnits="objectBoundingBox" id="filter-2">
            <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0.875   0 0 0 0 0.875   0 0 0 0 0.875  0 0 0 1 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
    </defs>
    <g id="Page_01_PC" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="展开/包含切图" transform="translate(-1103.000000, -336.000000)">
            <g id="loc_02_on" transform="translate(1093.000000, 326.000000)">
                <g id="形状结合" transform="translate(42.000000, 42.000000) rotate(-315.000000) translate(-42.000000, -42.000000) ">
                    <use fill="black" fill-opacity="1" filter="url(${type == 'on' ?'#filter-1':'#filter-2'})" xlink:href="#path-1"></use>
                    <use fill="${type == 'on' ?'#00FFFD':'#E0E0E0'}" fill-rule="evenodd" xlink:href="#path-1"></use>
                </g>
            </g>
        </g>
    </g>
</svg>
<svg width="12px" height="12px" viewBox="0 0 24 24" version="1.1"
    style="margin: 0 auto;left: 0;right: 0;top: 24px; position: absolute"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <path d="M9.02081528,5.48528137 C12.3345238,5.48528137 15.0208153,8.17157288 15.0208153,11.4852814 L15.0208153,11.4852814 L15.0208153,11.4852814 L9.02081528,11.4852814 L9.02081528,5.48528137 Z" id="path-2"></path>
        <filter x="-100.0%" y="-100.0%" width="300.0%" height="300.0%" filterUnits="objectBoundingBox" id="filter-3">
            <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 1   0 0 0 0 0.992156863  0 0 0 1 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
        <filter x="-100.0%" y="-100.0%" width="300.0%" height="300.0%" filterUnits="objectBoundingBox" id="filter-4">
            <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0.875   0 0 0 0 0.875   0 0 0 0 0.875  0 0 0 1 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
    </defs>
    <g id="Page_01_PC" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="展开/包含切图" transform="translate(-1123.000000, -383.000000)">
            <g id="nail_on" transform="translate(1123.000000, 383.000000)">
               <polygon id="矩形备份" fill-opacity="0.298595935" fill="#000000" transform="translate(12.020815, 12.020815) rotate(-225.000000) translate(-12.020815, -12.020815) " points="3.52081528 3.52081528 20.5208153 3.52081528 20.5208153 20.5208153 3.52081528 20.5208153"></polygon>
                <polygon id="矩形备份-2" fill="#FFFFFF" transform="translate(12.020815, 12.020815) rotate(-225.000000) translate(-12.020815, -12.020815) " points="6.52081528 6.52081528 17.5208153 6.52081528 17.5208153 17.5208153 6.52081528 17.5208153"></polygon>
                <g id="矩形备份-3" transform="translate(12.020815, 8.485281) rotate(-225.000000) translate(-12.020815, -8.485281) ">
                    <use fill="black" fill-opacity="1" filter="url(${type == 'on' ?'#filter-3':'#filter-4'})" xlink:href="#path-2"></use>
                    <use fill="${type == 'on' ?'#00FFFD':'#E0E0E0'}" fill-rule="evenodd" xlink:href="#path-2"></use>
                </g>
            </g>
        </g>
    </g>
</svg>
`,
    type: type,
    teleport: false,
    iconUrl: url == '' ? 'https://assets.yuanshen.site/icons/-1.png' : url,
    // shadowUrl: `https://assets.yuanshen.site/icons/loc_02_${type}.png`,
    iconSize: [32, 35], // size of the icon
    // shadowSize: [32, 36], // size of the shadow
    iconAnchor: [16, 35], // point of the icon which will correspond to marker's location
    // shadowAnchor: [16, 35.5], // the same for the shadow
    popupAnchor: [0, -35], // point from which the popup should open relative to the iconAnchor
    className: type == 'on' ? 'opacity_on' : 'opactiy_off'
  };
  if (type == 'off' || type == 'on') {
    return options
  } else {
    options = {
      ...options,
      // html: '',
      shadowUrl: undefined,
      teleport: true
    }
    switch (type) {
      case "七天神像":
        options = {
          ...options,
          iconSize: [30, 43], // size of the icon
          shadowSize: [24, 24], // size of the shadow
          iconAnchor: [15, 21.5], // point of the icon which will correspond to marker's location
          shadowAnchor: [12, 24], // the same for the shadow
          popupAnchor: [0, -21.5], // point from which the popup should open relative to the iconAnchor
        };
        return options;
      case "传送锚点":
        options = {
          ...options,
          iconSize: [23, 33], // size of the icon
          shadowSize: [24, 24], // size of the shadow
          iconAnchor: [11.5, 16.5], // point of the icon which will correspond to marker's location
          shadowAnchor: [12, 24], // the same for the shadow
          popupAnchor: [0, -16.5], // point from which the popup should open relative to the iconAnchor
        };
        return options;
      case "秘境":
      case "征讨领域":
      default:
        options = {
          ...options,
          iconSize: [33, 33], // size of the icon
          shadowSize: [24, 24], // size of the shadow
          iconAnchor: [16.5, 16.5], // point of the icon which will correspond to marker's location
          shadowAnchor: [12, 24], // the same for the shadow
          popupAnchor: [0, -16.5], // point from which the popup should open relative to the iconAnchor
        };
        return options;
    }

  }

}
/**
 * 生成点位
 * @param {array} data  要生成点位的点位数据数组
 * @param {String} iconurl 点位图标链接
 * @returns {Object} marker对象
 */
function layer_register(data, iconurl, type = 'off') {
  // console.log(type);
  let marker = L.marker(data.position.split(','), {
    icon: (type == 'off' || type == 'on') ? L.divIcon(create_icon_options(iconurl, type)) : L.icon(create_icon_options(iconurl, type)),
    data: {
      ...data
    },
    draggable: false,
    riseOnHover: true
  })
  return marker
}
/**
 * 生成点位组
 * @param {array} data  要生成点位的点位数据数组
 * @param {String} iconurl 点位图标链接
 * @returns {Object} layerGroup对象
 */
function layergroup_register(gather = true, data = [], iconurl) {
  let layerGroup = L.markerClusterGroup({
    iconUrl: iconurl,
    maxClusterRadius: gather ? 24 : 0,
  });
  let markers = [];
  for (let i of data) {
    markers.push(layer_register(i, iconurl));
  }
  layerGroup.addLayers(markers);
  return layerGroup
}
/**
 * 生成点位子组
 * @param {array} data  要生成点位的点位数据数组
 * @param {String} iconurl 点位图标链接
 * @returns {Object} subGroup对象
 */
function subgroup_register(parentGroup, data = [], iconurl) {
  let markers = [];
  for (let i of data) {
    markers.push(layer_register(i, iconurl));
  }
  let subGroup = L.featureGroup.subGroup(parentGroup, markers);
  return subGroup
}
/**
 * 标记/取消标记点位
 * @param {array} layer  要标记/取消标记的点位
 * @returns {Object} 标记/取消标记后的点位
 */
function layer_mark(layer, marktype) {
  let type = marktype == undefined ? layer.options.icon.options.type : marktype;
  let icon = ''
  if (type == 'on') {
    icon = L.divIcon(create_icon_options(layer.options.icon.options.iconUrl, 'off'))
  } else if (type == 'off') {
    icon = L.divIcon(create_icon_options(layer.options.icon.options.iconUrl, 'on'))
  } else {
    icon = L.icon(create_icon_options(layer.options.icon.options.iconUrl, 'none'))
  }
  layer = layer.setIcon(icon);
  return layer

}
/**
 * 为点位着色
 * @param {array} layer  要着色的点位
 * @returns {Object} 着色后的点位
 */
function layer_dye(layer, type) {
  let icon = L.divIcon(create_icon_options(layer.options.icon.options.iconUrl, type));
  layer = layer.setIcon(icon);
  return layer
}
export {
  create_icon_options,
  layer_register,
  layergroup_register,
  subgroup_register,
  layer_mark
}
