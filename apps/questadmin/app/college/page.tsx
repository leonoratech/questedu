'use client'

// College management page for single college app
import { AdminLayout } from '@/components/AdminLayout'
import { AuthGuard } from '@/components/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'
import { College, getCollegeById } from '@/data/services/college-service'
import { useEffect, useState } from 'react'

export default function CollegePage() {
  const { userProfile } = useAuth()
  const [college, setCollege] = useState<College | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userProfile?.collegeId) return
    getCollegeById(userProfile.collegeId)
      .then(setCollege)
      .catch(() => setError('Failed to load college info'))
      .finally(() => setLoading(false))
  }, [userProfile])

  if (loading) return <div>Loading college info...</div>
  if (error) return <div>{error}</div>
  if (!college) return <div>No college info found.</div>

  return (
    <AuthGuard>
      <AdminLayout>
        <div className="max-w-2xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">College Information</h1>
          <div className="bg-white rounded shadow p-4">
            <div className="mb-2"><b>Name:</b> {college.name}</div>
            <div className="mb-2"><b>Accreditation:</b> {college.accreditation}</div>
            <div className="mb-2"><b>Affiliation:</b> {college.affiliation}</div>
            <div className="mb-2"><b>Principal:</b> {college.principalName}</div>
            <div className="mb-2"><b>Address:</b> {college.address ? `${college.address.street}, ${college.address.city}, ${college.address.state}, ${college.address.country}, ${college.address.postalCode}` : 'N/A'}</div>
            <div className="mb-2"><b>Contact:</b> {college.contact ? `${college.contact.phone} | ${college.contact.email} | ${college.contact.website}` : 'N/A'}</div>
            <div className="mb-2"><b>Description:</b> {college.description}</div>
          </div>
          {/* Add edit functionality as needed */}
        </div>
      </AdminLayout>
    </AuthGuard>
  )
}
