import React from 'react';

export const Slot = React.forwardRef(({ children, ...props }, ref) => {
  if (!React.isValidElement(children)) return null;
  return React.cloneElement(children, { ...props, ref });
});

Slot.displayName = 'Slot';

