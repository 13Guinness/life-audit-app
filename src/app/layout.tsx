import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/Providers"
import { Nav } from "@/components/Nav"

export const metadata: Metadata = {
  icons: { icon: "/favicon.svg" },
  title: "LifeAudit AI",
  description: "Discover Every Way AI Can Save You Time",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0f172a] text-white antialiased">
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  )
}
