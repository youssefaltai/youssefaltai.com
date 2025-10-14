/**
 * useFormState Hook
 * Extract common form state management: error handling and submission logic
 */
import { useState } from 'react'

interface UseFormStateOptions<T> {
  onSubmit: (data: T) => Promise<void>
  onSuccess?: () => void
}

export function useFormState<T>({ onSubmit, onSuccess }: UseFormStateOptions<T>) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: T, defaultErrorMessage = 'Failed to save') => {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onSuccess?.()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : defaultErrorMessage)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    submitError,
    setSubmitError,
    handleSubmit,
    isSubmitting,
  }
}

