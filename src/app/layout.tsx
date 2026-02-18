import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CurryDash Central Hub',
  description: 'Role-based project management portal for the CurryDash team',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
