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
  </div>
</template>

<script>
export default {
  name: "LevelSwitch",
  data() {
    return {
      switch_state: true,
    };
  },
  methods: {
    switch_view() {
      this.switch_state=!this.switch_state;
      this.$emit("callback", this.switch_state);
    },
  },
};
</script>

<style>
</style>