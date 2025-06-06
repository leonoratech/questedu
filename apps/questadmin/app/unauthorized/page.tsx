'use client'

import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Home, Shield } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You don't have permission to access this page
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="text-center space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Access Restricted:</strong> This page requires specific permissions that your account doesn't have.
              </p>
            </div>
            
            {user && userProfile && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong>Current Role:</strong> {userProfile.role}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Email:</strong> {user.email}
                </p>
              </div>
            )}
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>If you believe this is an error, please:</p>
              <ul className="list-disc list-inside text-left space-y-1">
                <li>Contact your administrator</li>
                <li>Verify you're signed in with the correct account</li>
                <li>Check if your account permissions have been updated</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <button
              onClick={() => router.back()}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
            
            <Link
              href="/my-courses"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact support at{' '}
            <a href="mailto:support@questedu.com" className="text-blue-600 hover:text-blue-500">
              support@questedu.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
