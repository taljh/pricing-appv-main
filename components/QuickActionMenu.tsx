"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calculator, Package, PieChart } from "lucide-react"
import { SpeedDial, SpeedDialButton, SpeedDialList, SpeedDialTrigger } from "@/components/ui/speed-dial"
import { cn } from "@/lib/utils"

export function QuickActionMenu() {
  const pathname = usePathname()
  
  // Don't show on pricing calculator or products pages
  if (pathname.includes("/pricing/calculator") || pathname === "/products") {
    return null
  }

  return (
    <SpeedDial position="bottom-center">
      <SpeedDialTrigger 
        variant="info" 
        icon={<PieChart className="h-6 w-6" />}
        aria-label="التسعير السريع"
      />
      <SpeedDialList>
        <Link href="/pricing/calculator">
          <SpeedDialButton 
            variant="success" 
            icon={<Calculator className="h-5 w-5" />} 
            label="حاسبة التسعير"
            aria-label="حاسبة التسعير"
          />
        </Link>
        <Link href="/products">
          <SpeedDialButton 
            variant="info" 
            icon={<Package className="h-5 w-5" />} 
            label="المنتجات"
            aria-label="المنتجات"
          />
        </Link>
      </SpeedDialList>
    </SpeedDial>
  )
}
