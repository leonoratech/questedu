import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { serverDb } from '../../firebase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params
    
    const courseRef = doc(serverDb, 'courses', courseId)
    const courseSnap = await getDoc(courseRef)
    
    if (!courseSnap.exists()) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      course: {
        id: courseSnap.id,
        ...courseSnap.data()
      }
    })

  } catch (error: any) {
    console.error('Get course error:', error)
    return NextResponse.json(
      { error: 'An error occurred fetching the course' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params
    const updateData = await request.json()
    
    // Remove id from update data if present
    delete updateData.id
    delete updateData.createdAt
    
    const courseRef = doc(serverDb, 'courses', courseId)
    
    // Check if course exists
    const courseSnap = await getDoc(courseRef)
    if (!courseSnap.exists()) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    const updatedCourse = {
      ...updateData,
      updatedAt: serverTimestamp()
    }

    await updateDoc(courseRef, updatedCourse)
    
    // Get updated course
    const updatedSnap = await getDoc(courseRef)

    return NextResponse.json({
      success: true,
      course: {
        id: updatedSnap.id,
        ...updatedSnap.data()
      },
      message: 'Course updated successfully'
    })

  } catch (error: any) {
    console.error('Update course error:', error)
    return NextResponse.json(
      { error: 'An error occurred updating the course' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params
    
    const courseRef = doc(serverDb, 'courses', courseId)
    
    // Check if course exists
    const courseSnap = await getDoc(courseRef)
    if (!courseSnap.exists()) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    await deleteDoc(courseRef)

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete course error:', error)
    return NextResponse.json(
      { error: 'An error occurred deleting the course' },
      { status: 500 }
    )
  }
}
