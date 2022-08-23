import { defineStore } from 'pinia';

export const useCounterStore = defineStore('main', {
  state: () => ({
    selected_child_area: 0,
    selected_item_list: [],
  }),
});
