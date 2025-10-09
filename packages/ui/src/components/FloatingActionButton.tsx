'use client'

interface FloatingActionButtonProps {
  onClick: () => void
}

/**
 * iOS-style floating action button for quick actions
 */
export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 w-14 h-14 bg-ios-blue text-white rounded-full shadow-ios-lg hover:bg-ios-blue/90 active:scale-95 transition-all z-40 flex items-center justify-center"
      aria-label="Add transaction"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
      </svg>
    </button>
  )
}

