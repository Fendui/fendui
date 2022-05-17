export interface Config {
  threshold?: number | number[];
  rootMargin?: string;
  root?: HTMLElement | null;
}

export interface IntersectionEntry {
  inactive?: boolean;
  boundingClientRect: DOMRectReadOnly | undefined;
  intersectionRect: DOMRectReadOnly | undefined;
  target: Element | undefined;
  intersectionRatio: number;
  ratio: number;
  isIntersecting: boolean;
  rootBounds: DOMRectReadOnly | null;
  time: number;
}
