import { computed, ref } from "@vue/reactivity";
import { defineComponent, h, PropType, capitalize } from "@vue/runtime-core";
import { componentName, isStrictTouchDevice } from "../..";
import type {
  DefaultSlotProps,
  Delay,
} from "../../../components/DelayedToggle/type";
import DelayedToggle from "../../../components/DelayedToggle/index.vue";

export default function (name: "Hover" | "Focus") {
  const emitEvent = `${name === "Focus" ? "focus" : "hover"}:`;

  return defineComponent({
    name: componentName(name),
    props: {
      delay: {
        type: [String, Number, Object] as PropType<Delay>,
        default: () => 0,
      },
      activeClass: {
        type: String,
        default: undefined,
      },
      manualEventElement: Boolean,
    },
    emits: [`${emitEvent}true`, `${emitEvent}false`],
    setup(_props, { emit, slots, attrs }) {
      const props = computed(() => _props);

      const active = ref(false);

      const getEvents = (slotPayload: DefaultSlotProps) => {
        if (!isStrictTouchDevice()) {
          const activateEvent = name === "Focus" ? "onFocus" : "mouseenter";
          const deactivateEvent = name === "Focus" ? "onBlur" : "mouseleave";

          const activate = async () => {
            slotPayload.on?.();
          };

          const deactivate = async () => {
            slotPayload.off?.();
          };

          return {
            [activateEvent]: activate,
            [`on${capitalize(activateEvent)}`]: activate,
            [deactivateEvent]: deactivate,
            [`on${capitalize(deactivateEvent)}`]: deactivate,
          };
        }

        return {};
      };

      return () => {
        return h(
          DelayedToggle,
          {
            delay: props.value.delay,
            "onToggle:on": () => {
              emit(`${emitEvent}true`);
            },
            "onToggle:off": () => {
              emit(`${emitEvent}false`);
            },
          },
          {
            default: (slotPayload: DefaultSlotProps) => {
              active.value = slotPayload.active;

              const scopedSlot = slots?.default?.({
                active: active.value,
                events: getEvents(slotPayload),
              });

              if (scopedSlot?.length === 1) {
                return h(scopedSlot[0], {
                  ...(props.value.manualEventElement
                    ? {}
                    : getEvents(slotPayload)),
                  ...attrs,
                  class: {
                    [props.value.activeClass || ""]: active.value,
                  },
                });
              } else {
                return scopedSlot;
              }
            },
          }
        );
      };
    },
  });
}
