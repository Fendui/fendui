import { LikeNumber } from "../../types";

export interface OverlayPayload {
  toggle: () => void;
  open: () => void;
  close: () => void;
  active: boolean;
  id: string;
  zIndex: LikeNumber | undefined;
  transitionEvents: Record<string, Function>;
  delayedActive: boolean;
  contentAttrs: Record<string, any>;
  afterEnter: boolean;
  afterLeave: boolean;
}
