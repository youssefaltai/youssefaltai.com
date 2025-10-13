import { LoadingSkeleton } from '@repo/ui'

export default function Loading() {
  return <LoadingSkeleton title="Budgets" subtitle="Track your spending limits" itemCount={3} itemHeight={40} />
}

