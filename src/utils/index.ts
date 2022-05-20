import { ComputedRef, h, Slots } from "vue";
import defaults from "../framework/defaults";

type OfType =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function"
  | "array";

/**
 * @name getType
 * @description
 * Returns type of parameter. Distinguishing arrays from objects
 * @returns {OfType}
 * **/
export function getType(x: any): OfType {
  if (Array.isArray(x)) {
    return "array";
  }

  return typeof x;
}

type MediaListenerArg = {
  media: MediaQueryList;
  callback: (e: MediaQueryListEvent) => void;
};

/**
 * @name mediaListener
 * @description
 * Setup media listeners and catches edge cases for older browser. Hello iPhone 8!
 * @param {MediaListenerArg} args
 * @returns {void}
 * **/
export const mediaListener = (args: MediaListenerArg): void => {
  const { media, callback } = args;
  try {
    media.addEventListener("change", callback);
  } catch (e: any) {
    if (/undefined is not a function/i.test(e.message)) {
      media?.addListener?.(callback);
    }
  }
};

/**
 * @name nextAnimFrame
 * @description
 * Returns a Promise that resolves on next frame. Works like vue's nextTick but with RAF.
 * @param {Function} [callback]
 * @returns {Promise<number>}
 * **/
export const nextAnimFrame = (callback?: Function): Promise<number> => {
  return new Promise((resolve) => {
    requestAnimationFrame((t) => {
      callback?.();
      resolve(t);
    });
  });
};

/**
 * @name distinctArray
 * @description
 * Returns a distinct array with no repeated value
 * @param {any[]} arr1 - First array
 * @param {any[]} arr2 - Second array
 * @param {boolean} reverse - Set true so arr2 can come first
 * @returns {any[]}
 * **/
export const distinctArray = (
  arr1: any[],
  arr2: any[],
  reverse?: boolean
): any[] =>
  reverse
    ? [...new Set([...[arr1].flat(2), ...arr2])]
    : [...new Set([...arr2, ...[arr1].flat(2)])];

/**
 * @name isIOS
 * @description
 * Returns true|false if client is an IOS device
 * @returns {boolean}
 * **/
