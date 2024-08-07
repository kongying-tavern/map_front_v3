<script setup>
import _ from "lodash";
import { ref, computed, defineProps, watch } from "vue";
import { map_plugin_config } from "src/api/config";
import {
  add_map_overlay,
  add_map_polygon,
  create_map_config,
  get_map_plugin_config,
} from "src/api/map";
import { map, mapOptions, mapBounds } from "src/api/map_obj";
import { area_map_code } from "src/api/area";
import { layergroup_register } from "src/api/layer";

const lodashTemplateOptions = {
  interpolate: /{{([\s\S]+?)}}/g,
};

const props = defineProps({
  area: {
    type: Object,
    default: () => ({}),
  },
});

const overlay_config = computed(() => {
  const area_code = props.area.code || "";
  const config = get_map_plugin_config(area_code);
  return config;
});

const overlay_visible = computed(() => {
  const visible = Boolean(overlay_config.value.overlay);
  return visible;
});

const overlay_options = computed(() => {
  const options = overlay_config.value.overlayConfig || {};
  return options;
});

const overlay_code = computed(() => mapOptions.value?.code || "");

const overlayIcon = computed(() => overlay_options.value?.panelIcon || "");

const overlayIconColorDefault = "#9d9d9d";
const overlayIconColor = computed(
  () => overlay_options.value?.panelIconColor || overlayIconColorDefault,
);

const overlayMaskOpacityDefault = 0.55;
const overlayMaskOpacity = computed(() => {
  if (!overlay_options.value?.overlayMask) {
    return 1;
  }

  const maskOnSelected = overlay_options.value?.overlayMaskOnSelected ?? true;
  if (maskOnSelected && overlaySelectedItemCount.value <= 0) {
    return 1;
  }

  return overlay_options.value?.overlayMaskOpacity ?? overlayMaskOpacityDefault;
});

