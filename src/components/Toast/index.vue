<script lang="ts">
import { computed } from "@vue/reactivity";
import { defineComponent, h, PropType, ref } from "vue";
import { componentName, addEventPrefix } from "../../utils";
import Overlay from "../Overlay/index.vue";
import type { OverlayPayload } from "../Overlay/index.vue";
import Hover from "../Hover/index.vue";
import Countdown, { CountdownPayload } from "../Countdown/index.vue";
import { Duration } from "../../types";

type HoverPayload = Record<'active' | 'events', any>

export default defineComponent({
  name: componentName("Toast"),
  props: {
    modelValue: {
      type: Boolean,
      default: undefined
    },
    open: {
      type: Boolean,
      default: undefined
    },
    trapFocus: Boolean,
    teleportTo: {
      type: String,
      default: undefined
    },
    duration: {
      type: [String, Number] as PropType<Duration>,
      default: '6s'
    }
  },
  emits: ["update:modelValue"],
  setup(_props, { emit, slots, attrs }) {
    const props = computed(() => _props);

    const manualModel = ref(false)

    const countdownDone = ref(false);

    const modelSync = computed({
      get() {
        if (typeof props.value.modelValue === 'boolean') {
          return props.value.modelValue
        }

        if (typeof props.value.open === 'boolean') {
          return props.value.open
        }

        return manualModel.value
      },
      set(val: boolean) {
        if (typeof val === 'boolean') {
          if (typeof props.value.modelValue === 'boolean') {
            emit("update:modelValue", val)
          }

          manualModel.value = val;

          if (val) {
            countdownDone.value = false;
          }
        }
      }
    })

    const toggle = (val?: boolean) => modelSync.value = (typeof val === 'boolean' ? val : !modelSync.value);

    return () => {
      return h(Overlay, {
        modelValue: modelSync.value,
        'onUpdate:modelValue': toggle,
        customTransition: true,
        trapFocus: props.value.trapFocus,
        open: props.value.open,
        disableTeleport: !!props.value.teleportTo,
        teleportTo: props.value.teleportTo,
        tag: 'section'
      }, {
        activator: slots.activator,
        default: (slotProps: OverlayPayload) => {
          const defaultSlot = (hoverProps: Record<string, any>) => slots.default?.({
            ...hoverProps,
            ...slotProps,
          })?.[0] || null

          return [
            h(Hover, {
              manualEventElement: true
            }, {
              default: (hoverProps: HoverPayload) => {

                return h('div', {
                  ...addEventPrefix(hoverProps.events),
                  ...attrs,
                }, [
                  h(Countdown, {
                    duration: props.value.duration,
                    state: (hoverProps.active ? 'pause' : 'start'),
                    'onOn-done': slotProps.close
                  }, {
                    default: (countdownProps: CountdownPayload) => {

                      // @ts-ignore
                      return [h(defaultSlot({
                        hover: hoverProps,
                        countdown: countdownProps,
                      }))]
                    }
                  })
                ])
              }
            })
          ]
        }
      })
    }
  }
})
</script>