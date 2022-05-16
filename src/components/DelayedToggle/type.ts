import { Duration } from "../../types";

export type Delay =
  | Duration
  | number
  | {
      on?: Duration;
      off?: Duration;
      enter?: Duration;
      leave?: Duration;
    };

export interface DefaultSlotProps {
  active: boolean;
  on: () => void;
  off: () => void;
  toggle: () => void;
}
