import { BottomNav } from '../components/BottomNav'

/**
 * Layout for authenticated app pages
 * Includes bottom navigation
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="pb-16">{children}</div>
      <BottomNav />
    </>
  )
}

