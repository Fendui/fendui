<script lang="ts">
import { defineComponent, h, PropType } from "vue";
import { componentName } from "../../utils";
import Overlay, { OverlayPayload } from "../Overlay/index.vue";
import Intersection from "../Intersection/index.vue";
import { computed, ref } from "@vue/reactivity";
import { sleep } from "../../utils/sleep";
import type { IntersectionEntry } from '../Intersection/type'

type From = 'top' | 'right' | 'bottom' | 'left'

const scoping = {
  'data-fendui-sheet': ''
}

export default defineComponent({
  name: componentName("Sheet"),
  inheritAttrs: false,
  components: { Overlay, Intersection },
  props: {
    modelValue: {
      type: Boolean,
      default: undefined
    },
    open: {
      type: Boolean,
      default: undefined
    },
    disabled: Boolean,
    from: {
      type: String as PropType<From>,
      default: 'bottom'
    },
    snapMandatory: Boolean,
    swipeContentOnly: Boolean,
    thresholdLength: {
      type: Number,
      default: 200,
    },
    minThreshold: {
      type: Number,
      default: 0.01,
    },
    disableRatio: Boolean,
    disableSwipe: Boolean
  },
  emits: ["update:modelValue", "active:true", "active:false", "update:ratio"],
  setup(_props, { slots, emit, attrs }) {
    const props = computed(() => _props);

    const rootRef = ref<HTMLElement | null>(null);

    const manualActive = ref(false)

    const rootScrolled = ref(false);

    const ratio = ref<number | undefined>();

    const swipedOut = ref(false);

    const modelSync = computed({
      get() {
        if (typeof props.value.modelValue === 'boolean') {
          return props.value.modelValue
        }

        if (typeof props.value.open === 'boolean') {
          return props.value.open
        }

        return manualActive.value
      },

      set(val: boolean) {
        if (typeof val === 'boolean' && !props.value.disabled) {
          rootScrolled.value = false;

          if (typeof props.value.modelValue === 'boolean') {
            emit('update:modelValue', val)
          }

          if (!(typeof props.value.open === 'boolean')) {
            manualActive.value = val
          }

          emit(`active:${val}`)
        }
      }
    })

    const getFrom = computed(() => {
      if (/^\s*(?:top|right|bottom|left)\s*$/.test(props.value.from)) {
        return props.value.from.trim()
      } return 'bottom'
    })

    const payload = computed(() => ({
      ratio: ratio.value
    }))

    return () => {
      return h(Overlay, {
        modelValue: modelSync.value,
        delayActive: {
          open: 16,
          close: 0
        },
        alwaysRender: true,
        // alwaysShow: true,
        customTransition: true,
        'onUpdate:modelValue': (evt: boolean) => modelSync.value = evt,
        'onActive:true': () => {
          swipedOut.value = false;
        },
        'onDelayed-active:true': () => {
          if (rootRef.value) {
            const root = rootRef.value
            const { from } = props.value

            if (/^(?:bottom|left)$/.test(from)) {
              const x = from === 'bottom' ? 0 : root.clientWidth
              const y = from === 'left' ? 0 : root.clientHeight

              root.scrollTo(x, y)
            } else {
              root.scrollTo(0, 0)
            }

            rootScrolled.value = true;
          }
        }
      }, {
        activator: (slotProps: OverlayPayload) => slots?.activator?.({
          ...slotProps,
          ...payload.value
        }),

        default: (_slotProps: OverlayPayload) => {

          const slotProps = {
            ..._slotProps,
            ...payload.value,
          }

          return h('div', {
            ref: rootRef,
            ...attrs,
            ...scoping,
            class: ['Sheet hide-scrollbar', getFrom.value, {
              'snap-mandatory': props.value.snapMandatory,
              'snap-proximity': !props.value.snapMandatory,
              'swipe-content-only': props.value.swipeContentOnly,
              'disable-swipe': props.value.disableSwipe
            }, attrs.class],

            style: Object.assign({
              ...((!rootScrolled.value && modelSync.value) || swipedOut.value ? {
                opacity: '0',
                pointerEvents: 'none'
              } : {
                pointerEvents: (!slotProps.delayedActive) ? 'none' : undefined
              })
            }, attrs.style || {}, props.value.disableRatio ? {} : {
              '--ratio': String(ratio.value)
            })
          }, [
            slots?.prepend?.(slotProps),

            // content
            h('div', {
              ...scoping,
              class: ['content-wrapper', {
                'full-height': !slotProps.afterEnter && modelSync.value
              }]
            }, [
              h('div', { class: 'content' }, [

                !slotProps.afterLeave || modelSync.value ?
                  h(Intersection, {
                    thresholdLength: props.value.thresholdLength,
                    'onUpdate:entry': (i: IntersectionEntry) => {
                      if (i.inactive || props.value.disableRatio) {
                        return
                      }

                      const updateRatio = () => {
                        if (!slotProps.afterEnter) return true;

                        const { from } = props.value;

                        if (from === 'bottom') {
                          return (i.boundingClientRect?.top || 0) > (i.rootBounds?.top || 0)
                        }

                        if (from === 'top') {
                          return (i.boundingClientRect?.bottom || 0) < (i.rootBounds?.bottom || 0)
                        }

                        if (from === 'left') {
                          return (i.boundingClientRect?.right || 0) > (i.rootBounds?.right || 0)
                        }

                        if (from === 'right') {
                          return (i.boundingClientRect?.left || 0) < (i.rootBounds?.left || 0)
                        }

                        return true
                      }

                      if (updateRatio()) {
                        let _ratio = i.ratio;

                        if (_ratio >= 0.991) {
                          _ratio = 1
                        }

                        if (_ratio <= 0.01) { _ratio = 0 }

                        emit("update:ratio", _ratio)

                        ratio.value = _ratio

                        if (!slotProps.afterEnter) { return }

                        if (_ratio <= props.value.minThreshold) {
                          modelSync.value = false

                          swipedOut.value = true;
                        }
                      }
                    },
                  }, {
                    default: () => h('div', {
                      ...scoping,
                      'aria-hidden': 'true',
                      class: 'observer',
                    })
                  }) : null,

                slots?.default?.(slotProps)
              ])
            ]),

            slots?.append?.(slotProps),
          ])
        }
      })
    }
  }
})
</script>

