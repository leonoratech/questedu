import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '../../../../firebase-server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; topicId: string }> }
) {
  try {
    const { id: courseId, topicId } = await params
    const updateData = await request.json()
    
    // Validate that the topic exists and belongs to the course
    const topicRef = doc(serverDb, 'course_topics', topicId)
    const topicDoc = await getDoc(topicRef)
    
    if (!topicDoc.exists()) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }
    
    const topicData = topicDoc.data()
    if (topicData.courseId !== courseId) {
      return NextResponse.json(
        { error: 'Topic does not belong to this course' },
        { status: 403 }
      )
    }
    
    // Validate required fields if provided
    if (updateData.title !== undefined && !updateData.title) {
      return NextResponse.json(
        { error: 'Topic title cannot be empty' },
        { status: 400 }
      )
    }
    
    const updatedTopic = {
      ...updateData,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(topicRef, updatedTopic)
    
    return NextResponse.json({
      success: true,
      topic: {
        id: topicId,
        ...topicData,
        ...updatedTopic
      },
      message: 'Topic updated successfully'
    })
    
  } catch (error: any) {
    console.error('Update topic error:', error)
    return NextResponse.json(
      { error: 'An error occurred updating the topic' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; topicId: string }> }
) {
  try {
    const { id: courseId, topicId } = await params
    
    // Validate that the topic exists and belongs to the course
    const topicRef = doc(serverDb, 'course_topics', topicId)
    const topicDoc = await getDoc(topicRef)
    
    if (!topicDoc.exists()) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }
    
    const topicData = topicDoc.data()
    if (topicData.courseId !== courseId) {
      return NextResponse.json(
        { error: 'Topic does not belong to this course' },
        { status: 403 }
      )
    }
    
    await deleteDoc(topicRef)
    
    return NextResponse.json({
      success: true,
      message: 'Topic deleted successfully'
    })
    
  } catch (error: any) {
    console.error('Delete topic error:', error)
    return NextResponse.json(
      { error: 'An error occurred deleting the topic' },
      { status: 500 }
    )
  }
}
