import { describe, expect, it, test } from "vitest";
import { mount } from "@vue/test-utils";

import DelayedToggle from "./index.vue";
import { sleep } from "../../utils/sleep";
import { rendersOptionalRootTag } from "../../utils/test";

describe("DelayedToggle component", () => {
  rendersOptionalRootTag(DelayedToggle);

  describe("Toggles active state", () => {
    test("Toggles without v-model", async () => {
      const wrapper = mount(DelayedToggle, {
        slots: {
          default: `<template #default="{ active, toggle }">
                    <div id="slot" @click="toggle"> {{ active }} </div>
                  </template>`,
        },
      });

      const slotHTML = () => wrapper.get("#slot").html();

      expect(slotHTML()).to.contain("false");

      await wrapper.get("#slot").trigger("click");

      expect(slotHTML()).to.contain("true");
    });

    it("Wont toggle when disabled", async () => {
      const wrapper = mount(DelayedToggle, {
        slots: {
          default: `<template #default="{ active, toggle }">
                    <div id="slot" @click="toggle"> {{ active }} </div>
                  </template>`,
        },
      });

      await wrapper.setProps({ disabled: true });

      await wrapper.get("#slot").trigger("click");

      expect(wrapper.get("#slot").html()).not.to.contain("true");
    });

    describe("Delay prop", () => {
      test("Number or String syntax", async () => {
        const delay = 48;

        const wrapper = mount(DelayedToggle, {
          props: {
            delay: `${delay}ms`,
          },
          slots: {
            default: `<template #default="{ active, toggle }">
                    <div id="slot" @click="toggle"> {{ active }} </div>
                  </template>`,
          },
        });

        const slot = wrapper.get("#slot");

        await slot.trigger("click");

        expect(slot.html()).to.not.contain(true);

        await sleep(delay);

        expect(slot.html()).toContain(true);
      });

      describe("Object syntax", () => {
        test("On", async () => {
          const delay = 48;

          const wrapper = mount(DelayedToggle, {
            props: {
              delay: {
                on: delay,
              },
            },
            // mouseenter toggles on, click toggles off
            slots: {
              default: `<template #default="{ active, on, off }">
                    <div id="slot" @mouseenter="on" @click="off"> {{ active }} </div>
                  </template>`,
            },
          });

          const slot = wrapper.get("#slot");

          await slot.trigger("mouseenter");

          expect(slot.html()).to.not.contain(true);

          await sleep(delay);

          expect(slot.html()).toContain(true);

          await slot.trigger("click");

          expect(slot.html()).not.toContain(true);
        });

        test("Off", async () => {
          const delay = 48;

          const wrapper = mount(DelayedToggle, {
            props: {
              delay: {
                off: delay,
              },
            },
            // mouseenter toggles on, click toggles off
            slots: {
              default: `<template #default="{ active, on, off }">
                    <div id="slot" @mouseenter="on" @click="off"> {{ active }} </div>
                  </template>`,
            },
          });

          const slot = wrapper.get("#slot");

          await slot.trigger("mouseenter");

          expect(slot.html()).toContain(true);

          await slot.trigger("click");

          expect(slot.html()).to.not.contain(false);

          await sleep(delay);

          expect(slot.html()).toContain(false);
        });
      });
    });
  });
});
