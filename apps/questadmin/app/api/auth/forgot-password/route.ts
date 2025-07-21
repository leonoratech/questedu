import { auth } from '@/lib/firebase/config'
import { ForgotPasswordSchema } from '@/lib/validations/server'
import { sendPasswordResetEmail } from 'firebase/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const { error, value } = ForgotPasswordSchema.validate(body)
    if (error) {
      return NextResponse.json(
        { message: error.details[0].message },
        { status: 400 }
      )
    }

    const { email } = value

    // Send password reset email
    await sendPasswordResetEmail(auth, email)

    return NextResponse.json({
      message: 'Password reset email sent successfully'
    })

  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'Failed to send password reset email' },
      { status: 400 }
    )
  }
}
