import React from "react"
import type { Metadata } from 'next'
import { Inter, Space_Mono } from 'next/font/google'
import { ConvexClientProvider } from "@/components/convex-client-provider"

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-space-mono' })

export const metadata: Metadata = {
  title: 'Knowledge Hub - Announcement Portal',
  description: 'Internal announcement and knowledge management portal',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceMono.variable} font-sans antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  )
}
