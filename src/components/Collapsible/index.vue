<script lang="ts">
import { computed, reactive } from "@vue/reactivity";
import {
  defineComponent,
  ref,
  h,
  nextTick,
  watch,
  PropType
} from "@vue/runtime-core";
import { nextAnimFrame, convertToMilliSecond, componentName } from "../../utils";
import type { LikeNumber, ClassName } from '../../types'
import type { TransitionProp } from './type'
// import state from "../../framework/state";

const scoping = {
  'data-fendui-collapsible': ''
}

export default defineComponent({
  name: componentName("Collapsible"),
  props: {
    tag: {
      type: String as PropType<keyof HTMLElementTagNameMap>,
      default: 'div'
    },
    maxHeight: {
      type: [String, Number] as PropType<LikeNumber>,
      default: undefined
    },
    activeClass: {
      type: [String, Object, Array] as PropType<ClassName>,
      default: undefined
    },
    transition: {
      type: [Object, Boolean] as PropType<TransitionProp | boolean>,
      default: () => ({ duration: "150ms", ease: "ease", delay: "0" })
    },

    modelValue: {
      type: Boolean,
      default: undefined
    },
    disabled: Boolean,
    open: {
      type: Boolean,
      default: undefined
    },
    keepContent: Boolean
  },
  emits: ["toggle:true", "toggle:false", "update:modelValue", "transition:start", "transition:end", "transition:cancel"],
  setup(_props, { emit, slots, expose }) {
    const props = computed(() => _props);

    const data = reactive<{
      manualVmodel: boolean;
      transitionState: null | 'afterLeave' | 'afterEnter' | 'beforeEnter' | 'beforeLeave' | 'leaveCancelled' | 'enterCancelled';
      contentHeight: undefined | string | number;
      collapsed: number;
      willChange: boolean;
      forceNoTransition: boolean;
      hideHeight: boolean;
      exitingHeight: null | string | number;
      manualModel: boolean;
    }>({
      transitionState: null,
      contentHeight: undefined,
      collapsed: 0,
      willChange: false,
      forceNoTransition: false,
      hideHeight: false,
      exitingHeight: null,
      manualVmodel: props.value.open || false,
      manualModel: props.value.open || false
    });

    if (!data.exitingHeight) {
      data.exitingHeight = "0px";
    }


    const modelSync = computed({
      get() {
        if (typeof props.value.modelValue == "boolean") {
          return props.value.modelValue;
        }

        if (typeof props.value.open == "boolean") {
          return props.value.open;
        }

        return data.manualVmodel;
      },
      set(val: boolean) {
        if (typeof val === 'boolean') {
          if (typeof props.value.modelValue === 'boolean') {
            emit("update:modelValue", val)
          }

          data.manualVmodel = val

          emit(`toggle:${val}`, val);

          data.manualVmodel = val;

          nextTick().then(() => {
            data.manualModel = false;
          });
        }
      }
    });

    if (!modelSync.value) {
      data.collapsed++;
    }

    // watch(() => state.value.resizeKey, async () => {
    //   if (modelSync.value) {
    //     data.forceNoTransition = true;

    //     if (contentRef.value) {
    //       data.contentHeight = contentRef.value.clientHeight

    //       await nextAnimFrame();

    //       data.forceNoTransition = false;
    //     }
    //   }
    // }
    // );

    const contentRef = ref<HTMLElement | null>(null)

    const methods = {
      toggle: (val?: boolean) => modelSync.value = typeof val === 'boolean' ? val : !modelSync.value,
      open: () => modelSync.value = true,
      close: () => modelSync.value = false,
    }

    expose(methods)

    const payload = computed(() => ({
      active: modelSync.value,
      contentHeight: data.contentHeight,
      transitionState: data.transitionState,
      ...methods
    }));

    const setContentHeight = async (val: boolean) => {
      data.collapsed += 0.1;

      if (contentRef.value) {
        data.contentHeight = (contentRef.value as HTMLElement).clientHeight
      }

      data.exitingHeight = `${data.contentHeight}px`;

      data.willChange = true;

      data.hideHeight = false;

      methods.toggle(val)

      await nextAnimFrame();

      data.exitingHeight = "0px";
    };

    watch(() => modelSync.value, (n) => {
      setContentHeight(n)
    });

    const getTransition = computed(() => {
      const transition = props.value.transition;

      if (transition === false) { return undefined }

      const value = { duration: "1ms", ease: "ease", delay: "0ms" };


      if (typeof transition == "object") {
        value.duration = transition.duration || "1ms";
        value.ease = transition.ease || "ease";
        value.delay = transition.delay || "0ms";
      }

      value.duration = `${convertToMilliSecond(value.duration)}ms`

      value.delay = `${convertToMilliSecond(value.delay)}ms`

      return data.collapsed > 0 && !data.forceNoTransition
        ? `height ${value.duration} ${value.ease} ${value.delay}`
        : undefined
    });

    return () => {

      const validTransition = (e: TransitionEvent) =>
        e.target == e.currentTarget && e.propertyName == "height";

      return h(
        props.value.tag,
        {
          ...scoping,
          class: [
            "Collapsible",
            {
              "will-change": data.willChange,
            },
          ],
          "aria-hidden": !modelSync.value ? "true" : undefined,
          style: {
            "--transition": getTransition.value,
            "--max-height": props.value.maxHeight,
            "--height": modelSync.value
              ? `${data.hideHeight ? "null" : data.contentHeight || "null"
                }px`.replace(/nullpx/, "") || undefined
              : data.exitingHeight,
            visibility:
              /afterLe/i.test(data.transitionState || '') ||
                (!modelSync.value && !data.transitionState)
                ? "hidden"
                : undefined,
          },
          onTransitionstart: (e: TransitionEvent) => {
            if (validTransition(e)) {
              data.transitionState = modelSync.value
                ? "beforeEnter"
                : "beforeLeave";

              emit("transition:start")
            }
          },
          onTransitionend: (e: TransitionEvent) => {
            if (validTransition(e)) {
              data.transitionState = modelSync.value ? "afterEnter" : "afterLeave";
              data.willChange = false;

              if (modelSync.value) {
                data.hideHeight = true;
              }

              emit("transition:end")
            }
          },
          onTransitioncancel: (e: TransitionEvent) => {
            if (validTransition(e)) {
              if (modelSync.value) {
                data.transitionState = "leaveCancelled";
              } else {
                data.transitionState = "enterCancelled";
              }

              data.willChange = false;

              emit("transition:cancel")
            }
          },
        },
        {
          default: () => [h('div', {
            ref: contentRef
          }, [slots.default?.(payload.value)])]
        }
      );
    };
  },
});
</script>

<style>
.Collapsible[data-fendui-collapsible] {
  transition: var(--transition);
  height: var(--height);
  max-height: var(--max-height);
  overflow: hidden;
}

.Collapsible.will-change[data-fendui-collapsible] {
  will-change: height;
}
</style>
