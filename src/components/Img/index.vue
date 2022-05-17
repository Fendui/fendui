<script lang="ts">
import { computed, ref, } from "@vue/reactivity";
import { defineComponent, PropType, h } from "vue";
import { LikeNumber, Duration, ClassName } from "../../types";
import { componentName, convertToMilliSecond, srOnlyStyle } from "../../utils";
import Intersection from '../Intersection/index.vue'

export default defineComponent({
  name: componentName("Img"),
  props: {
    tag: {
      type: String as PropType<keyof HTMLElementTagNameMap>,
      default: 'div'
    },
    height: {
      type: [String, Number] as PropType<LikeNumber>,
      default: undefined
    },
    width: {
      type: [String, Number] as PropType<LikeNumber>,
      default: undefined
    },
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    },
    notIntersectingText: {
      type: String,
      default: undefined
    },
    loading: {
      type: String as PropType<'eager' | 'lazy'>
    },
    backgroundImage: Boolean,
    loadEffect: {
      type: String as PropType<'blur' | 'fade'>,
      default: undefined
    },
    loadEffectDuration: {
      type: [String, Number] as PropType<Duration>,
      default: '200'
    },
    loadEffectDelay: {
      type: [String, Number] as PropType<Duration>,
      default: '0'
    },
    loadEffectEase: {
      type: String,
      default: 'linear'
    },
    loadingClass: {
      type: [String, Object, Array] as PropType<ClassName>,
      default: undefined
    },
    loadClass: {
      type: [String, Object, Array] as PropType<ClassName>,
      default: undefined
    },
    errorClass: {
      type: [String, Object, Array] as PropType<ClassName>,
      default: undefined
    },
    blurRadius: {
      type: [String, Number] as PropType<LikeNumber>,
      default: 10
    }
  },
  emits: ["load:start", "load:success", "load:error", "intersected"],

  setup(_props, { attrs, slots, emit }) {
    const loading = ref(true)
    const loaded = ref(false);
    const error = ref(false);

    const intersected = ref(false);

    const props = computed(() => _props)

    const payload = computed(() => ({
      loaded: loaded.value,
      error: error.value,
      loading: loading.value,
      intersected: intersected.value
    }))

    const heightAndWidth = {
      width: props.value.width ? `${parseFloat(String(props.value.width))}px` : undefined,
      height: props.value.height ? `${parseFloat(String(props.value.height))}px` : undefined,
    }

    const ariaLabel = {
      'aria-label': props.value.alt
    }

    const anchorImage = h(Intersection, {
      once: true,
      "onOnce-intersected": () => { intersected.value = true; emit("intersected") }
    }, {
      default: () => [
        h('a', {
          role: "img",
          ...ariaLabel,
          href: props.value.src,
          target: '_blank',
          rel: 'noopener noreferrer',
          style: {
            height: `${parseFloat(String(props.value.height || 1))}px`,
            width: `${parseFloat(String(props.value.width || 1))}px`,
            visibility: 'hidden',
            display: 'inline-block',
            pointerEvents: 'none'
          }
        }, [props.value.notIntersectingText || props.value.alt])
      ]
    })

    const wrapper = (node: any) => [
      slots?.prepend?.(payload.value),
      intersected.value ?
        node : anchorImage,
      slots?.append?.(payload.value),
    ].filter(Boolean)

    const loadEvents = {
      onLoad: (e: Event) => {
        emit("load:success")

        loaded.value = true
        loading.value = false
        error.value = false
      },
      onError: (e: Event) => {
        emit("load:error")

        error.value = true
        loading.value = false
        loaded.value = false
      }
    }

    const enterAnimation = computed(() => {
      if (props.value.loadEffect) {
        const { loadEffectDelay, loadEffectDuration, loadEffectEase, loadEffect } = props.value

        return {
          '--opacity': loadEffect === 'fade' ? (loading.value ? '0' : undefined) : undefined,
          '--filter': loadEffect === 'blur' ? (loading.value ? `blur(${Number(props.value.blurRadius)}px)` : undefined) : undefined,
          '--transition': `${loadEffect === 'fade' ? 'opacity' : 'filter'} ${convertToMilliSecond(loadEffectDuration)}ms ${loadEffectEase} ${convertToMilliSecond(loadEffectDelay)}ms`
        }
      }
      return {}
    })

    const loadClasses = computed(() => [
      loading.value ? props.value.loadingClass : null,
      loaded.value ? props.value.loadClass : null,
      error.value ? props.value.errorClass : null,
    ].filter(Boolean))

    return () => {
      if (props.value.backgroundImage) {
        return wrapper(h(props.value.tag, {
          ...attrs,
          class: ['Img', loadClasses.value],
          style: {
            role: 'img',
            ...ariaLabel,
            ...heightAndWidth,
            backgroundImage: `url(${props.value.src})`,
            ...enterAnimation.value
          },
        }, {
          default: () => [
            slots.default?.(payload.value),

            h("img", {
              ...loadEvents,
              src: props.value.src,
              alt: props.value.alt,
              style: srOnlyStyle,
              ...attrs
            })
          ]
        }))
      } return wrapper(
        h('img', {
          src: props.value.src,
          alt: props.value.alt,
          height: props.value.height,
          width: props.value.width,
          class: ['Img', loadClasses.value],
          style: {
            ...heightAndWidth,
            ...enterAnimation.value
          },
          ...loadEvents
        }))
    }
  }
})
</script>

<style scoped>
.Img {
  transition: var(--transition);
  opacity: var(--opacity);
  filter: var(--filter)
}
</style>