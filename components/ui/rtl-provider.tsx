'use client';

import React, { createContext, useContext, ReactNode, isValidElement, ReactElement } from "react";
import { usePathname } from "next/navigation";

type RTLContextType = {
  isRTL: boolean;
  textDirection: "rtl" | "ltr";
  contentDirection: "right" | "left";
  flipIcon: (element: ReactNode) => ReactNode;
};

const RTLContext = createContext<RTLContextType>({
  isRTL: true,
  textDirection: "rtl",
  contentDirection: "right",
  flipIcon: (element) => element,
});

export const useRTL = () => useContext(RTLContext);

export interface RTLProviderProps {
  children: ReactNode;
  forceLTR?: boolean;
}

interface StyledElement extends ReactElement {
  props: {
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  };
}

export function RTLProvider({ children, forceLTR = false }: RTLProviderProps) {
  const pathname = usePathname();

  // Always default to RTL for this Arabic application
  const isRTL = !forceLTR;

  // Helper function to flip icons for correct RTL display
  const flipIcon = (element: ReactNode): ReactNode => {
    if (!isValidElement(element)) return element;

    const typedElement = element as StyledElement;

    return React.cloneElement(typedElement, {
      ...typedElement.props,
      className: `${typedElement.props.className || ""} ${isRTL ? "rtl-flip" : ""}`.trim(),
      style: {
        ...typedElement.props.style,
        transform: isRTL ? "scaleX(-1)" : undefined,
      },
    });
  };

  const value: RTLContextType = {
    isRTL,
    textDirection: isRTL ? "rtl" : "ltr",
    contentDirection: isRTL ? "right" : "left",
    flipIcon,
  };

  return (
    <RTLContext.Provider value={value}>
      {children}
    </RTLContext.Provider>
  );
}
