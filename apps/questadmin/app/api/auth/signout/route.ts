import { signOut } from 'firebase/auth'
import { NextRequest, NextResponse } from 'next/server'
import { serverAuth } from '../../firebase-server'

export async function POST(request: NextRequest) {
  try {
    // Sign out user from Firebase Auth
    await signOut(serverAuth)

    return NextResponse.json({
      success: true,
      message: 'Sign out successful'
    })

  } catch (error: any) {
    console.error('Sign out error:', error)
    
    return NextResponse.json(
      { error: 'An error occurred during sign out' },
      { status: 400 }
    )
  }
}
