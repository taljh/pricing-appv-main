import { AppShell } from "@/components/ui/app-shell"
import SmartPricingPage from "@/components/pricing/SmartPricingPage"

export default async function PricingPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* التسعير الذكي - المكون المعاد تصميمه */}
        <SmartPricingPage />
      </div>
    </AppShell>
  )
}
