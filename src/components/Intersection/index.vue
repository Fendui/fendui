<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  computed,
  h,
  watch,
} from "vue";
import { componentName } from "../../utils";
import { Config, Entry } from "./types";
import { defaultConfig, inactiveEntry, isHTML } from "./utils";

export default defineComponent({
  name: componentName("Intersection"),
  emits: ["once-intersected", "update:entry"],

  props: {
    config: {
      type: Object as PropType<Config>,
      default: () => defaultConfig,
    },
    thresholdStep: {
      type: Number,
      default: undefined
    },
    once: Boolean
  },
  setup(_props, { emit, slots }) {
    //   observer won't happen if component isn't mounted.
    const isMounted = ref(false);

    //   set initial state of entry to an object with inactive: true;
    // used to check if Observer has started or not;
    const entry = ref<Entry>(inactiveEntry);

    // the intersection observer class;
    const observer = ref<IntersectionObserver | null>(null);

    const props = computed(() => _props);

    const instance = getCurrentInstance();

    const disconnect = () => {
      const elem = instance?.vnode.el as unknown as HTMLElement;

      if (elem && isHTML(elem)) {
        observer.value?.unobserve(elem);
      }

      observer.value?.disconnect();

      nextTick(() => {
        observer.value = null;
      });
    };

    const connect = async () => {
      //  bail if this.observer is truthy, or props.disabled or not mounted; or this.$el isn't valid HTMLElement
      const elem = instance?.vnode.el as unknown as HTMLElement;

      if (observer.value || !isMounted.value || !isHTML(elem)) {
        return;
      }

      const initialOptions = {
        ...defaultConfig,
        ...props.value.config,
      };

      const options = {
        ...initialOptions,
        threshold: /string|number/i.test(typeof initialOptions.threshold)
          ? initialOptions.threshold
          : 1,
      };

      const thresholdStep = props.value.thresholdStep

      if (thresholdStep) {
        const thresholds = Array.from({ length: thresholdStep }, (_, i) => 1 / thresholdStep * i)

        thresholds.push(1)

        options.threshold = thresholds
      }

      await nextTick();

      observer.value = new IntersectionObserver(intersectionCallback, options);

      observer.value?.observe(elem);
    };

    const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
      for (const _entry of entries) {
        const setPayload = () => {
          entry.value = _entry

          entry.value.ratio = _entry.intersectionRatio

          emit("update:entry", _entry);
        };

        if (props.value.once && _entry.isIntersecting) {
          setPayload()

          cleanup()

          emit("once-intersected")
        } else {
          setPayload()
        }
      }
    };

    const observe = async () => {
      if (!isMounted.value) {
        return;
      }

      entry.value = inactiveEntry;
      await nextTick();

      connect();
    };

    const cleanup = () => {
      disconnect();
      entry.value = inactiveEntry;
      isMounted.value = false;
    };

    const onMount = () => {
      isMounted.value = true;
      observe();
    };

    onMounted(onMount);

    onBeforeUnmount(cleanup);

    watch(() => props.value, () => {
      cleanup();

      onMount();
    })

    return () => {
      // @ts-ignore
      return h(slots.default?.(entry.value)[0]);
    };
  },
});
</script>
