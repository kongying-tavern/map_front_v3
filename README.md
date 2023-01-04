# 原神地图v3 (yuanshenmap-v3)

本项目基于[quasar-vite](https://quasar.dev/start/quasar-cli)构建

## 项目相关
### 安装依赖
```bash
yarn
# or
npm install
```

### 进入开发模式
```bash
quasar dev
```

### 构建
```bash
quasar build
```

## 地图相关功能
gitee相关的接口说明，请参考[Gitee Api文档](https://gitee.com/api/v5/swagger)
### 鉴权
在页面登录前，鉴定是否有gitee的oauth2相关的token，若没有的话，则以游客方式登录

**游客登录请求是本项目的接口，并非gitee api**

鉴权实现在 router/index.js文件内

```javascript
Router.beforeEach((to, from, next) => {
    //鉴定是否存在token，若否，默认以游客身份登录
    if (get_user_token() == null) {
      quest_request().then(res => {
        set_user_token(res.data.access_token, res.data.expires_in)
        next();
      })
    }
    else {
      next();
    }
  })
```
### 地图构建

地图构建相关函数在api/map.js文件内

地图相关参数及构建方法已经封装，无须了解其具体功能

生成地图时，首先在页面上生成其容器dom

```html
<!-- id为map的div为容器，其余两个为地图的背景蒙层 -->
<div class="map_containor">
    <div class="stars"></div>
    <div class="twinkling"></div>
    <div id="map"></div>
</div>
```
然后在mounted时，生成地图
```javascript
import { init_map } from "../api/map";
......
mounted() {
    //生成地图
    this.map = init_map();
  },
```
地图容器需要定义其高度和宽度，地图蒙层容器需要样式，可直接引用旧版样式文件

```css
@import url("https://yuanshen.site/css/background.css");/* 地图蒙层样式 */

#map {
    width: 100vw;
    height: 100vh;
    background: transparent;
    z-index: 1000;
    background: radial-gradient(transparent 70%, rgba(0, 0, 0, 0.5));
}
```
### 点位选择

#### 概述

在本项目中，点位筛选逻辑分为四级

地区(area)_→点位类型(type)→点位集合(item)→单个点位(layer)

***注意***

>在地区筛选等级中，由于每个地区划分为多个子地区，因此规定，后续筛选等级于子地区为基准

>点位类型的相关数据在每个地区‘基本’一致，因此在页面构建时点位类型便已被请求并渲染至物品选择器中

#### 点位选择逻辑

本项目的点位请求逻辑如下：

首先渲染所有父级地区

选择父级地区之后，请求其子级地区的数据后，用户可以选择子地区

（上述即是页面上方地区选择器的功能）

选择完毕后，用户可以在右侧类型选择器选择点位类型

选择后，即查询***该子地区下所选类型***的所有点位集合，并渲染至类型的下拉列表之中

选择某一或某多个点位集合后，请求这些点位集合下所有单个点位的数据

### 点位生成

点位生成的相关函数在api/layer.js下

[leaflet的点位的api](https://leafletjs.com/reference.html#marker)

[leaflet的点位组的api](https://leafletjs.com/reference.html#layergroup)

具体的渲染过程和存储过程较为复杂，可参考 pages/IndexPage.vue 文件中的具体实现
