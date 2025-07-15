/**
 * Course Learning Service for QuestEdu React Native App
 * Handles course topics, questions, and learning progress
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import {
    CourseQuestion,
    CourseTopic,
    LearningData,
    LearningSession,
    LearningSlide,
    ProgressUpdateData,
    SlideType,
    calculateOverallProgress,
    getNextIncompleteSlide
} from '../types/learning';
import { getFirebaseAuth, getFirestoreDb } from './firebase-config';

/**
 * Convert Firestore timestamp to Date
 */
const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
};

/**
 * Get course topics from Firebase
 */
export const getCourseTopics = async (courseId: string): Promise<CourseTopic[]> => {
  try {
    console.log('Fetching topics for course:', courseId);
    
    const db = getFirestoreDb();
    const topicsRef = collection(db, 'courseTopics');
    const topicsQuery = query(
      topicsRef,
      where('courseId', '==', courseId),
      where('isPublished', '==', true),
      orderBy('order', 'asc')
    );
    
    const topicsSnapshot = await getDocs(topicsQuery);
    const topics: CourseTopic[] = [];

    topicsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const topic: CourseTopic = {
        id: doc.id,
        courseId: data.courseId,
        title: data.title || '',
        description: data.description,
        order: data.order || 0,
        duration: data.duration,
        videoUrl: data.videoUrl,
        videoLength: data.videoLength,
        materials: data.materials || [],
        isPublished: data.isPublished !== false,
        isFree: data.isFree || false,
        prerequisites: data.prerequisites || [],
        learningObjectives: data.learningObjectives || [],
        summary: data.summary,
        transcription: data.transcription,
        notes: data.notes,
        quizId: data.quizId,
        assignmentId: data.assignmentId,
        completionRate: data.completionRate || 0,
        averageWatchTime: data.averageWatchTime,
        viewCount: data.viewCount || 0,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      };
      topics.push(topic);
    });

    console.log(`Fetched ${topics.length} topics for course`);
    return topics;
  } catch (error) {
    console.error('Error fetching course topics:', error);
    return [];
  }
};

/**
 * Get questions for a specific topic
 */
export const getTopicQuestions = async (courseId: string, topicId: string | null): Promise<CourseQuestion[]> => {
  try {
    console.log('Fetching questions for course:', courseId, 'topic:', topicId);
    
    const db = getFirestoreDb();
    const questionsRef = collection(db, 'courseQuestions');
    
    let questionsQuery;
    if (topicId === null) {
      // Get all questions for the course - simplified query
      console.log('Building query for all course questions');
      questionsQuery = query(
        questionsRef,
        where('courseId', '==', courseId)
      );
    } else {
      // Get questions for specific topic
      console.log('Building query for topic-specific questions');
      questionsQuery = query(
        questionsRef,
        where('courseId', '==', courseId),
        where('topicId', '==', topicId)
      );
    }
    
    console.log('Executing Firebase query...');
    const questionsSnapshot = await getDocs(questionsQuery);
    console.log('Firebase query returned', questionsSnapshot.docs.length, 'documents');
    const questions: CourseQuestion[] = [];

    questionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log('Question document:', doc.id, 'data keys:', Object.keys(data));
      
      const question: CourseQuestion = {
        id: doc.id,
        courseId: data.courseId,
        topicId: data.topicId,
        questionText: data.questionText || data.question || '',
        questionRichText: data.questionRichText,
        type: data.questionType || data.type || 'multiple_choice',
        marks: data.marks || 1,
        difficulty: data.difficulty || 'easy',
        options: data.options || [],
        correctAnswer: data.correctAnswer,
        correctAnswerRichText: data.correctAnswerRichText,
        explanation: data.explanation,
        tags: data.tags || [],
        flags: data.flags || { isReported: false, isReviewed: false, needsUpdate: false },
        isPublished: data.isPublished !== false, // Default to true if not specified
        order: data.order || 0,
        createdBy: data.createdBy || '',
        lastModifiedBy: data.lastModifiedBy,
        category: data.category,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      };
      
      // Only include published questions, but be flexible about the field
      if (question.isPublished) {
        questions.push(question);
      }
    });

    // Sort by order if available
    questions.sort((a, b) => (a.order || 0) - (b.order || 0));

    console.log(`Fetched ${questions.length} questions for ${topicId ? 'topic' : 'course'} (after filtering)`);
    return questions;
  } catch (error) {
    console.error('Error fetching topic questions:', error);
    return [];
  }
};

