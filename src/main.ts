import { createApp } from "vue";
import App from "./App.vue";
import state from "./framework/state";
import { cancelSleep, sleep } from "./utils/sleep";
import uiTransition from "ui-transition";
import { InstallOptions } from "ui-transition/dist/src/types";
import "../assets/utilities.css";

let timeout = 0;

window.addEventListener(
  "resize",
  () => {
    if (timeout) {
      cancelSleep(timeout);
    }

    sleep(32, () => {
      state.value.resizeKey += 0.01;

      timeout = 0;
    }).then((id) => {
      timeout = id;
    });
  },
  {
    passive: true,
  }
);

const app = createApp(App);

app.use(uiTransition, {
  props: {
    appear: false,
    spring: "default",
  },
  transitions: {
    scale: (from = 0, to = 1) => ({
      frame: (step, phase) => {
        const build = {
          enter: {
            transform: `scale3d(${step(from, to)}, ${step(from, to)}, 1)`,
          },

          leave: {
            transform: `scale3d(${step(to, from)}, ${step(to, from)}, 1)`,
          },
        };

        return build[phase];
      },
    }),

    height: (from = 0, to = 0, unit = "px") => ({
      frame: (step, phase) => {
        const build = {
          enter: {
            height: `${step(from, to)}${unit}`,
            willChange: "contents",
          },

          leave: {
            height: `${step(to, from)}${unit}`,
            willChange: "contents",
          },
        };

        return build[phase];
      },
    }),

    rotateX: (from: number = 0, to: number = 180) => {
      return {
        frame: (step, phase) => {
          const build = {
            enter: {
              transform: `rotateX(${step(from, to)}deg)`,
            },
            leave: {
              transform: `rotateX(${step(to, from)}deg)`,
            },
          };

          return build[phase];
        },
      };
    },

    slideY: (from = 100, to = 0, unit = "%") => ({
      frame: (step, phase) => {
        const build = {
          enter: {
            transform: `translate3d(0, ${step(from, to)}${unit}, 0)`,
            willChange: "transform",
          },

          leave: {
            transform: `translate3d(0, ${step(to, from)}${unit}, 0)`,
            willChange: "transform",
          },
        };

        return build[phase];
      },
    }),

    drawer: (phase: "enter" | "leave" = "enter") => ({
      frame: (step) => {
        const build = {
          enter: {
            transform: `translate3d(0, calc(${step(100, 0)}% - ${step(
              96,
              -16
            )}px), 0)`,
          },
          leave: {
            transform: `translate3d(0, calc(${step(0, 100)}% - ${step(
              -16,
              96
            )}px), 0)`,
          },
        };

        return build[phase];
      },
    }),

    slideX: (from = 100, to = 0, unit = "%", previous = "") => ({
      frame: (step, phase) => {
        const build = {
          enter: {
            transform: `${previous ? `${previous}` : ""}translate3d(${step(
              from,
              to
            )}${unit}, 0, 0)`,
          },

          leave: {
            transform: `${previous ? `${previous}` : ""}translate3d(${step(
              to,
              from
            )}${unit}, 0, 0)`,
          },
        };

        return build[phase];
      },
    }),
  },
} as InstallOptions);

app.mount("#app");
