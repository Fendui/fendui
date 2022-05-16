import { ref } from "vue";

const state = ref({
  resizeKey: 0,
  overlays: new Map<string, number>(),
});

export default state;
