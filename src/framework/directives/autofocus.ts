import { Directive } from "vue";
import { LikeNumber } from "../../types";
import { sleep } from "../../utils/sleep";

export default {
  mounted: (el, { value }: { value: LikeNumber }) => {
    const frame = (1 / 60) * 1000;

    const delay = Math.max(Number(value) || frame, frame);

    sleep(delay, () => {
      el.focus();
    });
  },
} as Directive;
