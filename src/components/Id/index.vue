<script lang="ts">
import { computed } from "@vue/reactivity";
import { defineComponent, ref } from "vue";
import { componentName } from "../../utils";
import { uid } from "../../utils/uid";

export default defineComponent({
  name: componentName("Id"),
  props: {
    prefix: {
      type: String,
      default: 'uid-'
    },
    suffix: {
      type: String,
      default: ''
    },
  },
  emits: ["on-refresh"],
  setup(_props, { emit, slots, expose }) {
    const props = computed(() => _props);

    const freshId = () => uid(props.value.prefix, props.value.suffix)

    const id = ref(freshId())

    const refresh = () => id.value = freshId();

    const payload = computed(() => ({ refresh, id: id.value }))

    expose(payload.value)

    return () => slots?.default?.(payload.value)
  }
})
</script>