/**
 * Get all questions for a course
 */
export const getCourseQuestions = async (courseId: string): Promise<CourseQuestion[]> => {
  return getTopicQuestions(courseId, null);
};

/**
 * Build learning slides from topics and questions
 */
export const buildLearningSlides = async (courseId: string): Promise<LearningSlide[]> => {
  try {
    console.log('Building learning slides for course:', courseId);
    
    const topics = await getCourseTopics(courseId);
    const slides: LearningSlide[] = [];
    let slideOrder = 0;

    for (const topic of topics) {
      // Add topic slide
      slides.push({
        id: `topic-${topic.id}`,
        type: SlideType.TOPIC,
        order: slideOrder++,
        topic
      });

      // Add question slides for this topic
      const questions = await getTopicQuestions(courseId, topic.id!);
      for (const question of questions) {
        slides.push({
          id: `question-${question.id}`,
          type: SlideType.QUESTION,
          order: slideOrder++,
          question,
          topicTitle: topic.title
        });
      }
    }

    console.log(`Built ${slides.length} slides for course`);
    return slides;
  } catch (error) {
    console.error('Error building learning slides:', error);
    return [];
  }
};

/**
 * Get or create learning session for the current user
 */
export const getLearningSession = async (courseId: string): Promise<LearningSession | null> => {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    console.log('Getting learning session for course:', courseId);
    
    const db = getFirestoreDb();
    const sessionRef = doc(db, 'learningSessions', `${user.uid}_${courseId}`);
    const sessionSnap = await getDoc(sessionRef);

    if (sessionSnap.exists()) {
      const data = sessionSnap.data();
      return {
        courseId: data.courseId,
        userId: data.userId,
        currentSlideIndex: data.currentSlideIndex || 0,
        totalSlides: data.totalSlides || 0,
        startedAt: convertTimestamp(data.startedAt),
        lastAccessed: convertTimestamp(data.lastAccessed),
        completedSlides: data.completedSlides || [],
        topicsProgress: data.topicsProgress || {},
        userAnswers: data.userAnswers || {},
        timeSpent: data.timeSpent || 0,
        completionPercentage: data.completionPercentage || 0
      };
    } else {
      // Create new session
      const newSession: LearningSession = {
        courseId,
        userId: user.uid,
        currentSlideIndex: 0,
        totalSlides: 0,
        startedAt: new Date(),
        lastAccessed: new Date(),
        completedSlides: [],
        topicsProgress: {},
        userAnswers: {},
        timeSpent: 0,
        completionPercentage: 0
      };

      await setDoc(sessionRef, {
        ...newSession,
        startedAt: serverTimestamp(),
        lastAccessed: serverTimestamp()
      });

      console.log('Created new learning session');
      return newSession;
    }
  } catch (error) {
    console.error('Error getting learning session:', error);
    return null;
  }
};

/**
 * Update learning session progress
 */
