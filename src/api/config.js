import _ from "lodash";
import { ref } from "vue";
import { fetch_config } from "src/service/config_request";

/** 地图页面配置 */
export const map_web_config = ref({});

/** 地图瓦片配置 */
export const map_tiles_config = ref({});

/** 地图插件配置 */
export const map_plugin_config = ref({});

export const mapLoadConfig = () => {
  return fetch_config().then((config) => {
    map_web_config.value = config?.webMap || {};
    map_tiles_config.value = config?.tiles || {};
    map_plugin_config.value = config?.plugins || {};
  });
};
