<script lang="ts">
import { computed, ref } from "@vue/reactivity";
import { defineComponent, h, HTMLAttributes, PropType } from "vue";
import TrapFocus from 'ui-trap-focus';
import { componentName, getType } from "../../utils";
import Group from "../Group/index.vue"
import eventKey from "../../utils/eventkey";
import { GroupPayload } from "../Group/type";
import { TabPayload } from "./type";
import { uid } from "../../utils/uid";

const scoping = { 'data-fendui-tab': '' }

export default defineComponent({
  name: componentName("Tab"),
  props: {
    tag: {
      type: String as PropType<keyof HTMLElementTagNameMap>,
      default: undefined
    },
    modelValue: {
      type: Array as PropType<any[]>,
      default: undefined,
    },
    option: {
      type: Array as PropType<any[]>,
      required: true
    },
    vertical: Boolean,
    role: {
      type: String as PropType<HTMLAttributes['role']>,
      default: 'tablist'
    },
    loop: Boolean
  },
  emits: ['update:modelValue',],
  setup(_props, { emit, slots, }) {
    const props = computed(() => _props);

    // use this when there's no v-model
    const manualModel = ref(props.value.option)

    const hasVModel = computed(() => getType(props.value.modelValue) === 'array')

    const modelSync = computed({
      get() {
        if (hasVModel.value) {
          return props.value.modelValue || []
        }
        return manualModel.value
      },
      set(_val: any[]) {
        const val = [_val].flat()

        if (hasVModel.value) {
          emit("update:modelValue", val)
        }

        else {
          manualModel.value = val
        }
      }
    })

    const _id = ref(uid())

    return () => h(Group, {
      modelValue: modelSync.value,
      'onUpdate:modelValue': (val) => {
        modelSync.value = val;
      },
      tag: props.value.tag,
    }, {
      default: (slotProps: GroupPayload) => {
        const { isActive, add } = slotProps;

        const payload: TabPayload = {
          items: props.value.option.map((item) => {
            const active = isActive(item);

            return {
              active,
              item,
            }
          }),

          isActive,
          reset: slotProps.clearAll,
          select: slotProps.add
        }

        return slots?.default ? [
          h('div', {
            ...scoping,
            role: props.value.role,
            'aria-orientation': props.value.vertical ? 'vertical' : 'horizontal',
            onKeydown: (evt: KeyboardEvent) => {
              const key = eventKey(evt)

              const tabThrough = (dir: 'forward' | 'backward') => {
                evt.preventDefault()

                const currentIndex = props.value.option.map((value) => {
                  if (typeof value === 'object') {
                    return JSON.stringify(value)
                  }

                  return value
                }).indexOf(modelSync.value[0])

                let nextIndex = dir === 'forward' ? currentIndex + 1 : currentIndex - 1;

                // cycle
                if (nextIndex < 0) {
                  if (props.value.loop) {
                    nextIndex = props.value.option.length - 1;
                  } else {
                    nextIndex = 0
                  }
                }

                if (nextIndex >= props.value.option.length) {
                  if (props.value.loop) {
                    nextIndex = 0;
                  } else {
                    nextIndex = props.value.option.length - 1
                  }
                }

                add(props.value.option[nextIndex])

                // get next tab control and focus on it;
                const nextControlId = `${_id.value}-${nextIndex}`

                const nextControlEl = document.getElementById(nextControlId);

                if (nextControlEl) {
                  nextControlEl.focus()
                }
              }

              if (key.startsWith('arrow')) {
                if (props.value.vertical) {
                  if (/_down|_up/.test(key)) {
                    tabThrough(key === 'arrow_down' ? 'forward' : 'backward')
                  }
                } else if (/_right|_left/.test(key)) {
                  tabThrough(key === 'arrow_right' ? 'forward' : 'backward')
                }
              }
            }
          }, [
            slots.default?.({
              ...payload,
              items: payload.items.map((item, key) => {
                const { active } = item;

                const id = `${_id.value}-${key}`

                const ariaControls = `content-${id}`

                return {
                  ...item,
                  attrs: {
                    role: 'tab',
                    'aria-selected': String(active),
                    id,
                    'aria-controls': ariaControls,
                    tabindex: active ? '0' : '-1'
                  }
                }
              })
            })
          ]),
          slots?.content?.({
            ...payload,
            items: payload.items.map((item, key) => {
              const { active } = item;

              const id = `${_id.value}-${key}`

              const selfId = `content-${id}`

              return {
                ...item,
                attrs: {
                  id: selfId,
                  role: 'tabpanel',
                  'aria-labelledby': id,
                }
              }
            })
          })
        ] : null
      }
    })
  }
})
</script>