export const updateLearningProgress = async (
  courseId: string,
  progressData: ProgressUpdateData,
  currentSlideIndex: number,
  totalSlides: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('Updating learning progress for course:', courseId);
    
    const db = getFirestoreDb();
    const sessionRef = doc(db, 'learningSessions', `${user.uid}_${courseId}`);
    
    // Get current session
    const sessionSnap = await getDoc(sessionRef);
    let session: LearningSession;
    
    if (sessionSnap.exists()) {
      const data = sessionSnap.data();
      session = {
        courseId: data.courseId,
        userId: data.userId,
        currentSlideIndex: data.currentSlideIndex || 0,
        totalSlides: data.totalSlides || 0,
        startedAt: convertTimestamp(data.startedAt),
        lastAccessed: convertTimestamp(data.lastAccessed),
        completedSlides: data.completedSlides || [],
        topicsProgress: data.topicsProgress || {},
        userAnswers: data.userAnswers || {},
        timeSpent: data.timeSpent || 0,
        completionPercentage: data.completionPercentage || 0
      };
    } else {
      return { success: false, error: 'Learning session not found' };
    }

    // Update session data
    session.currentSlideIndex = currentSlideIndex;
    session.totalSlides = totalSlides;
    session.lastAccessed = new Date();
    
    if (progressData.timeSpent) {
      session.timeSpent += progressData.timeSpent;
    }

    // Mark slide as completed if not already
    if (!session.completedSlides.includes(progressData.slideId)) {
      session.completedSlides.push(progressData.slideId);
    }

    // Handle question answers
    if (progressData.questionAnswer) {
      const { questionId, selectedAnswer, isCorrect, timeTaken } = progressData.questionAnswer;
      
      session.userAnswers[questionId] = {
        questionId,
        selectedAnswer,
        isCorrect,
        timestamp: new Date(),
        timeTaken
      };
    }

    // Calculate completion percentage
    session.completionPercentage = calculateOverallProgress(session);

    // Update in Firebase
    await updateDoc(sessionRef, {
      ...session,
      lastAccessed: serverTimestamp()
    });

    // Update enrollment progress if needed
    if (session.completionPercentage > 0) {
      const enrollmentProgress = {
        completedTopics: Object.keys(session.topicsProgress).filter(
          topicId => session.topicsProgress[topicId].isCompleted
        ),
        totalTopics: totalSlides, // This should be calculated properly
        completionPercentage: session.completionPercentage,
        timeSpent: session.timeSpent,
        quizScores: session.userAnswers
      };

      // This would need the enrollment ID - we might need to fetch it
      // await updateEnrollmentProgress(enrollmentId, enrollmentProgress);
    }

    console.log('Successfully updated learning progress');
    return { success: true };
  } catch (error) {
    console.error('Error updating learning progress:', error);
    return { success: false, error: 'Failed to update progress' };
  }
};

/**
 * Get complete learning data for a course
 */
export const getCourseLearningData = async (courseId: string): Promise<LearningData | null> => {
  try {
    console.log('Getting complete learning data for course:', courseId);
    
    // Get course basic info
    const db = getFirestoreDb();
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      console.error('Course not found:', courseId);
      return null;
    }
    
    const courseData = courseSnap.data();
    
    // Build slides
    const slides = await buildLearningSlides(courseId);
    
    // Get or create session
    let session = await getLearningSession(courseId);
    if (!session) {
      console.error('Failed to get learning session');
      return null;
    }
    
    // Update total slides in session if needed
    if (session.totalSlides !== slides.length) {
      session.totalSlides = slides.length;
      await updateLearningProgress(courseId, {
        slideId: '',
        slideType: SlideType.TOPIC
      }, session.currentSlideIndex, slides.length);
    }
    
    // Determine current index - continue from last position or start from beginning
    const currentIndex = session.completedSlides.length > 0 
      ? getNextIncompleteSlide(slides, session)
      : 0;

    const learningData: LearningData = {
      course: {
        id: courseId,
        title: courseData.title || '',
        instructor: courseData.instructor || '',
        description: courseData.description
      },
      slides,
      currentIndex,
      session
    };

    console.log('Successfully prepared learning data');
    return learningData;
  } catch (error) {
    console.error('Error getting course learning data:', error);
    return null;
  }
};

/**
 * Mark a slide as completed
 */
export const completeSlide = async (
  courseId: string,
  slideId: string,
  slideType: SlideType,
  additionalData?: {
    questionAnswer?: {
      questionId: string;
      selectedAnswer: string | string[];
      isCorrect: boolean;
      timeTaken?: number;
    };
    timeSpent?: number;
  }
): Promise<{ success: boolean; error?: string }> => {
  const progressData: ProgressUpdateData = {
    slideId,
    slideType,
    timeSpent: additionalData?.timeSpent,
    questionAnswer: additionalData?.questionAnswer
  };

  // We need current slide index and total slides - this could be improved
  // For now, we'll pass dummy values and update them in the function
  return await updateLearningProgress(courseId, progressData, 0, 0);
};