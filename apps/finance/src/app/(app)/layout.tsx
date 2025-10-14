import { AppBottomNav } from '../../shared/components/AppBottomNav'

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
    <>
      <div>
        {children}
      </div>
      <AppBottomNav />
    </>
  )
}

