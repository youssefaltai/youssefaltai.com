import { LoadingSkeleton } from '@repo/ui'

export default function Loading() {
  return <LoadingSkeleton title="Transactions" subtitle="View and manage your transactions" itemCount={3} itemHeight={24} />
}

