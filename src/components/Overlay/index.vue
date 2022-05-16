<script lang="ts">
import { defineComponent, PropType, ref, computed, h, resolveComponent, Teleport } from "vue"
import { componentName, optionalRootElement } from "../../utils"
import type { LikeNumber } from "../../types"
import { AnimType } from "ui-transition/dist/src/types"
import TrapFocus from 'ui-trap-focus';

export default defineComponent({
  name: componentName("Overlay"),
  props: {
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
    }
  },
  emits: ["update:modelValue", "active:true", "active:false", "initial-focus"],
  setup(_props, { emit, slots, attrs, expose }) {
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

    const payload = computed(() => ({
      toggle,
      open: () => toggle(true),
      close: () => toggle(false),
      active: modelSync.value,
    }))

    expose(payload.value);

    return () => [
      slots.activator?.(payload.value),

      h(Teleport, {
        to: props.value.teleportTo
      }, [
        // @ts-ignore
        h(resolveComponent("UiTransition"),
          {
            onAfterEnter: (node: HTMLElement) => {
              node.focus();

              console.log(300);

            }
          },
          {
            default: () => {

              const contentAttrs = {
                ...attrs,
                tabindex: modelSync.value ? '0' : '-1',
                'aria-hidden': !modelSync.value,
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
})
</script>