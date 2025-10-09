import { Card } from './Card'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

/**
 * Modal wrapper component with backdrop and close button
 * Follows Apple HIG for modal presentations
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '2xl',
}: ModalProps) {
  if (!isOpen) return null

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <Card className={`${maxWidths[maxWidth]} w-full max-h-[90vh] overflow-y-auto`} padding="lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-ios-title-2 font-bold text-ios-label-primary">{title}</h2>
          <button
            onClick={onClose}
            className="text-ios-gray-1 hover:text-ios-label-primary p-2 -mr-2"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </Card>
    </div>
  )
}

