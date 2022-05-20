interface item {
  active: boolean;
  item: any;
  attrs: {
    "onUpdate:modelValue": (val: boolean) => void;
    modelValue: boolean;
  };
}

export interface RadioGroupPayload {
  items: item[];
  isActive: (val: any) => boolean;
  reset: () => void;
  select: (val: any) => void;
}
