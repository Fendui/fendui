import { describe, expect, test } from "vitest";
import { convertToMilliSecond } from ".";

describe("/utils", () => {
  describe("convertToMillisecond", () => {
    test("It converts finite string with 'ms' or 's' suffix only to milliseconds", () => {
      expect(convertToMilliSecond("1s")).toEqual(1000);

      expect(convertToMilliSecond("1000ms")).toEqual(1000);

      expect(convertToMilliSecond("1000")).toEqual(1000);

      expect(convertToMilliSecond("1.2s")).toEqual(1200);

      expect(convertToMilliSecond("foo")).toEqual(0);
    });
  });
});
