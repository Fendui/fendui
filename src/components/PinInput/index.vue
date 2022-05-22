<script lang="ts">
import { computed, ref } from "@vue/reactivity";
import { defineComponent, PropType } from "vue";
import { LikeNumber } from "../../types";
import { componentName } from "../../utils";

export default defineComponent({
  name: componentName("PinInput"),
  props: {
    length: {
      type: [String, Number] as PropType<LikeNumber>,
      required: true
    },
    modelValue: {
      type: [String, Number] as PropType<LikeNumber>,
      default: undefined
    },
  },
  emits: ["update:modelValue", "on-input", "on-filled", "on-emptied", "on-delete"],

  setup(_props, { emit, slots }) {
    const manualModel = ref()

    const props = computed(() => _props);
  }
})
</script>