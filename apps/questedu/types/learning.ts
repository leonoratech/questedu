/**
 * Learning data types for QuestEdu React Native App
 * Defines interfaces for course learning functionality
 */

import { BaseEntity } from './course';

// ================================
// TOPIC INTERFACES
// ================================

export interface TopicMaterial {
  type: 'pdf' | 'video' | 'audio' | 'document' | 'link';
  title: string;
  url: string;
  description?: string;
}

export interface CourseTopic extends BaseEntity {
  courseId: string;
  title: string;
  description?: string;
  order: number;
  duration?: number; // in minutes
  videoUrl?: string;
  videoLength?: number; // in minutes
  materials: TopicMaterial[];
  isPublished: boolean;
  isFree: boolean;
  prerequisites: string[]; // topic IDs
  learningObjectives: string[];
  summary?: string;
  transcription?: string;
  notes?: string;
  quizId?: string;
  assignmentId?: string;
  completionRate: number;
  averageWatchTime?: number; // in minutes
  viewCount: number;
}

// ================================
// QUESTION INTERFACES
// ================================

export interface QuestionFlags {
  isReported: boolean;
  isReviewed: boolean;
  needsUpdate: boolean;
}

export interface CourseQuestion extends BaseEntity {
  courseId: string;
  topicId?: string; // Optional reference to course topic
  questionText: string;
  questionRichText?: string; // For rich text questions
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_essay' | 'long_essay';
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[]; // For multiple choice questions
  correctAnswer?: string | string[]; // Optional for essay questions
  correctAnswerRichText?: string; // For rich text answers
  explanation?: string;
  // explanationRichText?: string; // For rich text explanations
  tags: string[];
  flags: QuestionFlags;
  isPublished: boolean;
  order: number; // For organizing questions within a course
  createdBy: string;
  lastModifiedBy?: string;
  category?: string; // Additional categorization
}

// ================================
// LEARNING SLIDE INTERFACES
// ================================

export enum SlideType {
  TOPIC = 'topic',
  QUESTION = 'question'
}

export interface BaseSlide {
  id: string;
  type: SlideType;
  order: number;
}

export interface TopicSlide extends BaseSlide {
  type: SlideType.TOPIC;
  topic: CourseTopic;
}

export interface QuestionSlide extends BaseSlide {
  type: SlideType.QUESTION;
  question: CourseQuestion;
  topicTitle?: string;
}

export type LearningSlide = TopicSlide | QuestionSlide;

// ================================
// LEARNING PROGRESS INTERFACES
// ================================

export interface UserAnswer {
  questionId: string;
  selectedAnswer: string | string[];
  isCorrect: boolean;
  timestamp: Date;
  timeTaken?: number; // in seconds
}

export interface TopicProgress {
  topicId: string;
  isCompleted: boolean;
  timeSpent: number; // in minutes
  questionsAnswered: number;
  questionsCorrect: number;
  lastAccessed: Date;
}

export interface LearningSession {
  courseId: string;
  userId: string;
  currentSlideIndex: number;
  totalSlides: number;
  startedAt: Date;
  lastAccessed: Date;
  completedSlides: string[]; // slide IDs
  topicsProgress: { [topicId: string]: TopicProgress };
  userAnswers: { [questionId: string]: UserAnswer };
  timeSpent: number; // total time in minutes
  completionPercentage: number;
}

// ================================
// LEARNING SERVICE INTERFACES
// ================================

export interface LearningData {
  course: {
    id: string;
    title: string;
    instructor: string;
    description?: string;
  };
  slides: LearningSlide[];
  currentIndex: number;
  session: LearningSession;
}

export interface ProgressUpdateData {
  slideId: string;
  slideType: SlideType;
  timeSpent?: number;
  questionAnswer?: {
    questionId: string;
    selectedAnswer: string | string[];
    isCorrect: boolean;
    timeTaken?: number;
  };
}

// ================================
// UTILITY FUNCTIONS
// ================================

export function calculateOverallProgress(session: LearningSession): number {
  if (session.totalSlides === 0) return 0;
  return (session.completedSlides.length / session.totalSlides) * 100;
}

export function getTopicProgressPercentage(topicProgress: TopicProgress, totalQuestions: number): number {
  if (totalQuestions === 0) return topicProgress.isCompleted ? 100 : 0;
  return (topicProgress.questionsAnswered / totalQuestions) * 100;
}

export function formatLearningTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function isSlideCompleted(slide: LearningSlide, session: LearningSession): boolean {
  return session.completedSlides.includes(slide.id);
}

export function getNextIncompleteSlide(slides: LearningSlide[], session: LearningSession): number {
  for (let i = 0; i < slides.length; i++) {
    if (!session.completedSlides.includes(slides[i].id)) {
      return i;
    }
  }
  return slides.length - 1; // Return last slide if all completed
}