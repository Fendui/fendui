<script lang="ts">
import { computed, ref, } from "@vue/reactivity";
import {
  defineComponent,
  h,
  PropType,
  onBeforeUnmount, capitalize
} from "@vue/runtime-core";
import { Duration } from "../../types";
import { componentName, isStrictTouchDevice, isTouchDevice } from "../../utils";
import { cancelSleep, sleep } from "../../utils/sleep";
import { Events } from './type'

export default defineComponent({
  name: componentName("LongPress"),
  props: {
    activeClass: {
      type: String,
      default: undefined
    },
    delay: {
      type: [String, Number] as PropType<Duration>,
      default: () => 500
    },
    allowContenxtMenu: Boolean,
    disabled: Boolean,
    modelValue: {
      type: Boolean,
      default: undefined
    },
    manualEventElement: Boolean,
  },
  emits: ["on-active", "on-cancel", "update:modelValue"],
  setup(_props, { emit, slots }) {
    const props = computed(() => _props);

    const pressing = ref(false)
    const pressed = ref(false)

    const timeoutId = ref<number | null>(null);

    const modelSync = computed({
      get() {
        if (typeof props.value.modelValue === 'boolean') {
          return props.value.modelValue
        }

        return pressed.value
      },
      set(val: boolean) {
        if (typeof val === 'boolean') {
          pressed.value = val

          if (typeof props.value.modelValue === 'boolean') {
            emit('update:modelValue', val)
          }
        }
      }
    })

    const reset = () => {
      timeoutId.value && cancelSleep(timeoutId.value)

      timeoutId.value = null

      pressing.value = false;

      modelSync.value = false;
    }

    onBeforeUnmount(reset);

    const getEvents = (prefix?: Boolean) => {
      let events: Events = {
        blur: reset,
        click: reset,
        start: () => {
          if (props.value.disabled) { return }

          reset();

          pressing.value = true

          sleep(props.value.delay, () => {
            emit("on-active")

            modelSync.value = true;
          }).then(id => {
            timeoutId.value = id;
          })
        },
      };

      if (isTouchDevice()) {

        Object.assign(events, {
          touchmovePassive: reset,
          touchcancel: reset,
          touchend: reset
        })

        events.touchstartPassive = events.start;
      }
      else if (!isStrictTouchDevice()) {
        Object.assign(events, {
          mousemove: reset,
          mouseout: reset,
          mouseleave: reset,
          mouseup: reset
        })

        events.mousedown = events.start;
      }

      if (!props.value.allowContenxtMenu) {
        events.contextmenu = (e) => {
          e.preventDefault();
        };
      }

      delete events.start;

      if (prefix && !props.value.manualEventElement) {
        const _events = events;

        events = {}

        let key: keyof Events

        for (key in _events) {
          Object.assign(events, {
            [`on${capitalize(key)}`]: _events[key]
          })
        }
      }

      return events
    };

    const payload = computed(() => ({
      active: pressed.value,
      willChange: pressing.value,
      reset,
      events: getEvents()
    }));

    return () => {
      const scopedSlot = slots?.default?.(payload.value)

      if (scopedSlot?.length === 1) {
        return h(scopedSlot[0] || "template", {
          ...(props.value.manualEventElement ? {} : getEvents(true)),
          class: {
            [props.value.activeClass || '']: modelSync.value
          }
        })
      }
      return scopedSlot
    };
  },
});
</script>
