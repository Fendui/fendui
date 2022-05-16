import { describe, expect, it } from "vitest";
import { uid } from "./uid";

describe("uid utility", () => {
  it("Generates random string", () => {
    // array of 1000 uid
    const getUid = Array.from(
      {
        length: 1000,
      },
      () => uid()
    );

    const distinctUid = [...new Set(getUid)];

    expect(distinctUid.length === getUid.length).toBe(true);
  });
});
