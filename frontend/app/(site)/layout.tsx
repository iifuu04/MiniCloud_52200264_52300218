import type { ReactNode } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function SiteLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
