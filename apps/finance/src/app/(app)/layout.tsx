import { AppBottomNav } from './components/AppBottomNav'

/**
 * Layout for authenticated app pages
 * Server component - keeps performance optimal
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <AppBottomNav />
    </div>
  )
}

