<template>
  <div class="levelswitch">
    <q-btn
      round
      color="white"
      text-color="grey"
      :icon="switch_state ? 'mdi-layers-outline' : 'mdi-layers'"
      size="25rem"
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
      style="margin-top: 20rem"
      size="25rem"
      @click="dialog = true"
    >
      <q-tooltip> 切换地下层级 </q-tooltip>
    </q-btn>
    <!-- <q-dialog v-model="dialog" position="left" seamless style="z-index: 1000">
      <q-card
        class="desktop-only area_dialog"
        style="height: 520rem; padding: 8rem"
      >
        <div class="row items-center no-wrap">
          <div>
            <div class="title text-weight-bold">切换地下层级</div>
          </div>
          <q-space />
          <q-btn flat round icon="close" size="16rem" @click="dialog = false" />
        </div>
        <div>
          <q-tabs dense v-model="tab" mobile-arrows class="text-primary">
            <q-tab
              v-for="(i, index) in area_list"
              :key="index"
              :name="i"
              :label="i"
            />
          </q-tabs>
        </div>
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel v-for="(i, index) in area_list" :key="index" :name="i">
            <div>
              <q-btn
                v-if="index != 1"
                color="primary"
                label="全部显示"
                @click="reset_area(index)"
              />
            </div>
            <div
              v-for="(item, item_key, item_index) in xumi_child_area_list[
                index
              ]"
              :key="item_index"
              style="margin-top: 5rem"
            >
              <div class="row items-center">
                <div class="title2 text-weight-bold">{{ item_key }}</div>
                <q-btn
                  v-if="index != 1"
                  color="primary"
                  label="显示区域"
                  dense
                  @click="reset_area(index, item_index)"
                  style="margin-left: 10px"
                />
              </div>
              <div>
                <q-option-group
                  v-model="xumi_child_selected_list[index][item_index]"
                  :options="xumi_child_area_list[index][item_key]"
                  color="primary"
                  inline
                  @update:model-value="change_area(index)"
                />
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
      <q-card class="q-pa-sm area_dialog_mobile mobile-only">
        <div class="row items-center text-primary text-bold title">
          <div class="row items-center">
            <div class="row items-center">
              <div>{{ tab }}</div>
              <q-icon name="mdi-menu-down" size="32px" />
              <q-menu>
                <q-list style="min-width: 100px">
                  <q-item
                    clickable
                    v-close-popup
                    v-for="(item, index) in area_list"
                    :key="index"
                    @click="
                      tab = item;
                      area_index = index;
                    "
                  >
                    <q-item-section>{{ item }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </div>
            <q-icon
              name="mdi-close"
              color="black"
              size="20px"
              v-close-popup
              style="margin-left: 50px"
            />
          </div>
        </div>
        <div style="margin-top: 5px">
          <div
            v-for="(item, item_key, item_index) in xumi_child_area_list[
              area_index
            ]"
            :key="item_index"
            style="margin-top: 5rem"
          >
            <div class="row items-center">
              <div class="title2 text-weight-bold">{{ item_key }}</div>
              <q-icon
                name="mdi-refresh"
                color="primary"
                size="20px"
                style="margin-left: 5px"
                @click="reset_area(area_index, item_index)"
              />
            </div>
            <div>
              <q-option-group
                v-model="xumi_child_selected_list[area_index][item_index]"
                :options="xumi_child_area_list[area_index][item_key]"
                inline
                @update:model-value="change_area(area_index)"
              />
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog> -->
  </div>
</template>

<script>
export default {
  name: "LevelSwitch",
  data() {
    return {
      area_index: 0,
      area_list: ["诸法丛林", "大赤沙海", "千壑沙地", "苍漠囿土"],
      tab: "诸法丛林",
      switch_state: true,
      dialog: false,
      xumi_child_selected_list: [
        [-1],
        [0, -1, 0, 0],
        [-1, -1, -1, -1],
        [-1, -1],
      ],
      xumi_child_area_list: [
        {
          觉王东: [
            { label: "觉王东-上", value: 0 },
            { label: "觉王东-中", value: 1 },
            { label: "觉王东-下", value: 2 },
          ],
        },
        {
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
        {
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
        {
          铁穆窟: [
            { label: "铁穆窟", value: 0 },
            { label: "逾渊地墟·下", value: 1 },
          ],
          逾渊地墟: [
            { label: "逾渊地墟·上", value: 0 },
            { label: "逾渊地墟·中", value: 1 },
          ],
        },
      ],
    };
  },
  methods: {
    switch_view() {
      this.switch_state = !this.switch_state;
      this.$emit("underground_switch", this.switch_state);
    },
    change_area(index) {
      let list = Object.keys(this.xumi_child_area_list[index]);
      let obj = {};
      for (let i in list) {
        obj = {
          ...obj,
          [list[i]]: this.xumi_child_selected_list[index][i],
        };
      }
      this.$emit("underground_area_switch", { index: index, data: obj });
    },
    reset_area(index, item_index) {
      if (item_index != undefined) {
        this.xumi_child_selected_list[index][item_index] = -1;
        this.change_area(index);
      } else {
        switch (index) {
          case 0:
            this.xumi_child_selected_list[index] = [-1];
            break;
          case 2:
            this.xumi_child_selected_list[index] = [-1, -1, -1, -1];
            break;
          case 3:
            this.xumi_child_selected_list[index] = [-1, -1];
            break;
        }
        this.change_area(index);
      }
    },
  },
  mounted() {},
};
</script>

<style lang="scss" scoped>
.title {
  font-size: 24rem;
}
.title2 {
  font-size: 18rem;
}
.area_dialog {
  width: 550rem;
}
@media screen and (max-width: 480px) {
  .area_dialog {
    width: 450rem;
  }
}
.area_dialog_mobile {
  width: 60vw;
  height: 40vh;
  .title {
    font-size: 22px;
  }
  .title2 {
    font-size: 16px;
  }
}
</style>