import { ref } from "vue";
import { create_map } from "./map";

export const map = ref(null);

export const mapDom = ref(null);

export const mapTiles = ref(null);

export const createMap = (areaCode = "提瓦特-base0") => {
  map.value = create_map(areaCode);
};

export const removeMap = () => {
  map.value?.remove();
};
