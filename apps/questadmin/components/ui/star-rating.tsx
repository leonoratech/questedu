'use client'

import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  showRating?: boolean
  className?: string
}

export function StarRating({
  rating,
  onRatingChange,
  maxRating = 5,
  size = 'md',
  interactive = false,
  showRating = false,
  className
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating)
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1
        const isFilled = starRating <= rating
        const isHalfFilled = starRating - 0.5 <= rating && starRating > rating

        return (
          <button
            key={index}
            type="button"
            className={cn(
              'transition-colors',
              interactive && 'hover:scale-110 cursor-pointer',
              !interactive && 'cursor-default'
            )}
            onClick={() => handleStarClick(starRating)}
            disabled={!interactive}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled && 'fill-yellow-400 text-yellow-400',
                isHalfFilled && 'fill-yellow-200 text-yellow-400',
                !isFilled && !isHalfFilled && 'fill-gray-200 text-gray-300'
              )}
            />
          </button>
        )
      })}
      {showRating && (
        <span className="ml-2 text-sm text-muted-foreground">
          {rating > 0 ? rating.toFixed(1) : 'No rating'}
        </span>
      )}
    </div>
  )
}
