<script lang="ts">
import { computed, ref } from "@vue/reactivity";
import { defineComponent, PropType } from "@vue/runtime-core";
import { componentName, optionalRootElement } from "../../utils";

export default defineComponent({
  name: componentName('Toggle'),
  props: {
    modelValue: {
      type: [Boolean, String, Number],
      default: undefined
    },
    disabled: Boolean,
    tag: {
      type: String as PropType<keyof HTMLElementTagNameMap | undefined>,
      default: undefined
    }
  },
  emits: ["toggle:true", "toggle:false", "update:modelValue"],
  setup(_props, { slots, emit, attrs }) {
    const manualVmodel = ref(false)

    const props = computed(() => _props);

    const active = computed(() => {
      if (typeof props.value.modelValue == "boolean") {
        return props.value.modelValue;
      }

      return manualVmodel.value;
    });

    const toggle = (val: boolean | number | string) => {
      if (props.value.disabled) {
        return;
      }

      let value;

      if (typeof val == "boolean") {
        value = val;
      } else {
        value = !active.value;
      }

      emit("update:modelValue", value);

      emit(`toggle:${value}`);

      manualVmodel.value = value;
    };

    const payload = computed(() => ({
      active: active.value,
      toggle,
    }));

    return () => optionalRootElement({
      payload,
      attrs,
      slots,
      tag: props.value.tag
    })
  },
});
</script>