//地图的构建函数

//地图初始化
import * as L from 'leaflet'
import "leaflet/dist/leaflet.css";
import { xumi_underground_name, xumi_underground_list } from "../api/extra_data/xumi_underground"
import { layergroup_register_prototype } from "../api/layer"
//初始化地图中心和地图尺寸
/**
 * 注册地图瓦片
 * @param {string} area_idx 地图别名 twt31：大世界 qd28：梦想群岛 yxg2：渊下宫/三界路飨祭 qd:群岛1 qd2:群岛2
 * @param {Array} mapCenter 地图中心坐标
 * @param {Array} mapSize 地图尺寸
 * @param {Array} mapTilesOffset 地图瓦片的偏移
 * @returns 地图瓦片对象
 */
function create_map_layer(area_idx, mapCenter, mapSize, mapTilesOffset = [0, 0]) {
    let imgform = 'png'
    if (area_idx == 'qd' || area_idx == 'qd1') {
        imgform = 'jpg'
    }
    let tiles_preUrl = 'https://assets.yuanshen.site/tiles_'

    L.TileLayer.T = L.TileLayer.extend({
        getTileUrl: function (coords) {
            var x = coords.x,
                y = coords.y,
                z = coords.z + 13
            return `${tiles_preUrl}${area_idx}/${z}/${x}_${y}.${imgform}`
        },
        //如果此项为true，在平移后不可见的切片被放入一个队列中，在新的切片开始可见时他们会被取回（而不是动态地创建一个新的）。这理论上可以降低内存使用率并可以去除在需要新的切片时预留内存。
        reuseTiles: true,
    });
    let tiles = new L.TileLayer.T('', {
        maxZoom: 10,
        minZoom: -6,
        maxNativeZoom: 0,
        minNativeZoom: -3,
        bounds: L.latLngBounds(
            L.latLng(-mapCenter[0] + mapTilesOffset[0], -mapCenter[1] + mapTilesOffset[1]),
            L.latLng(mapSize[0] - mapCenter[0] + mapTilesOffset[0], mapSize[1] - mapCenter[1] + mapTilesOffset[1])
        ),
    });
    return tiles
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
function create_map(area_idx, settings, mapCenter = [3568, 6286], mapSize = [18432, 16384], mapTilesOffset = [-6144, 0]) {
    //设置地图要使用的坐标参考系（CRS），本地图使用simple类型CRS，将经度和纬度直接映射到x和y。
    let mapCRS = L.Util.extend({}, L.CRS.Simple, {
        //用给定的系数表示变换对象。
        transformation: new L.Transformation(1, 0, 1, 0),
        projection: {
            //将地理坐标投影为CRS所接受的单位坐标
            project: function (latlng) {
                return new L.Point(latlng.lat + mapCenter[0], latlng.lng + mapCenter[1])
            },
            //给定CRS坐标，反向投影为地理坐标
            unproject: function (point) {
                return new L.LatLng(point.x - mapCenter[0], point.y - mapCenter[1])
            },
        },
        //以像素坐标表示矩形区域
        bounds: L.bounds(L.point(0, 0), L.point(mapSize[0], mapSize[1])),
    });
    //地图实例的相关参数，对象属性请参考 https://leafletjs.com/reference.html#map-option
    let map_setting = {
        crs: mapCRS,
        center: [2576, 1742],
        zoomDelta: 0,
        zoomSnap: 0.5,
        maxZoom: 2,
        minZoom: -4,
        zoom: -4,
        tap: false,
        maxBounds: L.latLngBounds(
            L.latLng(-mapCenter[0] + mapTilesOffset[0] - 10000, -mapCenter[1] + mapTilesOffset[1] - 10000),
            L.latLng(mapSize[0] - mapCenter[0] + mapTilesOffset[0] + 10000, mapSize[1] - mapCenter[1] + mapTilesOffset[1] + 10000)
        ),
        attributionControl: false,
        zoomControl: false,
        ...settings
    }

    let tiles = create_map_layer(area_idx, mapCenter, mapSize, mapTilesOffset)
    let map = L.map('map', map_setting).addLayer(tiles);
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
            position: 'bottomright',
        })
        .addTo(map)
    return map
}
//将地图实例对象绑定至指定的dom
function init_map(area) {
    switch (area) {
        case '金苹果群岛':
            return create_map(
                "qd28",
                {
                    center: [600, -2190],
                    zoom: -2,
                },
                [3568, 6286],
                [8192, 8192]
            );

        case '渊下宫':
        case '三界路飨祭':
            return create_map('yxg2', {
            },
                [3568, 6286],
                [12288, 12288],
                [0, 0]
            )
        case '地下矿区':
            return create_map('cyjy', {
                center: [1800, -500],
                zoom: -3
            },
                [3568, 6286],
                [12288, 12288],
                [0, 0]
            )
        case '琉形蜃境':
            return create_map('lxsj', {
            },
                [3568, 6286],
                [12288, 12288],
                [0, 0]
            )
        default:
            return create_map('twt36');

    }
}
//地图蒙层(群岛)的相关参数
const qd_postion = {
    ww: [
        [-494, -1164],
        [1554, -140],
    ],
    pp: [
        [-581, -3214],
        [443, -2190],
    ],
    ss: [
        [528, -4237],
        [2576, -2189],
    ],
    bd: [
        [1433, -1814],
        [2201, -1046],
    ],
}
//添加群岛的额外部分
function add_map_overlay_qd(type, index) {
    let imageUrl = `https://assets.yuanshen.site/tiles_qd28/other/${type}/${index}.png`;
    let imageBounds = [qd_postion[type]]
    return L.imageOverlay(imageUrl, imageBounds)
}
//添加须弥的地下部分 
function create_xumi_underground_layers() {
    let map = new Map();
    for (let i in xumi_underground_name) {
        let zindex = 1000
        let layergroup = layergroup_register_prototype();
        for (let j of xumi_underground_list[i]) {
            let settings = {}
            if (j.length > 2) {
                settings = {
                    group: j[2]
                }
            }
            if (i != 0) {
                zindex = zindex + 50
                settings = {
                    ...settings,
                    zIndex: zindex,
                }
            }
            else {
                zindex = zindex - 50
                settings = {
                    ...settings,
                    zIndex: zindex,
                }
            }
            let overlay = L.imageOverlay(`https://tiles.yuanshen.site/d/underground/${xumi_underground_name[i][0]}/${j[0]}.png`, j[1], settings);
            layergroup.addLayer(overlay);
        }
        map.set(xumi_underground_name[i][1], layergroup)
    }
    return map
}
//添加须弥的地下背景
function add_map_overlay_XumiUnderground() {
    let xumi_underground_map = new Map([
        ['大赤沙海-底图1', {
            imageUrl: `https://tiles.yuanshen.site/d/underground/沙漠/固定底图1.png`,
            imageBounds: [[-7538, 1709], [-6402, 3082]]
        }],
        ['大赤沙海-底图2', {
            imageUrl: `https://tiles.yuanshen.site/d/underground/沙漠/固定底图2.png`,
            imageBounds: [[-6920, 3087], [-6533, 3204]]
        }],
        ['大赤沙海-底图3', {
            imageUrl: `https://tiles.yuanshen.site/d/underground/沙漠/固定底图3.png`,
            imageBounds: [[-5611, 833], [-5448, 982]]
        }],
        ['大赤沙海-底图4', {
            imageUrl: `https://tiles.yuanshen.site/d/underground/沙漠/固定底图4.png`,
            imageBounds: [[-5604, 1326], [-5428, 1522]]
        }],
        ['大赤沙海-底图5', {
            imageUrl: `https://tiles.yuanshen.site/d/underground/沙漠/固定底图5.png`,
            imageBounds: [[-5728, 2015], [-5425, 2484]]
        }],
        ['大赤沙海-底图6', {
            imageUrl: `https://tiles.yuanshen.site/d/underground/沙漠/固定底图6.png`,
            imageBounds: [[-5423, 1897], [-5072, 2182]]
        }],
        ['大赤沙海-底图7', {
            imageUrl: `https://tiles.yuanshen.site/d/underground/沙漠/固定底图7.png`,
            imageBounds: [[-4966, 2185], [-4559, 2565]]
        }],
        ['大赤沙海-底图8', {
            imageUrl: `https://tiles.yuanshen.site/d/underground/沙漠/固定底图8.png`,
            imageBounds: [[-6066, 2842], [-5074, 3549]]
        }]
    ])
    let xumi_underground_bg = layergroup_register_prototype();
    for (let i of xumi_underground_map.keys()) {
        xumi_underground_bg.addLayer(L.imageOverlay(xumi_underground_map.get(i).imageUrl, xumi_underground_map.get(i).imageBounds))
    }
    return xumi_underground_bg
}
//添加群岛3的蒙层
function add_map_overlay_island3() {
    let island3_map = new Map([
        ['底图1', {
            imageUrl: `/imgs/UI_Map_Penumbra_02.png`,
            imageBounds: [[-4223, -4285], [-2019, -2159]]
        }],
        ['底图2', {
            imageUrl: `/imgs/UI_Map_Penumbra_03.png`,
            imageBounds: [[-3208, -4766], [-1150, -1694]]
        }]
        // ['大赤沙海-底图1', {
        //     imageUrl: `https://tiles.yuanshen.site/d/underground/沙漠/固定底图1.png`,
        //     imageBounds: [[-7538, 1709], [-6402, 3082]]
        // }],
        // ['大赤沙海-底图2', {
        //     imageUrl: `https://tiles.yuanshen.site/d/underground/沙漠/固定底图2.png`,
        //     imageBounds: [[-6920, 3087], [-6533, 3204]]
        // }],
    ]);
    let group = layergroup_register_prototype();
    for (let i of island3_map.keys()) {
        group.addLayer(L.imageOverlay(island3_map.get(i).imageUrl, island3_map.get(i).imageBounds), { zIndex: 9999 })
    }
    return group;
}
export {
    create_map_layer,
    create_map,
    add_map_overlay_qd,
    add_map_overlay_XumiUnderground,
    init_map,
    create_xumi_underground_layers, add_map_overlay_island3
}