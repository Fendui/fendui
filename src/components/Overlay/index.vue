<script lang="ts">
import { defineComponent, PropType, ref, computed, h, resolveComponent, HTMLAttributes, watch, Transition, Teleport, ComponentPublicInstance } from "vue"
import { componentName, getHtml, isHTML, removeEventPrefix } from "../../utils"
import type { LikeNumber } from "../../types"
import { AnimType } from "ui-transition/dist/src/types"
import TrapFocus from 'ui-trap-focus';
import { uid } from "../../utils/uid";
import eventKey from "../../utils/eventkey";
import state from "../../framework/state";
import { cancelSleep, sleep } from "../../utils/sleep";

export default defineComponent({
  name: componentName("Overlay"),
  inheritAttrs: false,
  props: {
    zIndexOffset: {
      type: [String, Number] as PropType<LikeNumber>,
      default: 1000
    },
    role: {
      type: String as PropType<HTMLAttributes["role"] | undefined>,
      default: undefined
    },
    tag: {
      type: String as PropType<keyof HTMLElementTagNameMap>,
      default: undefined
    },
    open: {
      type: Boolean,
      default: undefined
    },
    modelValue: {
      type: Boolean,
      default: undefined
    },
    disabled: Boolean,
    route: {
      type: String,
      // $route.fullPath to show overlay
      default: undefined
    },
    restoreScroll: Boolean,
    restoreFocus: {
      type: Boolean,
      default: true
    },
    focusContent: {
      type: Boolean,
      default: true
    },
    zIndex: {
      type: [String, Number] as PropType<LikeNumber>,
      default: undefined,
    },
    alwaysRender: Boolean,
    tabFoward: {
      type: Function as PropType<(evt?: KeyboardEvent) => boolean>,
      default: undefined
    },
    tabBackward: {
      type: Function as PropType<(evt?: KeyboardEvent) => boolean>,
      default: undefined,
    },
    transition: {
      type: [Boolean, Object] as PropType<AnimType | boolean>,
      default: undefined
    },
    modal: Boolean,
    closeOnEsc: Boolean,
    scrollHtml: Boolean,
    htmlActiveClass: {
      type: String,
      default: undefined
    },
    closeOnClickOutside: Boolean,
    uiTransition: {
      type: Boolean, default: true
    },
    delayActive: {
      type: [String, Number, Object] as PropType<LikeNumber | {
        open?: LikeNumber;
        close?: LikeNumber;
        enter?: LikeNumber;
        leave: LikeNumber;
      }>,
      default: () => 0
    },
    teleportTo: {
      type: String,
      default: 'body'
    },
    customTeleport: Boolean,
    customTransition: Boolean,
  },
  emits: ["update:modelValue", "click:outside", "active:true", "active:false", "initial-focus"],
  setup(_props, { emit, slots, attrs, expose }) {
    const previousFocus = ref<HTMLElement | null>(null);

    const contentRef = ref<HTMLElement | ComponentPublicInstance | null>(null)

    const props = computed(() => _props)

    const manualActive = ref(props.value.open || false);

    const contentEntered = ref(false);

    const contentLeft = ref(false);

    const delayedActive = ref(false);

    const delayActiveTimeoutId = ref(0);

    const getActiveDelay = computed(() => {
      const delay = props.value.delayActive;

      const output = {
        open: 0, close: 0
      }

      if (typeof delay === 'object') {
        output.open = parseFloat(String((delay.open || delay.enter || 0)))
        output.close = parseFloat(String((delay.close || delay.leave || 0)))
      }

      else {
        const parsedDelay = parseFloat(String(delay));

        output.open = parsedDelay;
        output.close = parsedDelay;
      }

      return output
    })

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
        if (typeof val === 'boolean') {
          if (typeof props.value.modelValue === 'boolean') {
            emit('update:modelValue', val)
          }

          if (!(typeof props.value.open === 'boolean')) {
            manualActive.value = val
          }

          emit(`active:${val}`)

          const delayActive = getActiveDelay.value[val ? 'open' : 'close']

          if (delayActive) {
            if (delayActiveTimeoutId.value) {
              cancelSleep(delayActiveTimeoutId.value)
            }

            sleep(delayActive, () => {
              delayedActive.value = val;

              delayActiveTimeoutId.value = 0
            }).then(id => {
              delayActiveTimeoutId.value = id;
            })
          } else {
            delayedActive.value = val
          }
        }
      }
    })

    const toggle = (val?: boolean) => modelSync.value = (typeof val === 'boolean' ? val : !modelSync.value);

    const id = ref(uid());

    const activatorId = `activator-${id.value}`

    const clickAwayCB = async (evt: MouseEvent) => {

      if (!contentRef.value) { return }

      const ref = '$el' in contentRef.value ? (contentRef.value.$el as HTMLElement) : contentRef.value as HTMLElement

      if (contentEntered.value && isHTML(ref) && !ref.contains(evt.target as HTMLElement)) {
        await sleep(32)

        emit("click:outside")

        props.value.closeOnClickOutside && toggle(false)
      }
    }

    const removeFromOverlayState = (key: string) => {
      const html = getHtml();

      html.removeEventListener('click', clickAwayCB)

      const stateValue = { ...state.value };

      delete stateValue.overlays[key]

      state.value = stateValue
    }

    const addToOverlayState = (key: string) => {
      removeFromOverlayState(key)

      const stateValue = { ...state.value };

      stateValue.overlays[key] = state.value.overlays.size + 1

      state.value = stateValue

      const html = getHtml();

      html.addEventListener('click', clickAwayCB)
    }

    watch(() => id.value, (newVal, oldVal) => {
      removeFromOverlayState(oldVal)
      addToOverlayState(newVal)
    })

    const overlayKeys = computed(() => Object.keys(state.value.overlays))

    const overlayIndex = computed(() => overlayKeys.value.indexOf(id.value))

    const closestOverlay = computed(() => overlayKeys.value[overlayKeys.value.length - 1] === id.value)

    const zIndex = computed(() => {
      if (props.value.zIndex) {
        return props.value.zIndex
      }

      return (modelSync.value || !contentLeft.value) ? (
        Number(props.value.zIndexOffset) + overlayIndex.value
      ) : undefined
    })

    const transitionEvents = {
      onBeforeEnter: () => {
        contentLeft.value = false

        contentEntered.value = false;

        addToOverlayState(id.value)

        previousFocus.value = document.activeElement as HTMLElement;

        toggleHtmlClasses('add')
      },
      onEnterCancelled: () => {
        removeFromOverlayState(id.value)
      },
      onAfterEnter: (node: HTMLElement) => {
        node.focus();

        emit("initial-focus")

        contentEntered.value = true
      },
      onBeforeLeave: (node: HTMLElement) => {
        if (props.value.restoreFocus && previousFocus.value) {
          previousFocus.value.focus()
        }
      }
    }

    const contentAttrs = computed(() => {
      const contentAria = {
        role: props.value.role,
        id: id.value,
        'aria-modal': props.value.modal ? 'true' : undefined,
        // 'aria-describedby': modelSync.value ? describedby : undefined,
        'aria-labelledby': activatorId,
        'aria-hidden': !modelSync.value || undefined,
      }

      return {
        ref: contentRef,
        ...contentAria,
        ...attrs,
        tabindex: modelSync.value ? '0' : '-1',
        onKeydown: (evt: KeyboardEvent) => {
          evt.stopPropagation()

          if (eventKey(evt) === 'esc') {
            toggle(false)
          } else {
            new TrapFocus({
              loop: true,
            }).init(evt)
          }
        },
        onVnodeBeforeUnmount: () => {
          contentEntered.value = false;
        },
        onVnodeUnmounted: () => {

          removeFromOverlayState(id.value)

          contentLeft.value = true

          toggleHtmlClasses('remove')
        }
      }
    })

    const payload = computed(() => ({
      toggle,
      open: () => toggle(true),
      close: () => toggle(false),
      active: modelSync.value,
      id: id.value,
      zIndex: zIndex.value,
      transitionEvents: removeEventPrefix(transitionEvents),
      delayedActive: delayedActive.value && modelSync.value,
      contentAttrs: contentAttrs.value
    }))

    expose(payload.value);

    const toggleHtmlClasses = (action: 'add' | 'remove') => {
      if (action === 'remove' && state.value.overlays.size > 1) {
        return
      }

      const { htmlActiveClass, scrollHtml } = props.value

      if (htmlActiveClass || !scrollHtml) {
        const html = document.documentElement || document.querySelector('html')

        htmlActiveClass && html.classList[action](htmlActiveClass)

        !scrollHtml && html.classList[action]('Overlay-active')
      }
    }

    return () => {
      const activatorSlot = slots.activator?.({
        ...payload.value,
        attrs: {
          id: activatorId,
          'aria-controls': id.value,
          // 'aria-haspopup': 'dialog',
          'aria-expanded': modelSync.value,
          'aria-hidden': modelSync.value ? 'true' : undefined,
          'tabindex': modelSync.value ? '-1' : undefined
        }
      });

      const wrapper = () => {

        const tag = props.value.tag

        const contentPrivateAttrs = {
          ...contentAttrs.value,
          'data-fendui-overlay': '',
          'data-overlay-index': String(overlayIndex.value),
          'data-closest-overlay': closestOverlay.value ? '' : undefined,
          style: {
            '--z-index': zIndex.value
          },
          class: ['Overlay'],
        }

        const content = modelSync.value || delayedActive.value ?
          (tag ? h(tag, contentPrivateAttrs, {
            default: () => [slots.default?.(payload.value)]
          }) :
            h(slots.default?.(payload.value)?.[0] || 'template', contentPrivateAttrs)
          ) : null

        // @ts-ignore
        return props.value.customTransition ? content : h(resolveComponent('UiTransition'), {
          ...transitionEvents,
          ...attrs
        }, {
          default: () => content
        })
      }

      return [
        activatorSlot ? h(activatorSlot[0]) : null,

        props.value.customTeleport ? wrapper() : h(Teleport, {
          to: props.value.teleportTo
        }, [
          wrapper()
        ])
      ]
    }
  }
})
</script>

<style>
.Overlay-active {
  overflow: hidden;
}

.Overlay[data-fendui-overlay] {
  z-index: var(--z-index);
}
</style>