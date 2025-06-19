'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { StarRating } from '@/components/ui/star-rating'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { CourseReview } from '@/data/models/data-model'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface CourseReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  courseTitle: string
  existingReview?: CourseReview | null
  onReviewSubmitted?: () => void
}

export function CourseReviewDialog({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  existingReview,
  onReviewSubmitted
}: CourseReviewDialogProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load existing review data when dialog opens
  useEffect(() => {
    if (isOpen && existingReview) {
      setRating(existingReview.rating)
      setFeedback(existingReview.feedback || '')
    } else if (isOpen && !existingReview) {
      setRating(0)
      setFeedback('')
    }
  }, [isOpen, existingReview])

  const handleSubmit = async () => {
    if (!user || rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)

    try {
      const url = existingReview 
        ? `/api/course-reviews/${existingReview.id}`
        : '/api/course-reviews'
      
      const method = existingReview ? 'PUT' : 'POST'
      
      const body = existingReview 
        ? { rating, feedback: feedback.trim() }
        : { 
            courseId, 
            rating, 
            feedback: feedback.trim(),
            isPublished: true
          }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      toast.success(existingReview ? 'Review updated successfully!' : 'Review submitted successfully!')
      onReviewSubmitted?.()
      onClose()
    } catch (error: any) {
      console.error('Error submitting review:', error)
      toast.error(error.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!existingReview) return

    if (!confirm('Are you sure you want to delete your review?')) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/course-reviews/${existingReview.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete review')
      }

      toast.success('Review deleted successfully!')
      onReviewSubmitted?.()
      onClose()
    } catch (error: any) {
      console.error('Error deleting review:', error)
      toast.error(error.message || 'Failed to delete review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? 'Update Your Review' : 'Rate This Course'}
          </DialogTitle>
          <DialogDescription>
            Share your experience with &quot;{courseTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating *</label>
            <div className="flex items-center gap-2">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                interactive
                size="lg"
              />
              <span className="text-sm text-muted-foreground">
                {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select rating'}
              </span>
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Feedback <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              placeholder="Share your thoughts about the course content, instructor, and overall experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              maxLength={250}
              rows={4}
            />
            <div className="text-xs text-muted-foreground text-right">
              {feedback.length}/250 characters
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {existingReview && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Delete Review
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting 
              ? 'Submitting...' 
              : existingReview 
                ? 'Update Review' 
                : 'Submit Review'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
