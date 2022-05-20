import { Directive } from "vue";
import { LikeNumber } from "../../types";
import { sleep } from "../../utils/sleep";

export default {
  mounted: (
    el,
    {
      value,
    }: {
      value:
        | LikeNumber
        | boolean
        | {
            delay?: LikeNumber;
            preventScroll?: boolean;
          };
    }
  ) => {
    if (value === false) {
      return;
    }

    const getDelay = () => {
      const frame = (1 / 60) * 1000;

      if (typeof value === "boolean") {
        return 0;
      }

      if (typeof value === "object" && value?.delay) {
        return value.delay;
      }

      return Math.max(Number(value || 0) || frame, frame);
    };

    sleep(getDelay(), () => {
      el.focus();
    });
  },
} as Directive;
