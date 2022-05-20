import { mount } from "@vue/test-utils";
import { describe, expect, it, test } from "vitest";
import { rendersOptionalRootTag } from "../../utils/test";
import Group from "./index.vue";

describe("Group component", () => {
  rendersOptionalRootTag(Group);

  it("Selects single value", async () => {
    const wrapper = mount(Group, {
      slots: {
        default: `<template #default="{ isActive, active, add, remove, toggle }">
                    <div id="view-port"> {{ active.length ? active : 'empty' }} </div>

                    <button v-for="i in 2" :key="i" :id="'btn-' + i" @click="toggle(i)" @mouseenter="add(i)" @mouseleave="remove(i)">
                      {{ isActive(i) }}
                    </button>
                  </template>
                  `,
      },
    });

    const viewPortText = () =>
      wrapper.get("#view-port").text().replace(/\s+/g, "");

    expect(viewPortText()).toContain("empty");

    // select btn-1
    const btn1 = wrapper.get("#btn-1");

    await btn1.trigger("mouseenter");

    expect(viewPortText()).toBe("[1]");

    // select btn-2
    const btn2 = wrapper.get("#btn-2");

    await btn2.trigger("mouseenter");

    expect(viewPortText()).toBe("[2]");

    // unselect btn-2
    await btn2.trigger("click");

    expect(viewPortText()).toBe("empty");
  });

  test("Disabled", async () => {
    const wrapper = mount(Group, {
      props: { disabled: true },
      slots: {
        default: `<template #default="{ isActive, active, add, remove, toggle }">
                    <div id="view-port"> {{ active.length ? active : 'empty' }} </div>

                    <button id="btn-1" @click="add(1)">
                      {{ isActive(1) }}
                    </button>
                  </template>
                  `,
      },
    });

    await wrapper.get("#btn-1").trigger("click");

    expect(wrapper.get("#view-port").text().replace(/\s+/g, "")).toBe("empty");
  });

  it("Selects multiple", async () => {
    const wrapper = mount(Group, {
      props: { multiple: true },
      slots: {
        default: `<template #default="{ isActive, active, add, remove, toggle }">
                    <div id="view-port"> {{ active.length ? active : 'empty' }} </div>

                    <button v-for="i in 2" :key="i" :id="'btn-' + i" @click="toggle(i)" @mouseenter="add(i)" @mouseleave="remove(i)">
                      {{ isActive(i) }}
                    </button>
                  </template>
                  `,
      },
    });

    const viewPortText = () =>
      wrapper.get("#view-port").text().replace(/\s+/g, "");

    // select btn-1
    const btn1 = wrapper.get("#btn-1");

    await btn1.trigger("mouseenter");

    // select btn-2
    const btn2 = wrapper.get("#btn-2");

    await btn2.trigger("mouseenter");

    expect(viewPortText()).toBe("[1,2]");

    // unselect btn-1
    await btn1.trigger("mouseleave");

    expect(viewPortText()).toBe("[2]");

    // unselect btn-2
    await btn2.trigger("click");

    expect(viewPortText()).toBe("empty");
  });

  test("Mandatory prop", async () => {
    const wrapper = mount(Group, {
      props: { multiple: true, mandatory: true },
      slots: {
        default: `<template #default="{ isActive, active, add, remove, toggle }">
                    <div id="view-port"> {{ active.length ? active : 'empty' }} </div>

                    <button v-for="i in 2" :key="i" :id="'btn-' + i" @click="toggle(i)" @mouseenter="add(i)" @mouseleave="remove(i)">
                      {{ isActive(i) }}
                    </button>
                  </template>
                  `,
      },
    });

    const viewPortText = () =>
      wrapper.get("#view-port").text().replace(/\s+/g, "");

    // select btn-1
    const btn1 = wrapper.get("#btn-1");

    await btn1.trigger("mouseenter");

    // select btn-2
    const btn2 = wrapper.get("#btn-2");

    await btn2.trigger("mouseenter");

    // unselect btn-1
    await btn1.trigger("mouseleave");

    // unselect btn-2
    await btn2.trigger("click");

    expect(viewPortText()).toBe("[2]");
  });

  test("Repeated prop", async () => {
    const wrapper = mount(Group, {
      props: { allowRepeated: true, multiple: true },
      slots: {
        default: `<template #default="{ isActive, active, add, remove, toggle }">
                    <div id="view-port"> {{ active.length ? active : 'empty' }} </div>

                    <button id="btn-1" @click="add(1)">
                      {{ isActive(1) }}
                    </button>
                  </template>
                  `,
      },
    });

    for (let i = 0; i < 3; i++) {
      await wrapper.get("#btn-1").trigger("click");
    }

    expect(wrapper.get("#view-port").text().replace(/\s+/g, "")).toBe(
      "[1,1,1]"
    );
  });

  test("Initial prop", async () => {
    const wrapper = mount(Group, {
      props: { initial: 99, multiple: true },
      slots: {
        default: `<template #default="{ isActive, active, add, remove, toggle }">
                    <div id="view-port"> {{ active.length ? active : 'empty' }} </div>

                    <button id="btn-1" @click="toggle(1)">
                      {{ isActive(1) }}
                    </button>
                  </template>
                  `,
      },
    });

    const viewPortText = () =>
      wrapper.get("#view-port").text().replace(/\s+/g, "");

    await wrapper.get("#btn-1").trigger("click");

    expect(viewPortText()).toBe("[99,1]");

    await wrapper.get("#btn-1").trigger("click");

    expect(viewPortText()).toBe("[99]");
  });

  //  TODO: Can select object
});
