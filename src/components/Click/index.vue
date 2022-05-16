<script lang="ts">
import { computed, reactive } from "@vue/reactivity";
import { defineComponent, h, capitalize } from "@vue/runtime-core";
import { componentName, isStrictTouchDevice, isTouchDevice } from "../../utils";
import eventKey from "../../utils/eventkey";
import type { GetEvents } from './type'

const emptyXY = {
  x: 0,
  y: 0,
}

export default defineComponent({
  name: componentName("Click"),
  props: {
    range: {
      type: Number,
      default: 0
    },
    addWillChangeClass: Boolean,
    self: Boolean,
    activeClass: {
      type: String,
      default: undefined
    },
    manualEventElement: Boolean
  },
  emits: ["click:within-range"],
  setup(_props, { emit, slots }) {
    const props = computed(() => _props);

    const data = reactive({
      willChange: false,
      active: false,
      clientX: null,
      clientY: null,
      key: null,
      withinRange: false,
      clientRect: undefined,
      outOfRange: [],
    } as {
      willChange: boolean;
      active: boolean;
      clientX: null | number
      clientY: null | number;
      key: null | string | number;
      withinRange: boolean;
      clientRect: undefined | DOMRectList
      outOfRange: any[]
    });

    const triggerSelf = (e: Event) => {
      const stopPropagation = () => {
        if (props.value.self && (e.target as HTMLElement)?.isSameNode?.(e.currentTarget as HTMLElement)) {
          e.stopPropagation();
        }
      };
      if (/^key/.test(e.type)) {
        const key = eventKey(e as KeyboardEvent);

        key != "tab" && stopPropagation();
      } else {
        stopPropagation();
      }
    };

    const movePosition = reactive({
      clientRect: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        ...emptyXY
      },
      initial: emptyXY,
      current: emptyXY,
      reset() {
        this.initial = emptyXY;
        this.current = this.initial;
      },
      set(arg: { path: 'initial' | 'current', value: { x: number, y: number } }) {
        const { path, value } = arg;

        if (typeof value == "object") {
          if (path == "initial") {
            if (!this.initial.x && !this.initial.y) {
              this.initial = value;
            }
          } else {
            this[path] = value;
          }
        }
      },
    });

    const setClient = (e: TouchEvent | MouseEvent) => {
      const { clientX, clientY } = /^touch/.test(e.type)
        ? (e as TouchEvent).touches?.[0] || {}
        : e as MouseEvent;

      data.clientX = clientX;
      data.clientY = clientY;

      data.key = null;
    };

    const getRange = computed(() => {
      if (typeof props.value.range === 'number') {
        const parsedRange = props.value.range;

        return {
          x: parsedRange,
          y: parsedRange,
        };
      }
      return emptyXY;
    });

    const hasRange = computed(() => getRange.value.x || getRange.value.y);

    const toggleWithinRange = (value: boolean) => (hasRange ? value : false);

    const updateClick = async (arg: { active: boolean, clientRect?: boolean, e?: Event }) => {

      const { e, active, clientRect } = arg;

      const evt = (e || {}) as Event;

      if (active) {
        data.willChange = true;

        data.withinRange = toggleWithinRange(true);

        // await nextTick();
      } else {
        if (data.withinRange && /move/.test(evt.type)) {
          (evt.currentTarget as HTMLElement)?.click();
          emit("click:within-range", e);
        }

        data.willChange = false;
        data.clientY = null;
        data.clientX = null;
        data.key = null;
        data.withinRange = toggleWithinRange(false);
        movePosition.reset();
        clientRect &&
          (movePosition.clientRect = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            ...emptyXY
          });

        if (hasRange) {
          data.outOfRange = []
        }
      }

      data.active = active;
    };

    const onStart = (e: TouchEvent | MouseEvent) => {
      if (data.active) {
        return;
      }

      triggerSelf(e);

      setClient(e);

      updateClick({
        active: true,
      });

      if (hasRange) {
        const { top, bottom, right, left, x, y } =
          (e.currentTarget as HTMLElement).getBoundingClientRect();

        movePosition.clientRect = {
          top,
          right,
          bottom,
          left,
          x,
          y,
        };
      }
    }

    const onMove = (e: MouseEvent | TouchEvent) => {
      const touchEvent = e.type.startsWith('touch')

      if (!hasRange) {
        data.active &&
          updateClick({
            active: false,
            e,
          })
      }
      else {
        const positions = {
          x: touchEvent ? (e as TouchEvent).targetTouches[0].clientX : (e as MouseEvent).clientX,
          y: touchEvent ? (e as TouchEvent).targetTouches[0].clientY : (e as MouseEvent).clientY,
        };

        movePosition.set({
          path: "initial",
          value: positions,
        });

        movePosition.set({
          path: "current",
          value: positions,
        });

        const activeArea = {
          top: false,
          right: false,
          bottom: false,
          left: false,
        };

        activeArea.top =
          movePosition.clientRect.top - getRange.value.y <
          movePosition.current.y;

        activeArea.right =
          movePosition.clientRect.right + getRange.value.x >
          movePosition.current.x;

        activeArea.bottom =
          movePosition.clientRect.bottom + getRange.value.y >
          movePosition.current.y;

        activeArea.left =
          movePosition.clientRect.left - getRange.value.x <
          movePosition.current.x;

        let withinRange = true;

        for (let entry of Object.entries(activeArea)) {
          const key = entry[0];
          const value = entry[1];

          if (!value) {
            data.outOfRange.push(key);
            withinRange = false;
          }
        }

        data.withinRange = withinRange;

        data.active = withinRange;
      }
    }

    const getEvents = (prefix?: boolean) => {
      const touchEvents: GetEvents = {
        start: onStart,
        touchmovePassive: onMove,
        touchcancel: (e: TouchEvent) => {
          updateClick({
            active: false,
            e,
          });
        },
        touchend: (e: TouchEvent) => {
          updateClick({
            active: false,
            e,
          });
        },
      };

      touchEvents.touchstartPassive = touchEvents.start;

      delete touchEvents.start;

      const mouseEvents: GetEvents = {
        start: onStart,
        mousemovePassive: onMove,
        mouseup: (e: Event) => {
          updateClick({
            active: false,
            e
          });
        },
        mouseleave: (e: Event) => {
          updateClick({
            active: false,
            e
          });

        },
        mouseout: (e: Event) => {
          updateClick({
            active: false,
            e
          });
        },
      };

      mouseEvents.mousedown = mouseEvents.start;

      delete mouseEvents.start;

      const keyEvents: GetEvents = {
        start: (e: KeyboardEvent) => {
          const key = eventKey(e);

          if (/^space$|^enter$/i.test(key)) {
            triggerSelf(e);

            e.preventDefault();

            data.clientX = null;
            data.clientY = null;
            data.key = key;

            updateClick({
              active: true,
            });
          }
        },

        keyup: (e: KeyboardEvent) => {
          const key = eventKey(e);

          if (/space|^enter$/i.test(key)) {
            e.preventDefault();

            (e.currentTarget as HTMLElement)?.click?.();

            updateClick({
              active: false,
            });
          }
        },
      };

      keyEvents.keydown = keyEvents.start;

      delete keyEvents.start;

      const extractEvents = () => {
        let events = {
          onBlur: () => {
            updateClick({
              active: false,
            });
          },

          onClick: () => {
            updateClick({
              active: false,
            });
          },
          ...keyEvents,
        };

        if (isTouchDevice()) {
          events = { ...events, ...touchEvents };
        }

        if (!isStrictTouchDevice()) {
          events = { ...events, ...mouseEvents };
        }

        if (data.active) {
          return events;
        }

        return {
          ...(isTouchDevice() ? {
            touchstartPassive: touchEvents.touchstartPassive
          } : {}),
          ...(!isStrictTouchDevice() ? {
            mousedown: mouseEvents.mousedown,
            mouseup: mouseEvents.mouseup
          } : {})
        }

      };

      let output = extractEvents();

      if (prefix && !props.value.manualEventElement) {
        const _output = output;

        // @ts-ignore
        output = {}

        // @ts-ignore
        for (const key in _output) {
          Object.assign(output, {
            // @ts-ignore
            [`on${capitalize(key)}`]: _output[key]
          })
        }
      }

      return output
    };

    const payload = computed(() => ({ ...data, }));

    return () => {
      const scopedSlots = slots?.default?.(payload.value)

      return h(scopedSlots?.[0] || "slot", {
        ...getEvents(true),
        class:
          props.value.addWillChangeClass || props.value.activeClass
            ? [
              data.active ? props.value.activeClass : "",
              data.willChange ? "will-change-transform" : "",
            ]
            : [],
      });
    };
  },
});
</script>
