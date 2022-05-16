import { describe, expect, it, test } from "vitest";
import { mount } from "@vue/test-utils";

import Hover from "../../../components/Hover/index.vue";
import Focus from "../../../components/Focus/index.vue";
import { rendersMultipleRoot } from "../../test";

// @ts-ignore
global.matchMedia = () => {};

export default function testFocusAndHover(name: "Focus" | "Hover") {
  const activateEvent = `${name === "Focus" ? "focus" : "mouseenter"}`;
  const deactivateEvent = `${name === "Focus" ? "blur" : "mouseleave"}`;

  const Component = name === "Focus" ? Focus : Hover;

  // This component utilizes <DelayedToggle /> under the hood. No need to test for props like delay.
  describe(`${name} component`, () => {
    rendersMultipleRoot(Component);

    it(`Activates on ${activateEvent}`, async () => {
      const wrapper = mount(Component, {
        slots: {
          default: `<template #default="{ active }">
                    <div id="slot"> {{ active }} </div>
                  </template>`,
        },
      });

      const slot = wrapper.get("#slot");

      expect(slot.text()).toEqual("false");

      await slot.trigger(activateEvent);

      expect(slot.text()).toEqual("true");
    });

    it(`Listens for ${activateEvent} events of delegated elements`, async () => {
      const wrapper = mount(Component, {
        slots: {
          default: `<template #default="{ active, events }">
                    <div> {{ active }} </div>

                    <div id="slot" v-bind="events"> {{ active }} </div>
                  </template>`,
        },
      });

      const slot = wrapper.get("#slot");

      await slot.trigger(activateEvent);

      expect(slot.text()).toEqual("true");
    });

    it(`Deactivates on ${deactivateEvent}`, async () => {
      const wrapper = mount(Component, {
        slots: {
          default: `<template #default="{ active }">
                    <div id="slot"> {{ active }} </div>
                  </template>`,
        },
      });

      const slot = wrapper.get("#slot");

      await slot.trigger(activateEvent);

      expect(slot.text()).toEqual("true");

      await slot.trigger(deactivateEvent);

      expect(slot.text()).toEqual("false");
    });
  });
}
