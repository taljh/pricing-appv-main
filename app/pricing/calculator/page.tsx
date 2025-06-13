import { Suspense } from "react"
import { AppShell } from "@/components/ui/app-shell"
import CalculatorClient from "@/components/pricing/calculator/CalculatorClient"
import Loading from "./loading"

export const dynamic = "force-dynamic"

export default function PricingCalculatorPage() {
  return (
    <AppShell>
      <div className="container mx-auto py-4 px-3 sm:py-6 sm:px-4">
        <Suspense fallback={<Loading />}>
          <CalculatorClient />
        </Suspense>
      </div>
    </AppShell>
  )
}
