let calls = 0;

/**
 * @name uid
 * @description
 * Returns a unique Id
 * @returns { string }
 * **/
export function uid(): string {
  calls += 0.1;

  return btoa(`${Date.now()}-${performance.now()}-${calls}`.replace(/=/g, "_"));
}
