import { LoadingSkeleton } from '@repo/ui'

export default function Loading() {
  return <LoadingSkeleton title="Goals" subtitle="Track your financial goals" itemCount={3} itemHeight={32} />
}

