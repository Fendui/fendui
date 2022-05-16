import { mount } from "@vue/test-utils";
import { expect, it } from "vitest";

export function rendersOptionalRootTag(component: any) {
  const mountWrapper = (tag?: string) => {
    return mount(component, {
      props: { tag },
      slots: {
        default: ["<div id='slot1'> Foo </div>", "<div id='slot2'> Foo </div>"],
      },
    });
  };

  const slotsExist = (wrapper: any) => {
    expect(wrapper.find("#slot1").exists()).toBe(true);

    expect(wrapper.find("#slot2").exists()).toBe(true);
  };

  it("It renders root tag", () => {
    const wrapper = mountWrapper("section");

    expect(wrapper.html()).to.contain("<section");

    slotsExist(wrapper);
  });

  it("It renders no root tag", () => {
    slotsExist(mountWrapper());
  });
}

export function rendersMultipleRoot(Component: any) {
  it("Renders multiple root element", () => {
    const wrapper = mount(Component, {
      slots: {
        default: [
          "<div id='slot-1'> foo </div>",
          "<div id='slot-2'> foo </div>",
        ],
      },
    });

    expect(wrapper.find("#slot-1").exists()).toBe(true);
    expect(wrapper.find("#slot-2").exists()).toBe(true);
  });
}
