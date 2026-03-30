import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ShiftDataProvider } from '@/contexts/ShiftDataContext'

export const metadata: Metadata = {
  title: 'シフト管理ツール',
  description: 'AIを活用した医療機関向けシフト管理ツール',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        <AuthProvider>
          <ShiftDataProvider>
            {children}
          </ShiftDataProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
