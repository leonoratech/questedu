'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface MinimalImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MinimalImageDialog({
  open,
  onOpenChange,
}: MinimalImageDialogProps) {
  console.log('MinimalImageDialog render - open:', open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Minimal Image Dialog</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>This is a minimal image dialog for testing.</p>
          <p>Open state: {open ? 'OPEN' : 'CLOSED'}</p>
          <Button onClick={() => onOpenChange(false)} className="mt-4">
            Close Dialog
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
