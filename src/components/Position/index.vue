<script lang="ts">
import { computed, ref } from "@vue/reactivity";
import { defineComponent, h, nextTick, onMounted, PropType, watch } from "vue";
import { createPopper, Instance as PopperInstance, Placement, Options as PopperOptions, VirtualElement } from '@popperjs/core'
import { componentName, isHTML } from "../../utils";
import Overlay from '../Overlay/index.vue'
import { OverlayPayload } from "../Overlay/type";
import { ClassName, LikeNumber } from "../../types";
import { sleep } from "../../utils/sleep";

const scoping = {
  'data-fendui-position': ''
}

const arrowAttr = {
  ...scoping,
  'data-popper-arrow': '',
  class: ['arrow'],
}

export default defineComponent({
  name: componentName("Position"),
  inheritAttrs: false,
  props: {
    zIndex: {
      type: [String, Number] as PropType<LikeNumber>,
      default: undefined,
    },

    modelValue: {
      type: Boolean,
      default: undefined
    },
    active: {
      type: Boolean,
      default: undefined
    },
    trigger: {
      type: String,
      default: undefined
    },
    role: {
      type: String,
      default: undefined
    },
    placement: {
      type: String as PropType<Placement>,
      default: 'bottom'
    },
    fixed: Boolean,
    offset: {
      type: Array as unknown as PropType<[number, number]>,
      default: undefined
    },
    arrow: {
      type: [String, Number] as PropType<LikeNumber>,
      default: 0
    },
    closeOnClickOutside: {
      type: Boolean,
      default: true
    },
    arrowStyle: {
      type: Object as PropType<Record<string, string>>,
      default: undefined
    },
    arrowClass: {
      type: [String, Array, Object] as PropType<ClassName>,
      default: undefined
    },
    flip: Boolean,
    closeOnEsc: Boolean,
    scrollHtml: Boolean,
    disableTeleport: Boolean,
    teleportTo: {
      type: String,
      default: 'body'
    },
    disabled: Boolean
  },
  emits: ["update:modelValue"],
  setup(_props, { emit, slots, attrs }) {

    const props = computed(() => _props)

    const manualModel = ref<boolean>(Boolean(props.value.active))

    const triggerRef = ref<HTMLElement | null>(null);

    const contentRef = ref<HTMLElement | null>(null);

    const popperInstance = ref<PopperInstance | null>(null);

    // use this to disable the overlay from opening or closing.
    // useful when trying to use contextmenu for trigger.
    // the setPosition fn will disable the overlay for a frame to set position,
    // then enable
    // const manualDisabled = ref(props.value.disabled)

    const getTrigger = computed<HTMLElement | null>(() => {
      if (isHTML(triggerRef.value)) {
        return triggerRef.value as HTMLElement
      }

      if (typeof props.value.trigger === 'string') {
        const trigger = document.querySelector(props.value.trigger)

        if (trigger) {
          return trigger as HTMLElement
        }
      }

      return null
    })

    const renderArrow = computed(() => Boolean((Number(props.value.arrow) && !slots.arrow)))

    const popperInstanceOption = computed(() => {
      const { placement, fixed } = props.value;

      const offset =
        props.value.offset
        || (
          props.value.arrow
            ? [0, (Number(props.value.arrow) || 2) + 2]
            : [0, 0]
        )

      return {
        placement,
        strategy: fixed ? 'fixed' : 'absolute',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset
            }
          },
          { name: 'eventListeners', enabled: props.value.flip },
        ]
      } as PopperOptions
    })

    const popperElementTransforms = computed<{ arrowTransform?: string; contentTransform?: string }>(() => {
      if (!popperInstance.value) {
        return {}
      }

      return {
        arrowTransform: popperInstance.value.state.styles.arrow?.transform,
        contentTransform: popperInstance.value.state.styles.popper?.transform
      }
    })

    const positionContent = () => {
      nextTick(() => {
        if (modelSync.value && getTrigger.value && contentRef.value) {
          popperInstance.value = createPopper(
            getTrigger.value,
            contentRef.value,
            popperInstanceOption.value,
          )

          updatePopper()
        }
      })
    }

    const cleanUpPopper = () => {
      if (popperInstance.value) {
        popperInstance.value.destroy()
      }
    }

    const refreshPopper = async () => {
      if (modelSync.value) {
        cleanUpPopper();

        await nextTick();

        positionContent()
      }
    }

    const updatePopper = async () => {
      await nextTick()

      if (popperInstance.value) {

        popperInstance.value.setOptions(popperInstanceOption.value)

        await popperInstance.value.update()
      }

      return Promise.resolve()
    }

    const toggleModel = (val: boolean) => {
      if (typeof props.value.modelValue === 'boolean') {
        emit("update:modelValue", val)
      }

      manualModel.value = val
    }

    const positioning = ref(false);

    const modelSync = computed({
      get() {
        if (typeof props.value.modelValue === 'boolean') {
          return props.value.modelValue
        }

        return manualModel.value
      },
      set(val: boolean) {
        if (typeof val === 'boolean') {
          toggleModel(val)

          if (val && !positioning.value) {
            positionContent()
          }
        }
      }
    })

    const watchProps = computed(() => {
      const { placement, fixed, trigger, offset, arrow, flip, arrowStyle, arrowClass } = props.value;

      return JSON.stringify({
        placement,
        fixed,
        trigger,
        offset,
        arrow,
        flip,
        arrowStyle,
        arrowClass
      })
    })

    const setPosition = (arg: { x: number, y: number, type?: string }) => {
      positioning.value = true;

      const { x, y, type } = arg;

      toggleModel(true);

      // keyboard event calling this. Just open popper normally.
      if ((type && type.startsWith('key')) || (!x && !y)) {
        return (modelSync.value = true)
      }

      nextTick(() => {
        if (!contentRef.value || !modelSync.value) {
          positioning.value = false;
          return
        }

        // manualDisabled.value = true;

        const generateGetBoundingClientRect = () => {
          return () => ({
            width: 0,
            height: 0,
            top: y,
            right: x,
            bottom: y,
            left: x,
            x, y
          });
        }

        const virtualElement = {
          getBoundingClientRect: generateGetBoundingClientRect(),
        } as VirtualElement;

        cleanUpPopper()

        popperInstance.value = createPopper(
          virtualElement,
          contentRef.value,
          popperInstanceOption.value,
        )

        sleep(() => {
          // manualDisabled.value = false;

          if (contentRef.value) {
            const overlayRoot = contentRef.value.closest('.Overlay') as HTMLElement | null

            if (overlayRoot && !overlayRoot.contains(document.activeElement)) {
              overlayRoot.focus()
            }
          }

          positioning.value = false;
        })
      })
    }

    onMounted(positionContent)

    watch(() => watchProps.value, updatePopper)

    watch(() => props.value.trigger, refreshPopper)

    return () => h(Overlay,
      {
        ...scoping,
        modelValue: modelSync.value,
        'onUpdate:modelValue': (val: boolean) => {
          modelSync.value = val
        },
        tag: 'div',
        customTransition: true,
        alwaysRender: true,
        closeOnClickOutside: props.value.closeOnClickOutside,
        scrollHtml: props.value.scrollHtml,
        closeOnEsc: props.value.closeOnEsc,
        disableTeleport: props.value.disableTeleport,
        teleportTo: props.value.teleportTo,
        role: props.value.role,
        zIndex: props.value.zIndex,
        'onAfter-leave': cleanUpPopper,
        disabled: props.value.disabled,
        delayActive: 16
      },
      {
        trigger: (slotPayload: OverlayPayload) => {
          return slots?.trigger?.({
            ref: triggerRef,
            ...slotPayload,
            ...popperElementTransforms.value,
            setPosition
          })
        },
        default: (slotPayload: OverlayPayload) => {
          const arrowStyle = {
            style: {
              '--size': `${Number(props.value.arrow)}px`,
              ...(props.value.arrowStyle || {})
            },
          }

          return h('div',
            {
              ref: contentRef,
              ...scoping,
              ...attrs,
              class: ['content', attrs.class],
            },
            [
              renderArrow.value && !slotPayload.afterLeave ? h('div', {
                ...arrowAttr,
                ...arrowStyle,
                class: [
                  arrowAttr.class,
                  props.value.arrowClass
                ]
              }) : slots.arrow?.({
                ...slotPayload,
                attrs: {
                  ...arrowAttr,
                  ...arrowStyle
                },
                ...popperElementTransforms.value,
                setPosition
              }),

              slots?.default?.({
                ...slotPayload,
                arrowAttrs: arrowAttr,
                ...popperElementTransforms.value,
                setPosition,
              })
            ])
        }
      })
  }
})
</script>

<style>
.arrow[data-fendui-position],
.arrow[data-fendui-position]::before {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: inherit;
  --arrow-offset: calc(0px - calc(var(--size) / 2));
  pointer-events: none;
}

.arrow[data-fendui-position] {
  visibility: hidden;
}

.arrow[data-fendui-position]::before {
  visibility: visible;
  content: '';
  transform: rotate(45deg);
}

.content[data-fendui-position][data-popper-placement^='top'] .arrow[data-fendui-position] {
  bottom: var(--arrow-offset);
}

.content[data-fendui-position][data-popper-placement^='bottom'] .arrow[data-fendui-position] {
  top: var(--arrow-offset);
}

.content[data-fendui-position][data-popper-placement^='left'] .arrow[data-fendui-position] {
  right: var(--arrow-offset);
}

.content[data-fendui-position][data-popper-placement^='right'] .arrow[data-fendui-position] {
  left: var(--arrow-offset);
}
</style>