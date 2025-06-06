'use client'

import { redirect } from 'next/navigation'
import { useEffect } from 'react'

// Redirect /courses/create to /courses/new for consistency
export default function CreateCoursePage() {
  useEffect(() => {
    redirect('/courses/new')
  }, [])

  return null
}
