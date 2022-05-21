import { Duration } from "../types";

/**
 * @name sleep
 * @description
 * Returns a promise based setTimeout. Like Vue's nextTick, but with setTimeout
 * @param { number } [duration=0] - How long for the timeout
 * @param { (()=>void) } [callback] - An optional function. Passing a function here, the function will be executed after the duration has passed. This will terminate the use of .then
 * @returns { Promise<number> }
 * **/
export async function sleep(
  _duration?: Duration | (() => void),
  _callback?: () => void
): Promise<number> {
  const duration = (
    typeof _duration === "function"
      ? 0
      : (_duration as Duration) >= 0
      ? _duration
      : 0
  ) as number;

  const callback = typeof _duration === "function" ? _duration : _callback;

  if (duration === Infinity) {
    return Promise.reject("Duration must be less than Infinity");
  }

  if (typeof callback === "function") {
    const timeout = setTimeout(() => {
      callback();

      clearTimeout(timeout);
    }, duration);

    return Promise.resolve(timeout);
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(timeout);

      clearTimeout(timeout);
    }, duration);
  });
}

/**
 * @name cancelSleep
 * @description
 * Cancels sleep above. Calling sleep to be canceled must include a function. let wait = sleep(1000, () => { ... });
 * @param { number } [id=0] - id of the sleep. See description
 * **/
export async function cancelSleep(id: number) {
  clearTimeout(id);
}
