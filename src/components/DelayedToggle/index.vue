<script lang="ts">
import { computed, ref } from "@vue/reactivity";
import {
  defineComponent,
  onBeforeUnmount, PropType
} from "@vue/runtime-core";
import { componentName, convertToMilliSecond, optionalRootElement } from "../../utils";
import { cancelSleep, sleep } from '../../utils/sleep'
import { DefaultSlotProps, Delay } from "./type";

export default defineComponent({
  name: componentName('DelayedToggle'),
  props: {
    delay: {
      type: [String, Number, Object] as PropType<Delay>,
      default: () => 0
    },
    modelValue: {
      type: Boolean,
      default: undefined
    },
    disabled: Boolean,
    tag: {
      type: String as PropType<keyof HTMLElementTagNameMap | undefined>,
      default: undefined
    }
  },
  emits: ["update:modelValue", "toggle:on", "toggle:off"],
  setup(_props, { emit, slots, attrs }) {
    const props = computed(() => _props);

    const waiting = ref(false);

    const timeoutId = ref<null | number>(null)

    const manualActive = ref(false)

    const noVModel = computed(() => typeof props.value.modelValue === 'undefined')

    const modelSync = computed({
      get() {
        if (noVModel.value) {
          return manualActive.value
        }

        return props.value.modelValue as boolean
      },
      set(val: boolean) {
        if (typeof val === 'boolean' && !props.value.disabled) {
          if (!noVModel.value) {
            emit("update:modelValue", val)
          }

          manualActive.value = val
        }
      }
    })

    const active = computed(() => modelSync.value);

    const getDelay = computed(() => {
      const value = { on: 0, off: 0 };

      if (typeof props.value.delay == "object") {
        value.on = convertToMilliSecond(`${props.value.delay.on || props.value.delay.enter || 0}`);
        value.off = convertToMilliSecond(`${props.value.delay.off || props.value.delay.leave || 0}`);
      }

      if (/string|number/.test(typeof props.value.delay)) {
        const parsed = convertToMilliSecond(`${props.value.delay}`);

        value.on = parsed;
        value.off = parsed;
      }

      return value;
    });

    const nap = (on?: boolean) => {
      wakeup();

      const isOpenedAlready = (on && active.value);

      const isClosedAlready = (!on && !active.value)

      if (isOpenedAlready || isClosedAlready) { return }

      waiting.value = true;

      const duration = getDelay.value[on ? 'on' : 'off']

      const event: 'toggle:on' | 'toggle:off' = `toggle:${on ? 'on' : 'off'}`

      const setValue = () => {
        emit(event);
        modelSync.value = on || false
        waiting.value = false;
      }

      if (duration) {
        sleep(duration, setValue).then((id) => {
          timeoutId.value = id
        })
      } else {
        setValue()
      }
    }

    const wakeup = () => {
      waiting.value = false;

      timeoutId.value && cancelSleep(timeoutId.value)

      timeoutId.value = null
    }

    onBeforeUnmount(wakeup);

    const getEvents = computed(() => {
      return {
        on: () => nap(true),
        off: () => nap(),
        toggle: () => nap(!active.value)
      };
    });

    const payload = computed<DefaultSlotProps>(() => ({ active: active.value, waiting: waiting.value, ...getEvents.value }));

    return () => optionalRootElement({
      payload,
      attrs,
      slots,
      tag: props.value.tag
    })
  },
});
</script>
