import { describe, expect, it, test } from "vitest";
import { mount } from "@vue/test-utils";

import Toggle from "./index.vue";
import { rendersOptionalRootTag } from "../../utils/test";

describe("Toggle component", () => {
  rendersOptionalRootTag(Toggle);

  describe("Toggles active state", () => {
    test("Toggles without v-model", async () => {
      const wrapper = mount(Toggle, {
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
      const wrapper = mount(Toggle, {
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
  });
});
