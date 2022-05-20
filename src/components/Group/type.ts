export interface GroupPayload {
  add: (val: any) => void;
  remove: (val: any) => void;
  toggle: (val: any) => void;
  clear: (id: any) => void;
  clearAll: () => void;
  isActive: (val: any) => boolean;
  active: any[];
}