const overlayBaseConfig = computed(() => {
  const overlayConfigList = [];

  for (const configAreaCode in map_plugin_config.value) {
    const overlayList = [];

    const { tiles_config: tilesConfig } = create_map_config(configAreaCode);
    const configTilesCode = tilesConfig.code || "";
    // 如果底图不一致则不添加数据
    if (configTilesCode !== overlay_code.value) {
      continue;
    }

    const configAreaData = area_map_code.value[configAreaCode] || {};
    const configPluginConfig = get_map_plugin_config(configAreaCode);
    const configOverlay = Boolean(configPluginConfig.overlay);
    const configOptions = configOverlay
      ? configPluginConfig?.overlayConfig || {}
      : {};

    const globalUrlTemplate = configOptions.urlTemplate || "";
    const globalIdTemplate =
      configOptions.idTemplate || "{{groupValue}}#{{itemValue}}";
    const globalMultiple = configOptions.multiple;
    const globalRole = configOptions.role || "";

    const configOverlayList = configOptions.overlays || [];
    for (const configGroup of configOverlayList) {
      const groupLabel = configGroup.label || "";
      const groupValue = configGroup.value || "";
      const groupUrl = configGroup.url || "";
      const groupUrlTemplate = configGroup.urlTemplate || "";
      const groupBounds = configGroup.bounds;
      const groupMultiple = configGroup.multiple;
      const overlayMultiple = Boolean(groupMultiple ?? globalMultiple);
      const groupRole = configGroup.role || "";
      const overlayRole = groupRole || globalRole || "";

      const groupChildren = configGroup.children || [];
      const overlayChildren = [];
      for (const configItem of groupChildren) {
        const itemLabel = configItem.label || "";
        const itemValue = configItem.value || "";
        const itemUrl = configItem.url || "";
        const itemUrlTemplate = configItem.urlTemplate || "";
        const itemChunks = configItem.chunks || [{}];
        const itemBounds = configItem.bounds;

        // 叠层渲染数据
        const overlayDataPackItem = {
          groupLabel,
          groupValue,
          itemLabel,
          itemValue,
        };

        const overlayChunks = [];
        for (const configChunk of itemChunks) {
          const chunkLabel = configChunk.label || "";
          const chunkValue = configChunk.value || "";
          const chunkUrl = configChunk.url || "";
          const chunkBounds = configChunk.bounds;

          // 叠层渲染数据
          const overlayDataPackChunk = {
            groupLabel,
            groupValue,
            itemLabel,
            itemValue,
            chunkLabel,
            chunkValue,
          };

          // 判断边界是否有效
          const overlayBounds = chunkBounds || itemBounds || groupBounds;
          if (
            !overlayBounds ||
            !_.isArray(overlayBounds) ||
            overlayBounds.length !== 2
          ) {
            continue;
          }

          // 判断地址是否存在
          let overlayUrl = chunkUrl || itemUrl || groupUrl;
          if (!overlayUrl) {
            // 构造地图地址
            const overlayUrlTemplate =
              itemUrlTemplate || groupUrlTemplate || globalUrlTemplate || "";
            const overlayUrlRender = _.template(
              overlayUrlTemplate,
              lodashTemplateOptions,
            );
            overlayUrl = overlayUrlRender(overlayDataPackChunk);
          }

          if (!overlayUrl) {
            continue;
          }

          overlayChunks.push({
            label: chunkLabel,
            value: chunkValue,
            role: overlayRole,
            url: overlayUrl,
            bounds: overlayBounds,
          });
        }

        // 判断是否有叠图配置
        if (!_.isArray(overlayChunks) || overlayChunks.length <= 0) {
          continue;
        }

        // 自动生成ID
        const overlayIdRender = _.template(
          globalIdTemplate,
          lodashTemplateOptions,
        );
        const overlayId = overlayIdRender(overlayDataPackItem);

        overlayChildren.push({
          id: overlayId,
          label: itemLabel,
          value: itemValue,
          role: overlayRole,
          chunks: overlayChunks,
        });
      }

      overlayList.push({
        label: groupLabel,
        value: groupValue,
        role: overlayRole,
        multiple: overlayMultiple,
        children: overlayChildren,
      });
    }

    // 如果为空则不加入数据
    if (!_.isEmpty(overlayList)) {
      overlayConfigList.push({
        area: configAreaData,
        overlays: overlayList,
      });
    }
  }

  return overlayConfigList;
});

/** Quasar only */
const overlaySelectionConfig = computed(() =>
  _.chain(overlayBaseConfig.value)
    .map((section) => {
      const sectionNew = _.cloneDeep(section);
      const sectionOverlays = _.chain(sectionNew.overlays)
        .map((group) => {
          const children = _.chain(group.children || [])
            .map((item) => {
              item.value = item.id || "";
              return item;
            })
            .value();

          group.children = children;
          return group;
        })
        .value();

      sectionNew.overlays = sectionOverlays;
      return sectionNew;
    })
    .value(),
);
/** Quasar only */

const overlayCardVisible = ref(false);

const overlayAreaTab = ref("");

const overlaySelections = ref({});

const overlaySelectionIds = computed(() =>
  _.chain(overlaySelections.value)
    .values()
    .flattenDeep()
    .filter((v) => v)
    .uniq()
    .value(),
);

const overlaySelectionCounts = computed(() =>
  _.chain(overlaySelections.value)
    .mapValues(
      (v) =>
        _.chain(v)
          .flattenDeep()
          .filter((v) => v)
          .uniq()
          .value().length,
    )
    .value(),
);

const overlaySelectedItemCount = computed(() => {
  let itemCount = 0;
  for (const overlayItemId of overlaySelectionIds.value) {
    const overlayItem = overlayConfigMap.value[overlayItemId];
    if (overlayItem) {
      const overlayRole = overlayItem.role || "";
      if (["tile"].indexOf(overlayRole) === -1) {
        itemCount += 1;
      }
    }
  }

  return itemCount;
});

