import { mount } from "@vue/test-utils";
import { describe, expect, it, test } from "vitest";
import { sleep } from "../../utils/sleep";
import { rendersMultipleRoot } from "../../utils/test";
import LongPress from "./index.vue";

// @ts-ignore
global.matchMedia = () => {};

describe("Longpress component", () => {
  rendersMultipleRoot(LongPress);

  test("Press events activates long press", async () => {
    const wrapper = mount(LongPress, {
      props: {
        delay: 32,
      },
      slots: {
        default: `<template #default="{ active, willChange }">
                      <div id="slot"> 
                          will-change:{{ willChange }} active:{{active}}
                      </div>
                    </template>
                    `,
      },
    });

    await wrapper.get("#slot").trigger("mousedown");

    expect(wrapper.get("#slot").text()).toBe("will-change:true active:false");

    await sleep(64);

    expect(wrapper.get("#slot").text()).toBe("will-change:true active:true");
  });

  test("Cancel events deactivates long press", async () => {
    const events = ["mouseout", "click", "blur", "mouseleave"];

    for (const event of events) {
      const wrapper = mount(LongPress, {
        props: {
          delay: 32,
        },
        slots: {
          default: `<template #default="{ active, willChange }">
                      <div id="slot"> 
                          will-change:{{ willChange }} active:{{active}}
                      </div>
                    </template>
                    `,
        },
      });

      await wrapper.get("#slot").trigger("mousedown");

      expect(wrapper.get("#slot").text()).toBe("will-change:true active:false");

      await wrapper.get("#slot").trigger(event);

      const hasReset = () =>
        expect(wrapper.get("#slot").text()).toBe(
          "will-change:false active:false"
        );

      hasReset();

      await sleep(64);

      hasReset();
    }
  });
});
