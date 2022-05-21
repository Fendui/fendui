interface item {
  active: boolean;
  item: any;
}

export interface TabPayload {
  items: item[];
  isActive: (val: any) => boolean;
  reset: () => void;
  select: (val: any) => void;
}