const overlayConfigMap = computed(() => {
  const configMap = {};
  for (const configSection of overlayBaseConfig.value) {
    const configOverlays = configSection?.overlays || [];
    for (const configGroup of configOverlays) {
      const configGroupChildren = configGroup.children || [];
      for (const configItem of configGroupChildren) {
        const configItemId = configItem.id || "";
        if (configItemId) {
          configMap[configItemId] = configItem;
        }
      }
    }
  }

  return configMap;
});

const overlayInitState = computed(() => {
  const overlayInitDataMap = {};

  for (const configSection of overlayBaseConfig.value) {
    const configAreaCode = configSection?.area?.code || "";
    const configOverlays = configSection?.overlays || [];

    const overlayInitData = [];

    for (const configGroup of configOverlays) {
      let overlayInitValue = null;

      if (configGroup.multiple) {
        overlayInitValue = [];
      } else {
        const configChildren = configGroup.children || [];
        const configChildrenFirst = configChildren[0];

        if (configChildrenFirst && _.isPlainObject(configChildrenFirst)) {
          overlayInitValue = configChildrenFirst.id || "";
        }
      }

      overlayInitData.push(overlayInitValue);
    }

    overlayInitDataMap[configAreaCode] = overlayInitData;
  }

  return overlayInitDataMap;
});

const overlayLayerHandle = ref(layergroup_register());
const tileLayerHandle = ref(layergroup_register());
const maskLayerHandle = ref(layergroup_register());

const overlayInit = () => {
  overlayAreaTab.value = props.area?.code || "";
  overlaySelections.value = _.cloneDeep(overlayInitState.value);
};

const overlayInitGroup = (areaCode = "", groupIndex = -1) => {
  if (
    overlaySelections.value[areaCode] &&
    overlaySelections.value[areaCode][groupIndex]
  ) {
    overlaySelections.value[areaCode][groupIndex] = _.cloneDeep(
      (overlayInitState.value[areaCode] || {})[groupIndex],
    );
  }
};

const overlayRefresh = () => {
  tileLayerHandle.value?.clearLayers();
  overlayLayerHandle.value?.clearLayers();
  maskLayerHandle.value?.clearLayers();

  const matchedChunks = new Set();
  const imageChunks = {
    overlay: [],
    tile: [],
  };

  // 添加新层
  for (const overlaySelectionId of overlaySelectionIds.value) {
    const overlayLayerConfig = overlayConfigMap.value[overlaySelectionId];
    if (overlayLayerConfig) {
      const overlayLayerId = overlayLayerConfig.id || "";
      const overlayLayerChunks = overlayLayerConfig.chunks || [];
      if (
        _.isArray(overlayLayerChunks) &&
        overlayLayerId &&
        !matchedChunks.has(overlayLayerId)
      ) {
        matchedChunks.add(overlayLayerId);

        for (const overlayLayerChunk of overlayLayerChunks) {
          const overlayLayerUrl = overlayLayerChunk.url || "";
          const overlayLayerBounds = overlayLayerChunk.bounds;
          const overlayLayerRole = overlayLayerChunk.role || "";

          if (overlayLayerUrl && overlayLayerBounds) {
            if (overlayLayerRole === "tile") {
              const imageData = add_map_overlay(
                overlayLayerUrl,
                overlayLayerBounds,
                { zIndex: 100 },
              );
              imageChunks.tile.push(imageData);
            } else {
              const imageData = add_map_overlay(
                overlayLayerUrl,
                overlayLayerBounds,
                { zIndex: 300 },
              );
              imageChunks.overlay.push(imageData);
            }
          }
        }
      }
    }
  }

  // 添加叠层
  for (const tile of imageChunks.tile) {
    tileLayerHandle.value?.addLayer(tile);
  }

  const maskLayer = add_map_polygon(
    [
      [
        [mapBounds.value[0][0], mapBounds.value[0][1]],
        [mapBounds.value[1][0], mapBounds.value[0][1]],
        [mapBounds.value[1][0], mapBounds.value[1][1]],
        [mapBounds.value[0][1], mapBounds.value[1][1]],
      ],
    ],
    {
      fillColor: "#000",
      stoke: false,
      fillOpacity: 1 - overlayMaskOpacity.value,
      color: "#000",
      weight: 1,
      zIndex: 200,
    },
  );
  maskLayerHandle.value?.addLayer(maskLayer);

  for (const overlay of imageChunks.overlay) {
    overlayLayerHandle.value?.addLayer(overlay);
  }

  map.value?.addLayer(tileLayerHandle.value);
  map.value?.addLayer(maskLayerHandle.value);
  map.value?.addLayer(overlayLayerHandle.value);
};

