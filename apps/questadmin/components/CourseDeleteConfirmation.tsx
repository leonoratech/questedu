'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, Archive, BookOpen, ClipboardList, FileText, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

interface CourseDeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  courseTitle: string
  courseId: string
  isLoading?: boolean
}

interface RelatedItemsCounts {
  topics: number
  questions: number
  enrollments: number
  assignments: number
  materials: number
  progressRecords: number
}

export function CourseDeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  courseTitle,
  courseId,
  isLoading = false
}: CourseDeleteConfirmationProps) {
  const [relatedCounts, setRelatedCounts] = useState<RelatedItemsCounts | null>(null)
  const [loadingCounts, setLoadingCounts] = useState(false)

  useEffect(() => {
    if (isOpen && courseId) {
      fetchRelatedCounts()
    }
  }, [isOpen, courseId])

  const fetchRelatedCounts = async () => {
    setLoadingCounts(true)
    try {
      const response = await fetch(`/api/courses/${courseId}/cascade-delete`, {
        method: 'GET', // We'll add a GET method to just get counts
      })
      
      if (response.ok) {
        const data = await response.json()
        setRelatedCounts(data.relatedCounts)
      }
    } catch (error) {
      console.error('Error fetching related counts:', error)
    } finally {
      setLoadingCounts(false)
    }
  }

  const totalRelatedItems = relatedCounts 
    ? relatedCounts.topics + relatedCounts.questions + relatedCounts.enrollments + 
      relatedCounts.assignments + relatedCounts.materials + relatedCounts.progressRecords
    : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-left">Delete Course</DialogTitle>
              <DialogDescription className="text-left">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-1">Course to be deleted:</h4>
            <p className="text-sm text-foreground font-medium">{courseTitle}</p>
          </div>

          {loadingCounts ? (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Loading related data...</p>
            </div>
          ) : relatedCounts && totalRelatedItems > 0 ? (
            <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-3 text-destructive">
                Related data that will also be deleted:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {relatedCounts.topics > 0 && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3 w-3" />
                    <span>{relatedCounts.topics} topics</span>
                  </div>
                )}
                {relatedCounts.questions > 0 && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    <span>{relatedCounts.questions} questions</span>
                  </div>
                )}
                {relatedCounts.enrollments > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>{relatedCounts.enrollments} enrollments</span>
                  </div>
                )}
                {relatedCounts.assignments > 0 && (
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-3 w-3" />
                    <span>{relatedCounts.assignments} assignments</span>
                  </div>
                )}
                {relatedCounts.materials > 0 && (
                  <div className="flex items-center gap-2">
                    <Archive className="h-3 w-3" />
                    <span>{relatedCounts.materials} materials</span>
                  </div>
                )}
                {relatedCounts.progressRecords > 0 && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    <span>{relatedCounts.progressRecords} progress records</span>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-destructive/20">
                <Badge variant="destructive" className="text-xs">
                  Total: {totalRelatedItems} related items
                </Badge>
              </div>
            </div>
          ) : relatedCounts && totalRelatedItems === 0 ? (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                No related data found. Only the course will be deleted.
              </p>
            </div>
          ) : null}

          <div className="bg-destructive/5 border border-destructive/20 p-3 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              ⚠️ This action is permanent and cannot be undone
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading || loadingCounts}
          >
            {isLoading ? 'Deleting...' : 'Delete Course'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
