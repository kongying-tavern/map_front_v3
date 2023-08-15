import { defineStore } from 'pinia';

export const useCounterStore = defineStore('main', {
  state: () => ({
    area_list: [],
    selected_area: null,
    selected_area_code: '',
    selected_child_area: 0,
    changeitem: null,
    selected_item_list: [],
    teleport_list: [],
    change_mark: false,
    layer_count: new Map(),
  }),
});
