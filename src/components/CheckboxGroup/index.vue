<script lang="ts">
import { computed, ref } from "@vue/reactivity";
import { defineComponent, h, PropType } from "vue";
import { componentName, getType } from "../../utils";
import Group from "../Group/index.vue"
import { GroupPayload } from "../Group/type";
import { CheckboxGroupPayload } from './type'

export default defineComponent({
  name: componentName("CheckboxGroup"),
  props: {
    tag: {
      type: String as PropType<keyof HTMLElementTagNameMap>,
      default: 'div'
    },
    modelValue: {
      type: Array as PropType<any[]>,
      default: undefined,
    },
    option: {
      type: Array as PropType<any[]>,
      required: true
    },
  },
  emits: ["update:modelValue"],
  setup(_props, { emit, slots }) {
    const props = computed(() => _props);

    // use this when there's no v-model
    const manualModel = ref(props.value.option)

    const hasVModel = computed(() => getType(props.value.modelValue) === 'array')

    const modelSync = computed({
      get() {
        if (hasVModel.value) {
          return props.value.modelValue || []
        }
        return manualModel.value
      },
      set(val: any[]) {
        if (hasVModel.value) {
          emit("update:modelValue", val)
        }

        else {
          manualModel.value = val
        }
      }
    })

    return () => h(Group, {
      modelValue: modelSync.value,
      'onUpdate:modelValue': (val) => {
        modelSync.value = val;
      },
      tag: props.value.tag,
      multiple: true,

    }, {
      default: (slotProps: GroupPayload) => {
        const { isActive, add, remove, active } = slotProps;

        const allChecked = active.length === props.value.option.length

        const payload: CheckboxGroupPayload = {
          items: props.value.option.map((item) => {
            const active = isActive(item);

            return {
              active,
              item,
              attrs: {
                modelValue: active,
                'onUpdate:modelValue': (val) => {
                  return val ? add(item) : remove(item)
                },
              }
            }
          }),

          isChecked: isActive,
          reset: slotProps.clearAll,
          select: slotProps.add,
          selectAll: () => {
            slotProps.add(props.value.option)
          },
          intermediate: Boolean(active.length && allChecked),
          allChecked
        }

        return slots?.default?.(payload)
      }
    })
  }
})
</script>