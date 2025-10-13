import { LoadingSkeleton } from '@repo/ui'

export default function Loading() {
  return <LoadingSkeleton title="Expense Categories" subtitle="Manage your spending categories" itemCount={3} />
}

