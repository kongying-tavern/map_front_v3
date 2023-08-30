import { useQuasar } from "quasar";
import { computed } from "vue";

export const devIsDesktop = computed(() => {
  const $q = useQuasar();
  return $q.platform.is.desktop;
});

export const devIsMobile = computed(() => {
  const $q = useQuasar();
  return $q.platform.is.mobile;
});
