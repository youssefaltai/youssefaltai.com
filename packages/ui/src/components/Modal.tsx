'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@repo/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  showCloseButton?: boolean
}

/**
 * iOS-style modal component
 * Follows Apple Human Interface Guidelines for sheets
 * Features:
 * - Smooth slide-up animation
 * - Rounded corners at the top
 * - Drag indicator
 * - Semi-transparent backdrop
 * - Smooth exit animation
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(isOpen)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      // Use requestAnimationFrame to ensure DOM is ready before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      })
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      setIsAnimating(false)
      // Wait for animation to finish before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false)
        document.body.style.overflow = 'unset'
      }, 300) // Match animation duration
      return () => clearTimeout(timer)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!shouldRender) return null

  const sizeClasses = {
    sm: 'max-h-[40vh]',
    md: 'max-h-[60vh]',
    lg: 'max-h-[80vh]',
    full: 'h-full rounded-t-none',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black transition-opacity duration-300',
          isAnimating ? 'opacity-40' : 'opacity-0'
        )}
      />

      {/* Modal Sheet */}
      <div
        className={cn(
          'relative w-full bg-white rounded-t-[20px] shadow-ios-lg transition-transform duration-300 ease-out',
          sizeClasses[size],
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Indicator */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-ios-gray-4 rounded-full" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-ios-gray-5">
            <h2 className="text-ios-headline font-semibold text-ios-label-primary">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-ios-gray-6 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-ios-gray-1" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(100% - 80px)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

