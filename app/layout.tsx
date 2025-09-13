import type { Metadata } from 'next'
import { Providers } from './providers'
import '../public/styles.css'

export const metadata: Metadata = {
  title: 'Stealth Co-Founder Challenge',
  description: 'Next.js + wagmi + viem app for blockchain data analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
