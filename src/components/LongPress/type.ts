type EventCB = (evt: Event) => void;

export interface Events {
  onBlur?: EventCB;
  onClick?: EventCB;
  blur?: EventCB;
  click?: EventCB;
  start?: () => void;
  onStart?: () => void;
  onTouchmovePassive?: EventCB;
  onTouchcancel?: EventCB;
  onTouchend?: EventCB;
  onTouchstartPassive?: EventCB;
  touchstartPassive?: EventCB;
  onContextmenu?: EventCB;
  contextmenu?: EventCB;
  onMousemove?: EventCB;
  onMouseout?: EventCB;
  onMouseleave?: EventCB;
  onMousedown?: EventCB;
  mousedown?: EventCB;
  onMouseup?: EventCB;
}
