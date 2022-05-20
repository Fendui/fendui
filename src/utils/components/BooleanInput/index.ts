import { computed, ref } from "@vue/reactivity";
import { capitalize, defineComponent, h, PropType, withDirectives } from "vue";
import { componentName } from "../..";
import autofocus from "../../../framework/directives/autofocus";
import { uid } from "../../uid";

export default function BooleanInput(name: "radio" | "checkbox") {
  const scoping = { [`data-fendui-${name}`]: "" };

  const capitalizeName = capitalize(name);

  return defineComponent({
    name: componentName(capitalizeName),
    props: {
      modelValue: {
        type: Boolean,
        default: undefined,
      },
      disabled: Boolean,
      readonly: Boolean,
      required: Boolean,
      checked: {
        type: Boolean,
        default: undefined,
      },
      id: {
        type: String,
        default: undefined,
      },
      autofocus: Boolean,
      tag: {
        type: String as PropType<keyof HTMLElementTagNameMap>,
        default: "span",
      },
      inputAttrs: {
        type: Object as PropType<Record<string, any>>,
        default: undefined,
      },
      showInput: Boolean,
    },
    emits: ["update:modelValue"],

    setup(_props, { emit, slots }) {
      const props = computed(() => _props);

      const manualModel = ref(false);

      const modelSync = computed({
        get() {
          if (typeof props.value.modelValue === "boolean") {
            return props.value.modelValue;
          }

          if (typeof props.value.checked === "boolean") {
            return props.value.checked;
          }

          return manualModel.value;
        },
        set(val: boolean) {
          if (typeof val === "boolean") {
            if (typeof props.value.modelValue === "boolean") {
              emit("update:modelValue", val);
            }
            manualModel.value = val;
          }
        },
      });

      const id = ref(uid());

      const getId = computed(() => props.value.id || id.value);

      const payload = computed(() => ({
        active: modelSync.value,
        id: getId.value,
      }));

      const inputRef = ref<HTMLInputElement | null>(null);

      return () => {
        return [
          slots?.prepend?.(payload.value),

          h(
            props.value.tag,
            {
              ...scoping,
              // role: "radio",
              // "aria-checked": `${modelSync.value}`,
              // "aria-readonly": props.value.readonly || undefined,
              class: [capitalizeName],
              onClick: () => {
                if (inputRef.value) {
                  inputRef.value.focus();

                  inputRef.value.click();
                }
              },
            },
            [
              withDirectives(
                h("input", {
                  ref: inputRef,
                  id: getId.value,
                  type: name,
                  class: props.value.showInput ? undefined : "sr-only",
                  ...(props.value.inputAttrs || {}),
                  checked: modelSync.value ? "checked" : undefined,
                  required: props.value.required,
                  disabled: props.value.disabled,
                  readonly: props.value.readonly,

                  onInput: (e: InputEvent) => {
                    const value = (e.currentTarget as HTMLInputElement).checked;

                    modelSync.value = value;
                  },
                }),
                [[autofocus, props.value.autofocus]]
              ),

              slots?.default?.(payload.value),
            ]
          ),

          slots?.append?.(payload.value),
        ];
      };
    },
  });
}
