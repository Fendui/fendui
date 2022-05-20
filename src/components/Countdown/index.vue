<script lang="ts">
import { computed } from "@vue/reactivity";
import { defineComponent, h, onMounted, PropType, ref, watch } from "vue";
import { Duration, LikeNumber } from "../../types";
import { componentName, stepper } from "../../utils";
import Countdown from "../../utils/countdown";

interface CountdownValue {
  currentTime?: number;
  percentDone?: number;
  remainingTime?: number;
  stopped?: boolean;
  done?: boolean;
  running?: boolean;
  touched?: boolean
}

export interface CountdownPayload extends CountdownValue {
  value: LikeNumber;
  start: () => void;
  pause: () => void;
  stop: () => void;
  restart: () => void;
  step: (from: number, to: number) => number,
}

export type CountdownState = 'start' | 'pause' | 'stop'

export default defineComponent({
  name: componentName("Countdown"),
  props: {
    duration: {
      type: [String, Number] as PropType<Duration>,
      required: true
    },
    modelValue: {
      type: [String, Number] as PropType<LikeNumber>,
      default: undefined,
    },
    startImmediately: Boolean,
    state: {
      type: String as PropType<CountdownState | undefined>,
      default: undefined
    }
  },
  emits: ['update:modelValue', "on-update", "on-done", 'state:start', 'state:pause', 'state:stop'],
  setup(_props, { emit, slots }) {
    const props = computed(() => _props);

    const manualModel = ref<number | undefined>();

    const done = ref(false);

    const modelSync = computed({
      get() {
        if (/number|string/.test(typeof props.value.modelValue)) {
          return Number(props.value.modelValue)
        }

        return manualModel.value || 0
      },
      set(val: LikeNumber) {
        if (/string|number/.test(typeof val)) {
          if (/string|number/.test(typeof props.value.modelValue)) {
            emit("update:modelValue", val)

            emit("on-update", val)
          }

          manualModel.value = Number(val)
        }
      }
    })

    const countdownValue = ref<CountdownValue>({})

    const countdown = new Countdown({
      duration: props.value.duration,
      onDone: (val) => {
        emit("on-done", val)
      },
      onUpdate: (val) => {
        done.value = val.done;

        modelSync.value = val.percentDone;

        const { currentTime, percentDone, remainingTime, stopped, done: _done, running, touched } = val

        countdownValue.value = {
          currentTime, percentDone, remainingTime, stopped, done: _done, running, touched
        };

        emit("on-update", val)
      }
    })

    watch(() => props.value.duration, (newVal) => countdown.setDuration(newVal))

    const start = () => {
      countdown.start()

      emit("state:start")
    };

    const pause = () => {
      countdown.pause()

      emit("state:pause")
    }

    const stop = () => {
      countdown.stop();

      emit("state:stop")
    }

    const restart = () => {
      stop()

      start()
    }

    if (props.value.startImmediately) {
      onMounted(start)
    }

    const updateState = (newVal: CountdownState | undefined) => {
      switch (newVal) {
        case 'start':
          return start();
        case 'pause':
          return pause();
        case 'stop':
          return stop();
      }
    }

    watch(() => props.value.state, (newVal) => {
      requestAnimationFrame(() => {
        newVal && updateState(newVal)
      })
    })

    onMounted(() => {
      updateState(props.value.state)
    })

    const payload = computed<CountdownPayload>(() => {
      return {
        value: modelSync.value,
        start,
        pause,
        stop,
        restart,
        step: (from, to) => stepper(from, to, Number(modelSync.value)),
        ...countdownValue.value
      }
    })

    return () => {
      return slots.default?.(payload.value)
    }
  }
})
</script>