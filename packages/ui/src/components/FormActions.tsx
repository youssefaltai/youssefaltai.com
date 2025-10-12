'use client'

import { Button } from './Button'

interface FormActionsProps {
  onCancel: () => void
  isSubmitting?: boolean
  submitLabel?: string
  showDelete?: boolean
  onDelete?: () => void
  deleteLabel?: string
}

/**
 * Reusable form action buttons
 * Handles Cancel, Submit, and optional Delete
 */
export function FormActions({
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save',
  showDelete = false,
  onDelete,
  deleteLabel = 'Delete',
}: FormActionsProps) {
  return (
    <div className="space-y-3">
      {/* Primary Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>

      {/* Delete Action */}
      {showDelete && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={isSubmitting}
          className="w-full py-3 text-ios-red font-semibold hover:bg-ios-red/10 rounded-ios transition-colors disabled:opacity-40"
        >
          {deleteLabel}
        </button>
      )}
    </div>
  )
}

