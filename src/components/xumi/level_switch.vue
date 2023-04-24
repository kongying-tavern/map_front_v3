<template>
  <div class="levelswitch">
    <q-btn
      round
      color="white"
      text-color="grey"
      :icon="switch_state ? 'mdi-stairs-down' : 'mdi-stairs-up'"
      @click="switch_view"
    >
      <q-tooltip> 切换地上/地下视图 </q-tooltip>
    </q-btn>
    <q-btn
      v-show="!switch_state"
      round
      color="white"
      text-color="grey"
      icon="mdi-format-list-numbered"
      style="margin-top: 40rem"
      @click="dialog = true"
    >
      <q-tooltip> 切换地下层级 </q-tooltip>
    </q-btn>
    <q-dialog v-model="dialog" position="left" seamless style="z-index: 1000">
      <q-card style="width: 450rem; height: 520rem; padding: 8rem">
        <div class="row items-center no-wrap">
          <div>
            <div class="title text-weight-bold">切换地下层级</div>
          </div>
          <q-space />
          <q-btn flat round icon="close" size="16rem" @click="dialog = false" />
        </div>
        <div>
          <q-tabs dense v-model="tab" class="text-primary" :breakpoint="0">
            <q-tab name="大赤沙海" label="大赤沙海" />
            <q-tab name="千壑沙地" label="千壑沙地" />
          </q-tabs>
        </div>
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="大赤沙海">
            <div
              v-for="(i, key, index) in xumi_childarea2_list"
              :key="key"
              style="margin-top: 5rem"
            >
              <div class="title2 text-weight-bold">{{ key }}</div>
              <div>
                <q-option-group
                  v-model="xumi_childarea2_selected[index]"
                  :options="xumi_childarea2_list[key]"
                  color="primary"
                  inline
                  @update:model-value="change_area2"
                />
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel name="千壑沙地" style="padding-top: 0">
            <div>
              <q-btn
                color="primary"
                label="全部显示"
                @click="reset_xumiarea3"
              />
            </div>
            <div
              v-for="(i, key, index) in xumi_childarea3_list"
              :key="key"
              style="margin-top: 8rem"
            >
              <div class="row items-center title2 text-weight-bold">
                <div>{{ key }}</div>
                <div style="margin-left: 15rem">
                  <q-btn
                    color="primary"
                    label="显示该区域"
                    @click="reset_xumiarea3_part(index)"
                    dense
                  />
                </div>
              </div>
              <div>
                <q-option-group
                  v-model="xumi_childarea3_selected[index]"
                  :options="xumi_childarea3_list[key]"
                  color="primary"
                  inline
                  @update:model-value="change_area3"
                />
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { layergroup_register_prototype } from "../../api/layer";
export default {
  name: "LevelSwitch",
  data() {
    return {
      tab: "大赤沙海",
      switch_state: true,
      dialog: false,
      xumi_childarea2_list: {
        秘仪圣殿: [
          { label: "秘仪圣殿·上", value: 0 },
          { label: "秘仪圣殿·中", value: 1 },
          { label: "秘仪圣殿·下", value: 2 },
        ],
        赤王陵: [
          { label: "赤王陵·上", value: 0 },
          { label: "赤王陵·中", value: 1 },
          { label: "赤王陵·下", value: 2 },
          { label: "衡淮大厅", value: -1 },
        ],
        舍身步道: [
          { label: "舍身步道·上", value: 0 },
          { label: "舍身步道·中", value: 1 },
          { label: "舍身步道·下", value: 2 },
        ],
        圣显厅: [
          { label: "圣显厅·上", value: 0 },
          { label: "圣显厅·中", value: 1 },
          { label: "圣显厅·下", value: 2 },
        ],
      },
      xumi_childarea2_selected: [0, -1, 0, 0],
      xumi_childarea3_list: {
        酣乐之殿: [
          { label: "酣乐之殿·上", value: 5 },
          { label: "酣乐之殿·中", value: 4 },
          { label: "酣乐之殿·下", value: 3 },
          { label: "酣乐之殿·底", value: 2 },
          { label: "永恒绿洲", value: 1 },
          { label: "赤王的水晶杯", value: 0 },
        ],
        赤王之殿: [
          { label: "赤王之殿·上", value: 2 },
          { label: "赤王之殿·中", value: 1 },
          { label: "赤王之殿·下", value: 0 },
        ],
        君王之殿: [
          { label: "君王之殿·上", value: 2 },
          { label: "君王之殿·中", value: 1 },
          { label: "君王之殿·下", value: 0 },
        ],
        沙虫隧道: [
          { label: "沙虫隧道·上", value: 2 },
          { label: "沙虫隧道·中", value: 1 },
          { label: "沙虫隧道·下", value: 0 },
        ],
      },
      xumi_childarea3_selected: [-1, -1, -1, -1],
      xumi_overlay3: null,
    };
  },
  methods: {
    switch_view() {
      this.switch_state = !this.switch_state;
      this.$emit("switch1", this.switch_state);
      if (!this.switch_state) {
        this.change_area2();
      } else {
        this.xumi_childarea2_overlay_group.clearLayers();
        this.xumi_childarea3_overlay_group.clearLayers();
      }
    },
    change_area2() {
      let list = Object.keys(this.xumi_childarea2_list);
      let obj = {};
      for (let i in list) {
        obj = {
          ...obj,
          [list[i]]: this.xumi_childarea2_selected[i],
        };
      }
      this.$emit("switch2", obj);
    },
    change_area3() {
      let list = Object.keys(this.xumi_childarea3_list);
      let obj = {};
      for (let i in list) {
        obj = {
          ...obj,
          [list[i]]: this.xumi_childarea3_selected[i],
        };
      }
      this.$emit("switch3", obj);
    },
    reset_xumiarea3() {
      this.xumi_childarea3_selected = [-1, -1, -1, -1];
      this.change_area3();
    },
    reset_xumiarea3_part(index) {
      this.xumi_childarea3_selected[index] = -1;
      this.change_area3();
    },
  },
  mounted() {
    this.xumi_childarea2_overlay_group = layergroup_register_prototype();
    this.xumi_childarea3_overlay_group = layergroup_register_prototype();
  },
};
</script>

<style scoped>
.title {
  font-size: 24rem;
}
.title2 {
  font-size: 18rem;
}
</style>