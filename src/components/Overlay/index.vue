<script lang="ts">
import { defineComponent, PropType, ref, computed, h, resolveComponent, Teleport, HTMLAttributes } from "vue"
import { componentName, optionalRootElement } from "../../utils"
import type { LikeNumber } from "../../types"
import { AnimType } from "ui-transition/dist/src/types"
import TrapFocus from 'ui-trap-focus';
import { uid } from "../../utils/uid";

export default defineComponent({
  name: componentName("Overlay"),
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
    modal: Boolean
  },
  emits: ["update:modelValue", "active:true", "active:false", "initial-focus"],
  setup(_props, { emit, slots, attrs, expose }) {
    const previousFocus = ref<HTMLElement | null>();

    const props = computed(() => _props)

    const manualActive = ref(props.value.open || false);

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

    const id = uid();


    const payload = computed(() => ({
      toggle,
      open: () => toggle(true),
      close: () => toggle(false),
      active: modelSync.value,
      id
    }))

    expose(payload.value);


    const activatorId = `activator-${id}`

    return () => {
      const activatorSlot = slots.activator?.(payload.value);

      const activatorAttrs = {
        id: activatorId,
        'aria-controls': id,
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
              onBeforeEnter: () => {
                previousFocus.value = document.activeElement as HTMLElement;
              },
              onAfterEnter: (node: HTMLElement) => {
                node.focus();
              },
              onAfterLeave: () => {
                if (props.value.restoreFocus && previousFocus.value) {
                  previousFocus.value.focus()
                }
              }
            },
            {
              default: () => {
                const aria = {
                  role: props.value.role,
                  id,
                  'aria-modal': props.value.modal ? 'true' : undefined,
                  // 'aria-describedby': modelSync.value ? describedby : undefined,
                  'aria-labelledby': activatorId,
                  'aria-hidden': !modelSync.value || undefined,
                }

                const contentAttrs = {
                  ...aria,
                  ...attrs,
                  tabindex: modelSync.value ? '0' : '-1',
                  onKeydown: (evt: KeyboardEvent) => {
                    new TrapFocus({
                      loop: true,
                    }).init(evt)
                  }
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