"use client";

import { useState, useEffect } from "react";
import { useRTL } from "@/lib/rtl-context";

// تحديد نقاط الإنكسار للتصميم المتجاوب
export const breakpoints = {
  xs: 480,  // هواتف صغيرة
  sm: 640,  // هواتف
  md: 768,  // أجهزة لوحية صغيرة
  lg: 1024, // أجهزة لوحية / حواسب صغيرة
  xl: 1280, // شاشات حاسب
  xxl: 1536 // شاشات حاسب كبيرة
};

// معلومات حول الشاشة والجهاز للاستخدام في التصميم المتجاوب
export interface ScreenInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isRTL: boolean;
  screenWidth: number | null;
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | null;
}

/**
 * هوك (Hook) للحصول على معلومات الشاشة الحالية والتحقق مما إذا كان الجهاز محمولًا
 * يدعم اللغة العربية بشكل كامل ويوفر معلومات إضافية للتصميم المتجاوب
 */
export function useScreenInfo(): ScreenInfo {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isRTL: true,
    screenWidth: null,
    breakpoint: null
  });
  
  // استيراد حالة RTL من سياق التطبيق
  const { isRTL } = useRTL();
  
  useEffect(() => {
    // تحديد نقطة الإنكسار الحالية
    const getBreakpoint = (width: number) => {
      if (width < breakpoints.xs) return 'xs';
      if (width < breakpoints.sm) return 'sm';
      if (width < breakpoints.md) return 'md';
      if (width < breakpoints.lg) return 'lg';
      if (width < breakpoints.xl) return 'xl';
      return 'xxl';
    };

    const updateScreenInfo = () => {
      const width = window.innerWidth;
      setScreenInfo({
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg,
        isRTL,
        screenWidth: width,
        breakpoint: getBreakpoint(width)
      });
    };

    // تحديث عند التحميل وعند تغيير حجم النافذة
    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    
    // تنظيف المستمع عند إزالة المكون
    return () => window.removeEventListener('resize', updateScreenInfo);
  }, [isRTL]);

  return screenInfo;
}

/**
 * هوك مبسط للتحقق فقط مما إذا كان الجهاز محمولًا
 * للحفاظ على التوافق مع الشيفرة القديمة
 */
export function useIsMobile(): boolean {
  const { isMobile } = useScreenInfo();
  return isMobile;
}
