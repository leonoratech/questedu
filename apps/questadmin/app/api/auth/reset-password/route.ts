import { sendPasswordResetEmail } from 'firebase/auth'
import { NextRequest, NextResponse } from 'next/server'
import { serverAuth } from '../../firebase-server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Send password reset email
    await sendPasswordResetEmail(serverAuth, email)

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully'
    })

  } catch (error: any) {
    console.error('Password reset error:', error)
    
    let errorMessage = 'An error occurred sending password reset email'
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No user found with this email address'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address'
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}
