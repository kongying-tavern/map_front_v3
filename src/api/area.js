import _ from "lodash";
import { ref, computed } from "vue";
import { map_web_config } from "src/api/config";
import { easterEggMode } from "./easter-egg";

export const areaSelectorDom = ref(null);

export const area_selected_top = ref({});

export const area_selected_child = ref({});

export const area_list = ref([]);

export const area_map_code = computed(() => _.keyBy(area_list.value, "code"));

export const area_group = computed(() => {
  let group = _.chain(area_list.value)
    .filter((v) => {
      const block_areas = map_web_config.value?.blockArea || [];
      return block_areas.indexOf(v.code) === -1;
    })
    .groupBy("parentId")
    .mapValues((v) => _.sortBy(v, (area) => -area.sortIndex))
    .value();
  return group;
});

export const area_list_top = computed(() => {
  return easterEggMode.value
    ? area_list_top_full.value
    : _.filter(area_list_top_full.value, (v) => v.hiddenFlag !== 3);
});

export const area_list_top_full = computed(() => {
  return area_group.value[-1] || [];
});

export const area_first_top = computed(() => {
  return area_list_top.value[0] || {};
});

export const area_list_child = computed(() => {
  return easterEggMode.value
    ? area_list_child_full.value
    : _.filter(area_list_child_full.value, (v) => v.hiddenFlag !== 3);
});

export const area_list_child_full = computed(() => {
  return area_group.value[area_selected_top.value?.areaId] || [];
});

export const area_first_child = computed(() => {
  return area_list_child.value[0] || {};
});
