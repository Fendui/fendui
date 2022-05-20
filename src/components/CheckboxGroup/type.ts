interface item {
  active: boolean;
  item: any;
  attrs: {
    "onUpdate:modelValue": (val: boolean) => void;
    modelValue: boolean;
  };
}

export interface CheckboxGroupPayload {
  items: item[];
  isChecked: (val: any) => boolean;
  reset: () => void;
  select: (val: any) => void;
  selectAll: () => void;
  intermediate: boolean;
  allChecked: boolean;
}
