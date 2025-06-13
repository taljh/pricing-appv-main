"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";

// تعريف نوع سياق RTL
interface RTLContextType {
  isRTL: boolean;
  setRTL: (rtl: boolean) => void;
  flipIcon: (element: ReactNode) => ReactNode;
  textDirection: "rtl" | "ltr";
  contentDirection: "right" | "left";
}

// إنشاء سياق RTL مع قيم افتراضية
const RTLContext = createContext<RTLContextType>({
  isRTL: true, // تعيين القيمة الافتراضية لـ RTL كـ true للغة العربية
  setRTL: () => {},
  flipIcon: (element) => element,
  textDirection: "rtl",
  contentDirection: "right",
});

// مزود السياق
interface RTLProviderProps {
  children: ReactNode;
}

export function RTLProvider({ children }: RTLProviderProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isRTL, setIsRTL] = useState<boolean>(true); // القيمة الافتراضية هي true للغة العربية

  // Solo ejecutar después del montaje en el cliente para evitar errores de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // تأثير جانبي لتعيين اتجاه الـ html عند تغيير قيمة isRTL
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = isRTL ? "ar" : "en";

    // إضافة class للـ body لتطبيق الـ RTL على مستوى التصميم
    if (isRTL) {
      document.body.classList.add("rtl");
      document.body.classList.remove("ltr");
    } else {
      document.body.classList.add("ltr");
      document.body.classList.remove("rtl");
    }
  }, [isRTL]);

  // Helper function to flip icons for correct RTL display
  const flipIcon = (element: ReactNode): ReactNode => {
    if (!React.isValidElement(element)) return element;

    const typedElement = element as React.ReactElement<{
      className?: string;
      style?: React.CSSProperties;
      [key: string]: any;
    }>;

    return React.cloneElement(typedElement, {
      ...typedElement.props,
      className: `${typedElement.props.className || ""} ${isRTL ? "rtl-flip" : ""}`.trim(),
      style: {
        ...typedElement.props.style,
        transform: isRTL ? "scaleX(-1)" : undefined,
      },
    });
  };

  const value = {
    isRTL,
    setRTL: setIsRTL,
    flipIcon,
    textDirection: isRTL ? "rtl" : "ltr",
    contentDirection: isRTL ? "right" : "left",
  };

  // Usar el valor inicial durante SSR para evitar discrepancias de hidratación
  return <RTLContext.Provider value={value}>{children}</RTLContext.Provider>;
}

// Hook لاستخدام سياق RTL
export const useRTL = () => {
  const context = useContext(RTLContext);
  if (context === undefined) {
    throw new Error("useRTL must be used within an RTLProvider");
  }
  return context;
};