<style>
.Sheet[data-fendui-sheet] {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
}

.Sheet[data-fendui-sheet]:not(.disable-swipe) {
  overflow: auto;
  overscroll-behavior: contain;
}

.Sheet[data-fendui-sheet].swipe-content-only::before,
.Sheet[data-fendui-sheet].swipe-content-only::after {
  pointer-events: none;
}

.Sheet.bottom[data-fendui-sheet],
.Sheet.top[data-fendui-sheet] {
  flex-wrap: wrap;
}

.Sheet.snap-mandatory.bottom[data-fendui-sheet]:not(.disable-swipe),
.Sheet.snap-mandatory.top[data-fendui-sheet]:not(.disable-swipe) {
  scroll-snap-type: y mandatory;
}

.Sheet.snap-mandatory.left[data-fendui-sheet]:not(.disable-swipe),
.Sheet.snap-mandatory.right[data-fendui-sheet]:not(.disable-swipe) {
  scroll-snap-type: x mandatory;
}

.Sheet.snap-proximity.bottom[data-fendui-sheet]:not(.disable-swipe),
.Sheet.snap-proximity.top[data-fendui-sheet]:not(.disable-swipe) {
  scroll-snap-type: y proximity;
}

.Sheet.snap-proximity.left[data-fendui-sheet]:not(.disable-swipe),
.Sheet.snap-proximity.right[data-fendui-sheet]:not(.disable-swipe) {
  scroll-snap-type: x proximity;
}

.Sheet[data-fendui-sheet]::before,
.Sheet[data-fendui-sheet]::after {
  display: block;
  width: 100%;
  height: 100%;
}

.Sheet.top[data-fendui-sheet]::after,
.Sheet.right[data-fendui-sheet]::after,
.Sheet.bottom[data-fendui-sheet]::before,
.Sheet.left[data-fendui-sheet]::before {
  content: '';
  flex-shrink: 0;
}

.Sheet.bottom[data-fendui-sheet]::before {
  scroll-snap-align: end;
}

.Sheet.bottom[data-fendui-sheet] .content-wrapper {
  scroll-snap-align: start;
  align-items: flex-end;
}

.Sheet.top[data-fendui-sheet]::after {
  scroll-snap-align: start;
}

.Sheet.top[data-fendui-sheet] .content-wrapper {
  scroll-snap-align: end;
  align-items: flex-start;
}

.Sheet.left[data-fendui-sheet]::before {
  scroll-snap-align: end;
}

.Sheet.left[data-fendui-sheet] .content-wrapper {
  scroll-snap-align: start;
  justify-content: flex-end;
}

.Sheet.right[data-fendui-sheet]::after {
  scroll-snap-align: start;
}

.Sheet.right[data-fendui-sheet] .content-wrapper {
  scroll-snap-align: end;
  justify-content: flex-start;
}

.content-wrapper[data-fendui-sheet] {
  position: relative;
  isolation: isolate;
  flex-shrink: 0;
  display: flex;
}

.Sheet.bottom[data-fendui-sheet] .content-wrapper,
.Sheet.top[data-fendui-sheet] .content-wrapper,
.Sheet.bottom[data-fendui-sheet] .content,
.Sheet.top[data-fendui-sheet] .content {
  height: fit-content;
  width: 100%;
}

.Sheet.left[data-fendui-sheet] .content-wrapper,
.Sheet.right[data-fendui-sheet] .content-wrapper,
.Sheet.left[data-fendui-sheet] .content,
.Sheet.right[data-fendui-sheet] .content {
  width: fit-content;
  height: 100%;
}

.Sheet[data-fendui-sheet] .content-wrapper.full-height[data-fendui-sheet] {
  height: 100%;
  width: 100%;
}

.observer[data-fendui-sheet] {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  visibility: hidden;
}
</style>
