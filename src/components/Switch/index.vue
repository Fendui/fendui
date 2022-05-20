
<template>
  <slot name="prepend" v-bind='payload' />

  <div data-fendui-switch role="checkbox" :aria-checked="isChecked ? 'true' : 'false'" class="Switch"
    :class="{ disabled, readonly }" v-bind="$attrs" @click="toggle(!isChecked)" @keydown.prevent.left="toggle(false)"
    @keydown.prevent.right="toggle(true)">
    <!-- track -->
    <UiTransition :duration="300" spring="stiff">
      <div v-if="isChecked" data-fendui-switch class="track" :class="trackClass">
        <slot name="track" v-bind="payload" />
      </div>
    </UiTransition>

    <!-- thumb -->
    <UiTransition :config="{
      leave: false,
      enter: isChecked ? `slideX(0, ${activeTranslate}, 'px')` : `slideX(${activeTranslate}, 0, 'px')`,
    }" retain-final-style :duration="300" spring="stiff">
      <div :key="`${isChecked}`" data-fendui-switch :class="[
        'thumb', thumbClass
      ]" :style="`--transalate-x: ${activeTranslate}px`">
        <slot name="thumb" v-bind='payload' />

        <input ref="input" :id="inputAttrs.id || id || payload.id" data-fendui-switch v-bind="inputAttrs"
          type="checkbox" :class="{ 'sr-only': !showInput }" :checked="isChecked" :disabled="disabled"
          :readonly="readonly" v-autofocus="autofocus" @input="onInput" />
      </div>
    </UiTransition>
  </div>

  <slot name="append" v-bind='payload' />

</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, VNode } from "vue";
import { ClassName } from "../../types";
import { uid } from "../../utils/uid";
import autofocus from "../../framework/directives/autofocus";

export default defineComponent({
  name: "Switch",
  emits: ["update:modelValue"],
  directives: { autofocus },
  props: {
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    id: {
      type: String,
      default: undefined,
    },
    inputAttrs: {
      type: Object,
      default: () => ({}),
    },
    disabled: Boolean,
    autofocus: Boolean,
    readonly: Boolean,
    showInput: Boolean,
    activeTranslate: {
      type: Number,
      default: 18
    },
    trackClass: {
      type: [String, Object, Array] as PropType<ClassName>,
      default: undefined
    },
    thumbClass: {
      type: [String, Object, Array] as PropType<ClassName>,
      default: undefined
    }
  },

  setup(_props, { emit }) {
    const props = computed(() => _props);

    const state = ref(false);

    const input = ref(null);

    const isChecked = computed(() => {
      if (typeof props.value.modelValue == "boolean") {
        return props.value.modelValue;
      }
      return state.value;
    });

    const toggle = (val?: boolean) => {
      const value = typeof val === "boolean" ? val : !isChecked.value;

      if (typeof props.value.modelValue !== "undefined") {
        emit("update:modelValue", value);
      }

      state.value = value;

      if (input.value) {
        const inputEl = input.value as unknown as HTMLInputElement;

        inputEl.focus?.();
      }
    };

    const onInput = (e: Event) => {
      const target = e.target as unknown as HTMLInputElement;

      toggle(target.checked);
    };

    const payload = computed(() => ({
      toggle,
      id: uid()
    }))

    const triggerAutofocus = (vnode: VNode) => {
      if (vnode.el) {
        (vnode.el as HTMLElement).focus()
      }
    }

    return {
      toggle,
      onInput,
      isChecked,
      input,
      payload,
      triggerAutofocus
    };
  },
});
</script>

<style>
.Switch[data-fendui-switch] {
  width: var(--width, 42px);
  height: var(--height, 24px);
  background: var(--background, rgb(195, 195, 195));
  border-radius: 1rem;
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  border: 1px solid rgb(0, 0, 0, 0.2)
}

.Switch[data-fendui-switch]:not(.disabled):not(.readonly) {
  cursor: pointer;
}

.track[data-fendui-switch] {
  background: var(--track-color, red);
  position: absolute;
  border-radius: inherit;
  width: 100%;
  height: 100%
}

.thumb[data-fendui-switch] {
  width: var(--thumb-width, 22px);
  height: var(--thumb-height, 22px);
  border-radius: var(--thumb-height, 22px);
  background: var(--thumn-background, #fff);
  z-index: 1;
  margin: 0;
  border: 1px solid rgb(0, 0, 0, 0.4);
  position: absolute;
  left: 0;
  transition: transform 200ms;
}

.Switch.checked[data-fendui-switch] .thumb {
  transform: translate3d(14px, 0, 0);
}
</style>