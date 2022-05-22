<script lang="ts">
import { computed, defineComponent, h, nextTick, PropType, ref } from 'vue'
import { componentName } from '../../utils'
import eventKey from '../../utils/eventkey'
import { uid } from '../../utils/uid'

const scoping = {
  'data-fendui-editable-text': ''
}

export default defineComponent({
  name: componentName('EditableText'),
  props: {
    modelValue: {
      type: String,
      default: undefined,
    },
    value: {
      type: String,
      default: undefined,
    },
    fallback: {
      type: String,
      default: undefined,
    },
    placeholder: {
      type: String,
      default: undefined,
    },
    tag: {
      type: String as PropType<keyof HTMLElementTagNameMap>,
      default: 'dvi'
    }
  },
  emits: ["update:modelValue", 'edit-start', 'edit-done'],
  setup(_props, { emit }) {
    const props = computed(() => _props)

    const editing = ref(false)

    const manualModelValue = ref(_props.value || _props.fallback || '')

    const id = ref(uid())

    const fallback = computed(() => {
      return props.value.fallback || props.value.value
    })

    const modelSync = computed({
      get() {
        if (typeof _props.modelValue === 'string') {
          return _props.modelValue
        }

        return manualModelValue.value
      },
      set(val: string) {
        if (typeof val === 'string') {
          if (typeof _props.modelValue === 'string') {
            emit('update:modelValue', val)
          }

          manualModelValue.value = val
        }
      },
    })

    const edit = (evt: Event) => {
      editing.value = true

      const el = evt.currentTarget as unknown as HTMLElement

      if (el) {
        nextTick(() => {
          el.querySelector('input')?.focus()
        })
      }

      emit('edit-start')
    }

    const stopEdit = () => {
      editing.value = false

      if (!modelSync.value && _props.fallback) {
        modelSync.value = _props.fallback
      }

      emit('edit-done')
    }

    return () => h(props.value.tag, {
      ...scoping,
      class: 'EditableText',
      onClick: edit,
    }, [
      h('span', {
        ...scoping,
        'aria-hidden': editing.value || undefined,
        class: ['content', { editing: editing.value }]
      }, [
        (modelSync.value || fallback.value)
      ]),

      editing.value ? [
        h('label', {
          for: id.value,
          class: 'sr-only'
        }, [
          props.value.placeholder || 'Editing'
        ]),

        h('input', {
          id: id.value,
          ...scoping,
          class: 'input',
          value: modelSync.value,
          onInput: (evt: InputEvent) => {
            modelSync.value = (evt.currentTarget as HTMLInputElement).value
          },
          type: 'text',
          placeholder: props.value.placeholder || fallback.value,
          onBlur: stopEdit,
          onKeydown: (evt: KeyboardEvent) => {
            evt.stopPropagation()
          },
          onKeyup: (evt: KeyboardEvent) => {
            const key = eventKey(evt);

            if (key === 'esc' || key === 'enter') {
              stopEdit()
            }
          }
        })
      ] : null
    ])
  },
})
</script>

<style>
.EditableText[data-fendui-editable-text] {
  position: relative;
  isolation: isolate;
  width: fit-content;
  height: fit-content;
}

.content[data-fendui-editable-text] {
  display: inline-block;
  transition: 0.15s opacity;
}

.content.editing[data-fendui-editable-text] {
  opacity: 0;
  pointer-events: none;
}

.input[data-fendui-editable-text] {
  padding: 0 0.5rem;
  position: absolute;
  z-index: 1;
  left: 0;
  width: 100%;
  height: 100%;
  animation: fendui-appear 150ms;
}
</style>