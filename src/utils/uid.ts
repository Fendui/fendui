let calls = 0;

/**
 * @name uid
 * @description
 * Returns a unique Id
 * @param { string } [prefix] - Prefix for the uid generated. Leave as an empty string for no prefix. Leaving undefined will default to 'uid-' as a prefix
 * @returns { string }
 * **/
export function uid(prefix?: string, suffix?: string): string {
  calls += 0.1;

  const _prefix = typeof prefix === "string" ? prefix : "uid-";

  return `${_prefix}${(performance.now() + calls).toString(36)}${
    suffix || ""
  }`.replace(/\./g, "_");
}
