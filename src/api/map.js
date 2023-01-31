//地图的构建函数

//地图初始化
import * as L from 'leaflet'
import "leaflet/dist/leaflet.css";
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
function create_map(area_idx, settings, mapCenter = [3568, 6286], mapSize = [17408, 16384], mapTilesOffset = [-5120, 0]) {
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
        default:
            return create_map('twt34');

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
function add_map_overlay_XumiUnderground() {
    let xumi_underground_map = new Map([
        ['诸法丛林-底图1', {
            imageUrl: `https://assets.yuanshen.site/overlay/YL/1.png`,
            imageBounds: [[-6299 + 1427, -2190 + 1353], [-6299 + 1427 + 404, -2190 + 1353 + 504]]
        }],
        ['诸法丛林-底图2', {
            imageUrl: `https://assets.yuanshen.site/overlay/YL/2.png`,
            imageBounds: [[-6299 + 1299, -2190 + 2040], [-6299 + 1299 + 648, -2190 + 2040 + 570]]
        }],
        ['诸法丛林-底图3', {
            imageUrl: `https://assets.yuanshen.site/overlay/YL/3.png`,
            imageBounds: [[-6299 + 2199, -2190 + 1671], [-6299 + 2199 + 398, -2190 + 1671 + 306]]
        }],
        ['诸法丛林-底图4', {
            imageUrl: `https://assets.yuanshen.site/overlay/YL/4.png`,
            imageBounds: [[-6299 + 2177, -2190 + 2168], [-6299 + 2177 + 570, -2190 + 2168 + 515]]
        }],
        ['诸法丛林-底图5', {
            imageUrl: `https://assets.yuanshen.site/overlay/YL/5.png`,
            imageBounds: [[-6299 + 2734, -2190 + 937], [-6299 + 2734 + 433, -2190 + 937 + 660]]
        }],
        ['诸法丛林-底图6', {
            imageUrl: `https://assets.yuanshen.site/overlay/YL/6.png`,
            imageBounds: [[-6299 + 3323, -2190 + 507], [-6299 + 3323 + 443, -2190 + 507 + 377]]
        }],
        ['诸法丛林-底图7', {
            imageUrl: `https://assets.yuanshen.site/overlay/YL/7.png`,
            imageBounds: [[-6299 + 3426, -2190 + 924], [-6299 + 3426 + 278, -2190 + 924 + 360]]
        }],
        ['诸法丛林-底图8', {
            imageUrl: `https://assets.yuanshen.site/overlay/YL/8.png`,
            imageBounds: [[-6299 + 3796, -2190 + 1024], [-6299 + 3796 + 344, -2190 + 1024 + 393]]
        }],
        ['诸法丛林-底图9', {
            imageUrl: `https://assets.yuanshen.site/overlay/YL/9.png`,
            imageBounds: [[-6299 + 3563, -2190 + 1604], [-6299 + 3563 + 443, -2190 + 1604 + 799]]
        }],
        ['诸法丛林-底图10', {
            imageUrl: `https://assets.yuanshen.site/overlay/YL/10.png`,
            imageBounds: [[-6299 + 3787, -2190 + 2710], [-6299 + 3787 + 378, -2190 + 2710 + 560]]
        }],
        ['诸法丛林-底图11', {
            imageUrl: `https://assets.yuanshen.site/overlay/YL/11.png`,
            imageBounds: [[-6299 + 3086, -2190 + 3297], [-6299 + 3086 + 521, -2190 + 3297 + 433]]
        }],
        ['诸法丛林-底图12', {
            imageUrl: `https://assets.yuanshen.site/overlay/YL/12.png`,
            imageBounds: [[-6299 + 1887, -2190 + 3637], [-6299 + 1887 + 740, -2190 + 3637 + 346]]
        }],

        ['大赤沙海-底图1', {
            imageUrl: `https://assets.yuanshen.site/overlay/SM/固定底图1.png`,
            imageBounds: [[-7664 + 142, 540 + 1183], [-7664 + 142 + 1119, 540 + 1183 + 1351]]
        }],
        ['大赤沙海-底图2', {
            imageUrl: `https://assets.yuanshen.site/overlay/SM/固定底图2.png`,
            imageBounds: [[-7664 + 756, 540 + 2256], [-7664 + 756 + 372, 540 + 2256 + 105]]
        }],
        ['大赤沙海-底图3', {
            imageUrl: `https://assets.yuanshen.site/overlay/SM/固定底图3.png`,
            imageBounds: [[-7664 + 2062, 540 + 303], [-7664 + 2062 + 152, 540 + 303 + 132]]
        }],
        ['大赤沙海-底图4', {
            imageUrl: `https://assets.yuanshen.site/overlay/SM/固定底图4.png`,
            imageBounds: [[-7664 + 2072, 540 + 796], [-7664 + 2072 + 160, 540 + 796 + 178]]
        }],
        ['大赤沙海-底图5', {
            imageUrl: `https://assets.yuanshen.site/overlay/SM/固定底图5.png`,
            imageBounds: [[-7664 + 1948, 540 + 1483], [-7664 + 1948 + 293, 540 + 1483 + 465]]
        }],
        ['大赤沙海-底图6', {
            imageUrl: `https://assets.yuanshen.site/overlay/SM/固定底图6.png`,
            imageBounds: [[-7664 + 2254, 540 + 1370], [-7664 + 2254 + 332, 540 + 1370 + 271]]
        }],
        ['大赤沙海-底图7', {
            imageUrl: `https://assets.yuanshen.site/overlay/SM/固定底图7.png`,
            imageBounds: [[-7664 + 2708, 540 + 1656], [-7664 + 2708 + 398, 540 + 1656 + 365]]
        }],
        ['大赤沙海-底图8', {
            imageUrl: `https://assets.yuanshen.site/overlay/SM/固定底图8.png`,
            imageBounds: [[-7664 + 1608, 540 + 2316], [-7664 + 1608 + 985, 540 + 2316 + 693]]
        }],
        // ['千壑沙地', {
        //     imageUrl: `https://assets.yuanshen.site/overlay/赤王的水晶杯-阴影.png`,
        //     imageBounds: [[-7043, -284], [-6274, 618]]
        // }]
    ])
    let xumi_map_overlay = [];
    for (let i of xumi_underground_map.keys()) {
        xumi_map_overlay.push(L.imageOverlay(xumi_underground_map.get(i).imageUrl, xumi_underground_map.get(i).imageBounds))
    }
    return xumi_map_overlay
}
function add_map_overlay_XumiArea2() {
    let overlay_list = [[], [], [], []];
    let XumiArea2_list = [
        [
            ['秘仪1', [[-7664 + 1108, 540 + 1682], [-7664 + 1108 + 460, 540 + 1682 + 259]]],
            ['秘仪2', [[-7664 + 1129, 540 + 1589], [-7664 + 1129 + 279, 540 + 1589 + 325]]],
            ['秘仪3', [[-7664 + 1149, 540 + 1629], [-7664 + 1149 + 305, 540 + 1629 + 259]]]
        ],
        [
            ['王陵1', [[-7664 + 729, 540 + 1729], [-7664 + 729 + 124, 540 + 1729 + 85]]],
            ['王陵2', [[-7664 + 696, 540 + 1642], [-7664 + 696 + 372, 540 + 1642 + 246]]],
            ['王陵3', [[-7664 + 721, 540 + 1702], [-7664 + 721 + 187, 540 + 1702 + 166]]]
        ],
        [
            ['舍身1', [[-7664 + 2250, 540 + 1489], [-7664 + 2250 + 356, 540 + 1489 + 432]]],
            ['舍身2', [[-7664 + 2152, 540 + 1596], [-7664 + 2152 + 312, 540 + 1596 + 398]]],
            ['舍身3', [[-7664 + 2276, 540 + 1649], [-7664 + 2276 + 324, 540 + 1649 + 332]]]
        ],
        [
            ['圣显1', [[-7664 + 1834, 540 + 509], [-7664 + 1834 + 567, 540 + 509 + 212]]],
            ['圣显2', [[-7664 + 1809, 540 + 502], [-7664 + 1809 + 592, 540 + 502 + 226]]],
            ['圣显3', [[-7664 + 1822, 540 + 509], [-7664 + 1822 + 579, 540 + 509 + 219]]]
        ]
    ];
    for (let i = 0; i < 4; i++) {
        for (let j of XumiArea2_list[i]) {
            let overlay = L.imageOverlay(`https://assets.yuanshen.site/overlay/SM/${j[0]}.png`, j[1]);
            overlay_list[i].push(overlay)
        }
    }
    return overlay_list

};
function add_map_overlay_XumiArea3() {
    let overlay_list = [];
    let XumiArea3_list = [
        [
            ['酣乐之殿1', [[-6972, -455], [-6972 + 270, -455 + 354]]],
            ['酣乐之殿2', [[-6882, -548], [-6882 + 505, -548 + 514]]],
            ['酣乐之殿3', [[-6997, -496], [-6997 + 347, -496 + 178]]],
            ['酣乐之殿4', [[-6904, -494], [-6904 + 285, -494 + 279]]],
            ['永恒绿洲', [[-6793, -125], [-6793 + 698, -125 + 689]]],
            ['赤王的水晶杯', [[-7043, -284], [-7043 + 769, -284 + 902]]]],
        [
            ['君王之殿1', [[-6310, 138], [-6310 + 442, 138 + 409]]],
            ['君王之殿2', [[-6089, 139], [-6089 + 222, 139 + 139]]],
            ['君王之殿3', [[-6368, 145], [-6368 + 435, 145 + 468]]],
        ],
        [
            ['沙虫隧道1', [[-5914, -61], [-5914 + 682, -61 + 814]]],
            ['沙虫隧道2', [[-5517, -19], [-5517 + 275, -19 + 506]]],
            ['沙虫隧道3', [[-5490, -25], [-5490 + 180, -25 + 290]]],
        ],
        [
            ['居尔城墟·赤王神殿1', [[-7341, 1174], [-7341 + 583, 1174 + 688]]],
            ['居尔城墟·赤王神殿2', [[-6886, 1577], [-6886 + 130, 1577 + 169]]],
            ['居尔城墟·赤王神殿3', [[-7317, 1237], [-7317 + 581, 1237 + 482]]],
        ],
        [
            ['生命之殿', [[-7612, 2], [-7612 + 643, 2 + 588]]],
            ['五绿洲', [[-6171, -730], [-6171 + 643, -730 + 390]]],
            ['行宫花园', [[-7219, -785], [-7219 + 507, -785 + 522]]],
            ['镇灵监牢及巨人峡谷', [[-7186, 502], [-7186 + 788, 502 + 510]]],
        ]
    ];
    for (let i = 0; i < 5; i++) {
        let arr = [];
        for (let j of XumiArea3_list[i]) {
            let overlay = L.imageOverlay(`https://assets.yuanshen.site/overlay/${j[0]}-阴影.png`, j[1], {
                zIndex: 100
            });
            arr.push(overlay)
        }
        overlay_list.push(arr);
    }
    return overlay_list
}
export {
    create_map_layer,
    create_map,
    add_map_overlay_qd,
    add_map_overlay_XumiUnderground,
    add_map_overlay_XumiArea2,
    add_map_overlay_XumiArea3,
    init_map
}