watch(() => overlayBaseConfig.value, overlayInit);

watch(() => overlaySelectionIds.value, overlayRefresh);
</script>

<template>
  <div v-if="overlay_visible" class="levelSwitch">
    <q-btn
      v-if="!overlayCardVisible"
      round
      color="white"
      :icon="overlayIcon"
      size="25rem"
      class="switchButton"
      :style="{ color: `${overlayIconColor} !important` }"
      @click.stop="overlayCardVisible = true"
    >
      <q-tooltip anchor="center right" self="center left">
        选择分层层级
      </q-tooltip>
    </q-btn>
    <div v-if="overlayCardVisible" class="switchCard">
      <q-btn
        dense
        flat
        color="white"
        text-color="black"
        icon="mdi-close"
        class="absolute-top-right"
        style="z-index: 100; right: 20rem"
        @click.stop="overlayCardVisible = false"
      />
      <q-card class="q-pa-md q-pt-lg switchWrapper">
        <q-tabs v-model="overlayAreaTab" dense align="justify">
          <q-tab
            v-for="(area, areaIndex) in overlaySelectionConfig"
            :key="areaIndex"
            :name="area?.area?.code"
          >
            <template #default>
              <div>
                <span>{{ area?.area?.name }}</span>
                <span
                  v-if="overlaySelectionCounts[area?.area?.code]"
                  class="countBadge bg-blue-8 text-white text-bold"
                >
                  {{ overlaySelectionCounts[area?.area?.code] || 0 }}
                </span>
              </div>
            </template>
          </q-tab>
        </q-tabs>

        <q-tab-panels v-model="overlayAreaTab" animated>
          <q-tab-panel
            v-for="(area, areaIndex) in overlaySelectionConfig"
            :key="areaIndex"
            :name="area?.area?.code"
            class="q-mt-sm switchScroll"
            style="padding: 0"
          >
            <div
              v-for="(group, groupIndex) in area.overlays"
              :key="groupIndex"
              class="q-pb-sm"
            >
              <span style="font-weight: bold">{{ group.label }}</span>
              <q-btn
                v-if="group.multiple"
                class="q-ml-sm"
                flat
                dense
                bg-color="grey-6"
                size="sm"
                icon="mdi-close"
                @click.stop="overlayInitGroup(area?.area?.code, groupIndex)"
              >
              </q-btn>
              <q-option-group
                v-model="overlaySelections[area?.area?.code][groupIndex]"
                :options="group.children"
                :type="group.multiple ? 'checkbox' : 'radio'"
                size="sm"
                inline
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$button-height: 80rem;

.levelSwitch {
  position: fixed;
  left: 32rem;
  bottom: 290rem;
  overflow: visible;
}

.switchButton {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 20;
}

.switchCard {
  position: absolute;
  left: 0;
  bottom: -$button-height + 20rem;
  z-index: 10;
  overflow: hidden;
}

.switchWrapper {
  width: 500rem;
}

.switchScroll {
  overflow-y: auto;
  max-height: 350rem;
}

.countBadge {
  $badge-line-height: 13rem;
  $badge-padding: 3rem;
  $badge-size: $badge-line-height + 2 * $badge-padding;

  display: inline-block;
  font-size: $badge-line-height;
  line-height: $badge-line-height;
  border-radius: $badge-size / 2;
  padding: $badge-padding;
  min-width: $badge-size;
  margin-left: 5rem;
}
</style>
