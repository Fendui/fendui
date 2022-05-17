import { ref } from "vue";

const state = ref({
  resizeKey: 0,
  overlays: {} as Record<string, number>,
});

export default state;
