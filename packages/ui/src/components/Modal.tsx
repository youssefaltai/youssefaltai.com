'use client'

import { useEffect, useState, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@repo/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'auto' | 'sm' | 'md' | 'lg' | 'full'
  variant?: 'sheet' | 'alert' | 'action-sheet'
  showCloseButton?: boolean
  enableSwipeToDismiss?: boolean
  enableBackdropBlur?: boolean
}

/**
 * iOS-style modal component
 * Follows Apple Human Interface Guidelines for sheets
 * 
 * Features:
 * - Smooth slide-up animation with spring easing
 * - Rounded corners at the top
 * - Drag indicator
 * - Semi-transparent backdrop with optional blur
 * - Smooth exit animation
 * - Swipe-to-dismiss gesture
 * - Keyboard support (Escape to close)
 * - Focus trap for accessibility
 * - Haptic feedback on mobile
 * - Prevent overscroll
 * - Multiple variants (sheet, alert, action-sheet)
 * - Custom footer support
 * - Dynamic height sizing
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  variant = 'sheet',
  showCloseButton = true,
  enableSwipeToDismiss = true,
  enableBackdropBlur = true,
}: ModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Trigger haptic feedback (mobile only)
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  // Focus trap setup
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Store the element that triggered the modal
      triggerRef.current = document.activeElement as HTMLElement

      // Focus first focusable element
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      if (firstElement) {
        setTimeout(() => firstElement.focus(), 100)
      }

      // Trap focus inside modal
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return

        const focusable = Array.from(focusableElements) as HTMLElement[]
        if (focusable.length === 0) return
        
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }

      document.addEventListener('keydown', handleTab)
      return () => document.removeEventListener('keydown', handleTab)
    }
  }, [isOpen])

  // Keyboard support (Escape to close)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        triggerHaptic()
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Animation and body scroll lock
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      triggerHaptic()
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
      triggerHaptic()
      // Wait for animation to finish before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false)
        document.body.style.overflow = 'unset'
        // Return focus to trigger element
        if (triggerRef.current) {
          triggerRef.current.focus()
        }
      }, 300) // Match animation duration
      return () => clearTimeout(timer)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Swipe to dismiss handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipeToDismiss) return
    const touch = e.touches[0]
    if (touch) {
      startY.current = touch.clientY
      setIsDragging(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableSwipeToDismiss || !isDragging) return
    
    const touch = e.touches[0]
    if (!touch) return
    
    const currentY = touch.clientY
    const deltaY = currentY - startY.current
    
    // Only allow dragging down
    if (deltaY > 0) {
      // Check if content is scrolled to top
      const content = contentRef.current
      if (content && content.scrollTop <= 1) {
        setDragY(deltaY)
      }
    }
  }

  const handleTouchEnd = () => {
    if (!enableSwipeToDismiss) return
    
    setIsDragging(false)
    // If dragged more than 100px, close the modal
    if (dragY > 100) {
      triggerHaptic()
      onClose()
    }
    setDragY(0)
  }

  // Handle native touch events with non-passive listener
  useEffect(() => {
    if (!enableSwipeToDismiss || !shouldRender) return

    const modal = modalRef.current
    if (!modal) return

    let touchStartY = 0

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (touch) {
        touchStartY = touch.clientY
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return

      const deltaY = touch.clientY - touchStartY
      
      // Only prevent default when dragging down from scrolled-to-top position
      if (deltaY > 0) {
        const content = contentRef.current
        if (content && content.scrollTop <= 1) {
          e.preventDefault()
        }
      }
    }

    // Add non-passive listeners
    modal.addEventListener('touchstart', onTouchStart, { passive: true })
    modal.addEventListener('touchmove', onTouchMove, { passive: false })

    return () => {
      modal.removeEventListener('touchstart', onTouchStart)
      modal.removeEventListener('touchmove', onTouchMove)
    }
  }, [enableSwipeToDismiss, shouldRender])

  // Prevent overscroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    // Keep a minimum scroll position to prevent bounce
    if (target.scrollTop <= 0) {
      target.scrollTop = 1
    }
  }

  if (!shouldRender) return null

  const sizeClasses = {
    auto: 'max-h-[90vh]',
    sm: 'max-h-[40vh]',
    md: 'max-h-[60vh]',
    lg: 'max-h-[80vh]',
    full: 'h-full rounded-t-none',
  }

  const variantClasses = {
    sheet: 'rounded-t-[20px]',
    alert: 'rounded-[20px] mx-4 mb-auto mt-auto',
    'action-sheet': 'rounded-t-[20px]',
  }

  const isAlert = variant === 'alert'

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end justify-center',
        isAlert && 'items-center'
      )}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black transition-opacity duration-300',
          enableBackdropBlur && 'backdrop-blur-sm',
          isAnimating ? 'opacity-40' : 'opacity-0'
        )}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className={cn(
          'relative w-full bg-white shadow-ios-lg ease-out',
          variantClasses[variant],
          sizeClasses[size],
          !isDragging && 'transition-all duration-300'
        )}
        style={{
          transform: isAlert
            ? isAnimating
              ? 'scale(1)'
              : 'scale(0.95)'
            : isDragging
              ? `translateY(${dragY}px)`
              : isAnimating
                ? 'translateY(0)'
                : 'translateY(100%)',
          opacity: isAlert ? (isAnimating ? 1 : 0) : 1,
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Drag Indicator (only for sheet variants) */}
        {variant !== 'alert' && (
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-ios-gray-4 rounded-full" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className={cn(
            'flex items-center justify-between px-4 py-3',
            variant !== 'action-sheet' && 'border-b border-ios-gray-5'
          )}>
            <h2 
              id="modal-title"
              className="text-ios-headline font-semibold text-ios-label-primary"
            >
              {title}
            </h2>
            {showCloseButton && !isAlert && (
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-ios-gray-6 transition-colors"
                aria-label="Close modal"
                type="button"
              >
                <X className="w-6 h-6 text-ios-gray-1" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div 
          ref={contentRef}
          className={cn(
            'overflow-y-auto',
            !footer && 'pb-4',
            variant === 'alert' ? 'p-4 text-center' : 'px-4 pt-4'
          )}
          style={{ 
            maxHeight: footer 
              ? 'calc(100% - 140px)' 
              : title || showCloseButton 
                ? 'calc(100% - 80px)'
                : 'calc(100% - 40px)'
          }}
          onScroll={handleScroll}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={cn(
            'sticky bottom-0 bg-white p-4 border-t border-ios-gray-5',
            variant === 'alert' && 'border-t-0 pt-0'
          )}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
