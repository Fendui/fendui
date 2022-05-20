<script lang="ts">
import { computed, defineComponent, nextTick, PropType, ref } from "vue";
import { componentName, distinctArray, optionalRootElement } from "../../utils";
import type { GroupPayload } from './type'

export default defineComponent({
  name: componentName('Group'),
  props: {
    modelValue: {
      type: Array as PropType<(number | string | object)[]>,
      default: undefined
    },
    tag: {
      type: String as PropType<keyof HTMLElementTagNameMap | undefined>,
      default: undefined
    },
    mandatory: Boolean,
    multiple: Boolean,
    disabled: Boolean,
    allowRepeated: Boolean,
    initial: {
      type: [
        Array, Object, Number, String
      ] as PropType<any>,
      default: undefined
    },
  },
  emits: ["update:modelValue", "toggle:add", "toggle:remove", "clear-all"],
  setup(p, { emit, slots, attrs }) {
    const selected = ref<any[]>([])

    const props = computed(() => p);

    const isActive = (val: any) => {
      let item = val;

      if (typeof item == "object") {
        item = JSON.stringify(item);
      }

      return selected.value.includes(item);
    }

    const add = async (val: any) => {
      if (props.value.disabled) return

      const array = [val].flat();

      array.forEach((item) => {

        if (typeof item == "object") {
          item = JSON.stringify(item);
        }

        const pseudoSelected = [
          ...(props.value.multiple ? selected.value || [] : []),
        ];

        selected.value = props.value.allowRepeated
          ? [...pseudoSelected, item]
          : distinctArray(item, [...pseudoSelected]);
      });

      await nextTick();

      emit("update:modelValue", selected.value);

      emit("toggle:add", val);
    }

    const remove = async (val: any, repeated: boolean = true) => {
      const array = [val].flat();

      array.forEach((_item) => {
        let item = _item;

        if (props.value.mandatory && selected.value.length <= 1) {
          return;
        }

        if (typeof item == "object") {
          item = JSON.stringify(val);
        }

        if (props.value.allowRepeated && repeated) {
          let removed = false;

          selected.value = [...selected.value].filter((x) => {
            if (removed) return true;

            const same = x === item

            removed = same;

            return !same
          });
        } else {
          selected.value = [...selected.value].filter((x) => x != item);
        }
      });

      await nextTick();

      emit("update:modelValue", selected.value);

      emit("toggle:remove", val);
    }

    const clear = async (id: any) => {
      selected.value = [...selected.value].filter((_item) => {
        let item = _item;

        if (typeof item === 'object') {
          item = JSON.stringify(item)
        }

        return item !== id
      })

      await nextTick()

      emit("update:modelValue", selected.value);

      emit("toggle:remove", id);
    }

    const clearAll = async () => {
      selected.value = []

      await nextTick()

      emit("update:modelValue", selected.value);

      emit("clear-all");
    }

    const toggle = (val: any) => {
      if (isActive(val)) {
        remove(val)
      } else add(val)
    }

    if (props.value.mandatory && props.value.modelValue) {
      add(props.value.modelValue);
    }

    if (typeof props.value.initial !== 'undefined') {
      add(props.value.initial);
    }

    const payload = computed<GroupPayload>(() => ({
      add,
      remove,
      toggle,
      isActive,
      clear,
      clearAll,
      active: selected.value,
    }));

    return () => optionalRootElement({
      payload,
      attrs,
      slots,
      tag: props.value.tag
    })
  },
});
</script>