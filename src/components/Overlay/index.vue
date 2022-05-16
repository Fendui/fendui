<script lang="ts">
import { defineComponent, PropType, ref, computed, h, resolveComponent, Teleport, HTMLAttributes, watch } from "vue"
import { componentName, optionalRootElement } from "../../utils"
import type { LikeNumber } from "../../types"
import { AnimType } from "ui-transition/dist/src/types"
import TrapFocus from 'ui-trap-focus';
import { uid } from "../../utils/uid";
import eventKey from "../../utils/eventkey";
import state from "../../framework/state";

export default defineComponent({
  name: componentName("Overlay"),
  inheritAttrs: false,
  props: {
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
    teleportTo: {
      type: String,
      default: 'body'
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
    }
  },
  emits: ["update:modelValue", "active:true", "active:false", "initial-focus"],
  setup(_props, { emit, slots, attrs, expose }) {
    const previousFocus = ref<HTMLElement | null>();

    const props = computed(() => _props)

    const manualActive = ref(props.value.open || false);

    const contentEntered = ref(false);
    const contentLeft = ref(false);

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
        }
      }
    })

    const toggle = (val?: boolean) => modelSync.value = (typeof val === 'boolean' ? val : !modelSync.value);

    const id = ref(uid());

    const removeFromOverlayState = (key: string) => {
      const stateValue = { ...state.value };

      stateValue.overlays.delete(key)

      state.value = stateValue
    }

    const addToOverlayState = (key: string) => {
      const stateValue = { ...state.value };

      stateValue.overlays.set(key, (state.value.overlays.size + 1))

      state.value = stateValue
    }

    watch(() => id.value, (newVal, oldVal) => {
      removeFromOverlayState(oldVal)
      addToOverlayState(newVal)
    })

    const payload = computed(() => ({
      toggle,
      open: () => toggle(true),
      close: () => toggle(false),
      active: modelSync.value,
      id: id.value
    }))

    expose(payload.value);

    const toggleHtmlClasses = (action: 'add' | 'remove') => {
      const { htmlActiveClass, scrollHtml } = props.value

      if (htmlActiveClass || !scrollHtml) {
        const html = document.documentElement || document.querySelector('html')

        htmlActiveClass && html.classList[action](htmlActiveClass)

        !scrollHtml && html.classList[action]('Overlay-active')
      }
    }

    const activatorId = `activator-${id.value}`

    const zIndex = computed(() => {
      return props.value.zIndex || ((modelSync.value || !contentLeft.value) ? 1000 + state.value.overlays.size : undefined)
    })

    return () => {
      const activatorSlot = slots.activator?.(payload.value);

      const activatorAttrs = {
        id: activatorId,
        'aria-controls': id.value,
        // 'aria-haspopup': 'dialog',
        'aria-expanded': modelSync.value,
      }

      return [
        activatorSlot ? h(activatorSlot[0], {
          ...activatorAttrs
        }) : null,

        h(Teleport, {
          to: props.value.teleportTo
        }, [
          // @ts-ignore
          h(resolveComponent("UiTransition"),
            {
              ...attrs,
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

                contentEntered.value = true
              },
              onBeforeLeave: () => {
                contentEntered.value = false;
              },
              onAfterLeave: () => {
                if (props.value.restoreFocus && previousFocus.value) {
                  previousFocus.value.focus()
                }

                toggleHtmlClasses('remove')

                removeFromOverlayState(id.value)

                contentLeft.value = true
              }
            },
            {
              default: () => {
                const aria = {
                  role: props.value.role,
                  id: id.value,
                  'aria-modal': props.value.modal ? 'true' : undefined,
                  // 'aria-describedby': modelSync.value ? describedby : undefined,
                  'aria-labelledby': activatorId,
                  'aria-hidden': !modelSync.value || undefined,
                }

                const contentAttrs = {
                  ...aria,
                  ...attrs,
                  tabindex: modelSync.value ? '0' : '-1',
                  class: ['Overlay'],
                  style: {
                    '--z-index': zIndex.value
                  },
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
                }

                const tag = props.value.tag

                return [
                  modelSync.value ?
                    (tag ? h(tag, {
                      ...contentAttrs,
                    }, {
                      default: () => [slots.default?.(payload.value)]
                    }) :
                      h(slots.default?.(payload.value)?.[0] || 'template', {
                        ...contentAttrs
                      })
                    ) : null
                ]
              }
            })
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
</style>

<style scoped>
.Overlay {
  z-index: var(--z-index);
}
</style>