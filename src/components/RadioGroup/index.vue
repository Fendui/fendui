<script lang="ts">
import { computed, ref } from "@vue/reactivity";
import { defineComponent, h, HTMLAttributes, PropType } from "vue";
import TrapFocus from 'ui-trap-focus';
import { componentName, getType } from "../../utils";
import eventKey from "../../utils/eventkey";
import Group from "../Group/index.vue"
import { GroupPayload } from "../Group/type";
import { RadioGroupPayload } from './type'

export default defineComponent({
  name: componentName("RadioGroup"),
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
    role: {
      type: String as PropType<HTMLAttributes['role']>,
      default: 'radiogroup'
    }
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
      role: props.value.role,
      onKeydown: (evt: KeyboardEvent) => {
        new TrapFocus({
          forward: (evt) => /arrow_down|arrow_right/.test(eventKey(evt)),
          backward: (evt) => /arrow_up|arrow_left/.test(eventKey(evt)),
          loop: true
        }).init(evt).then(el => {
          if (el) {
            el.click()
          }
        })
      }
    }, {
      default: (slotProps: GroupPayload) => {
        const { isActive, add, remove } = slotProps;

        const payload: RadioGroupPayload = {
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
              },
            }
          }),

          isActive,
          reset: slotProps.clearAll,
          select: slotProps.add
        }

        return slots?.default?.(payload)
      }
    })
  }
})
</script>