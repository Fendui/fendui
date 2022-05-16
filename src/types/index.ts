export type Duration = `${number}${"ms" | "s" | ""}` | number;

export type LikeNumber = `${number}` | number;

type ObjectClassName = Record<string, boolean>;

export type ClassName =
  | string
  | ObjectClassName
  | string[]
  | ObjectClassName[]
  | (string | ObjectClassName)[];
