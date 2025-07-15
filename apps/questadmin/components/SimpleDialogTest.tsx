'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'

export function SimpleDialogTest() {
  const [open, setOpen] = useState(false)

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">Simple Dialog Test</h3>
      <p>Dialog state: {open ? 'OPEN' : 'CLOSED'}</p>
      <Button onClick={() => setOpen(true)}>
        Open Simple Dialog
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>This is a test dialog to verify that dialogs work correctly.</p>
            <Button onClick={() => setOpen(false)} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