export function isIOS(): boolean {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod",
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

/**
 * @name convertToMilliSeconds
 * @description
 * Converts seconds from '1000ms' to '1000' and from '1s' to 1000
 * @param {string|number} rawDuration - Formatted duration
 * @param {number} [fallback] - Fallback if rawDuration is invalid
 * @returns {number}
 * **/
export function convertToMilliSecond(
  rawDuration: string | number,
  fallback?: number
): number {
  const parsed = parseFloat(`${rawDuration}`);

  if (isNaN(parsed) || parsed === Infinity) {
    return fallback || 0;
  }

  if (typeof rawDuration === "number") {
    return rawDuration >= 0 ? rawDuration : 0;
  }

  if (typeof rawDuration === "string") {
    const isSeconds = /^\d+(?:\.\d+)?s$/.test(rawDuration);
    if (isSeconds) {
      const parsedOutput = parsed * 1000;

      return parsedOutput >= 0 ? parsedOutput : 0;
    }

    const isMilliSeconds = /^\d+(?:\.\d+)?(?:ms)?$/.test(rawDuration);
    if (isMilliSeconds) {
      return parsed >= 0 ? parsed : 0;
    }
  }

  return 0;
}

/**
 * @name isHTML
 * @description
 * Returns truthiness that a value is an instance of HTMLElement
 * @param {any} x
 * @returns {boolean}
 * **/
export const isHTML = (x: any): boolean => x instanceof HTMLElement;

/**
 * @name vibrate
 * @description
 * Triggers hardware vibrate for browsers that support
 * @param {number} [duration=1] - Vibrate duration
 * @returns {void}
 * **/
export function vibrate(duration: number = 1): void {
  // @ts-ignore
  typeof navigator.mozVibrate == "function"
    ? // @ts-ignore
      navigator.mozVibrate(duration)
    : navigator?.vibrate?.(duration);
}

/**
 * @name setCSSValue
 * @description Returns css value with var() if the argument starts with '--'
 * @param {string} arg
 * @returns {string}
 * **/
export const setCSSValue = (arg: string): string => {
  if (/^--\w+/i.test(arg)) {
    return `var(${arg})`;
  }
  return arg;
};

/***
 * @name componentName
 * @description
 * Adds user defined prefix and suffix to component names
 * @param {string} name
 * @returns {string}
 * */
export const componentName = (name: string): string =>
  `${defaults.componentPrefix}${name}${defaults.componentSuffix}`;

interface OptionalRootElementArg {
  tag: string | undefined;
  slots: Slots;
  attrs: Record<string, any>;
  payload: ComputedRef<any>;
}

/**
 * @name optionalRootElement
 * @description
 * Returns render function for components that renders an Element when tag prop is passed, and slot when nothing is passed
 * @param {OptionalRootElementArg} arg
 * **/
export const optionalRootElement = function (arg: OptionalRootElementArg) {
  const { tag, slots, attrs, payload } = arg;

  if (tag) {
    return h(
      tag,
      {
        ...attrs,
      },
      {
        default: () => [slots.default?.(payload.value)],
      }
    );
  }

  return slots.default?.(payload.value);
};

/**
 * @name isTouchDevice
 * @description
 * Returns true if client is a touch device
 * ***/
export function isTouchDevice() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * @name isStrictTouchDevice
 * @description
 * Returns true if client is a touch device that doesnt support external mouse
 * ***/
export function isStrictTouchDevice() {
  const media = window.matchMedia("(hover: none) and (pointer: coarse)");

  return isTouchDevice() && media.matches;
}

export const srOnlyStyle = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  "white-space": "nowrap",
  "border-width": "0",
};

/**
 * @name getHtml
 * @description
 * Returns html element
 * **/
export function getHtml() {
  return document.documentElement || document.querySelector("html");
}

type EventProperty = Record<string, Function>;
/**
 * @name removeEventPrefix
 * @description
 * Removes the 'on' prefix for events.
 * @param {EventProperty} events
 * @returns {EventProperty}
 * **/
export function removeEventPrefix(events: EventProperty): EventProperty {
  const _events: EventProperty = {};

  let key: keyof EventProperty;

  for (key in events) {
    const firstThreeChar = /^on[A-Z]/;

    if (firstThreeChar.test(key)) {
      const formattedKey = key.replace(firstThreeChar, (x) =>
        x[2].toLowerCase()
      );

      _events[formattedKey] = events[key];
    } else {
      _events[key] = events[key];
    }
  }

  return _events;
}

/**
 * @name addEventPrefix
 * @description
 * Adds the 'on' prefix for events.
 * @param {EventProperty} events
 * @returns {EventProperty}
 * **/
export function addEventPrefix(events: EventProperty): EventProperty {
  const _events: EventProperty = {};

  let key: keyof EventProperty;

  for (key in events) {
    const firstChar = /^[a-z]/;

    if (firstChar.test(key) && !/^on[A-Z]/.test(key)) {
      const formattedKey = `on${key[0].toUpperCase()}${key.slice(1)}`;

      _events[formattedKey] = events[key];
    } else {
      _events[key] = events[key];
    }
  }

  return _events;
}

/**
 * @name stepper
 * @description
 * Interporlates from, to, and ratio values to form a progress moving from the 'from' value to the 'to' value in respect to the ratio.
 * @param { number } from - Value to interpolate from
 * @param { number } to - Value to interpolate to
 * @param { number } ratio - Progress of interpolation. This should ultimately be a value between 0 and 1
 * @returns `number` Between 0 and 1
 * **/
export const stepper = (from: number, to: number, ratio: number): number =>
  (from - to) * ratio + to;
