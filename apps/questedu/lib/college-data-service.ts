/**
 * College Data Service for QuestEdu React Native App
 * Handles fetching college programs and subjects for filtering
 */

import {
    collection,
    getDocs,
    orderBy,
    query,
    where
} from 'firebase/firestore';
import { getFirestoreDb } from './firebase-config';

export interface College {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Program {
  id: string;
  name: string;
  collegeId: string;
  yearsOrSemesters: number;
  semesterType: 'years' | 'semesters';
  description?: string;
  isActive: boolean;
}

export interface Subject {
  id: string;
  name: string;
  programId: string;
  collegeId: string;
  yearOrSemester: number;
  instructorId?: string;
  description?: string;
  credits?: number;
  isDefaultEnrollment?: boolean;
}

const db = getFirestoreDb();

/**
 * Get programs for a specific college
 */
export const getCollegePrograms = async (collegeId: string): Promise<Program[]> => {
  try {
    const programsRef = collection(db, 'programs');
    const q = query(
      programsRef,
      where('collegeId', '==', collegeId),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Program));
  } catch (error) {
    console.error('Error fetching college programs:', error);
    return [];
  }
};

/**
 * Get subjects for a specific program
 */
export const getProgramSubjects = async (programId: string, collegeId: string): Promise<Subject[]> => {
  try {
    const subjectsRef = collection(db, 'subjects');
    const q = query(
      subjectsRef,
      where('programId', '==', programId),
      where('collegeId', '==', collegeId),
      orderBy('yearOrSemester', 'asc'),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Subject));
  } catch (error) {
    console.error('Error fetching program subjects:', error);
    return [];
  }
};

/**
 * Get subjects for a specific program and year/semester
 */
export const getProgramSubjectsByYear = async (
  programId: string, 
  collegeId: string, 
  yearOrSemester: number
): Promise<Subject[]> => {
  try {
    const subjectsRef = collection(db, 'subjects');
    const q = query(
      subjectsRef,
      where('programId', '==', programId),
      where('collegeId', '==', collegeId),
      where('yearOrSemester', '==', yearOrSemester),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Subject));
  } catch (error) {
    console.error('Error fetching program subjects by year:', error);
    return [];
  }
};

/**
 * Get college information by ID
 */
export const getCollegeById = async (collegeId: string): Promise<College | null> => {
  try {
    const collegesRef = collection(db, 'colleges');
    const q = query(collegesRef, where('__name__', '==', collegeId));
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as College;
  } catch (error) {
    console.error('Error fetching college:', error);
    return null;
  }
};

/**
 * Get available years/semesters for a program
 */
export const getProgramYears = (program: Program): Array<{ value: number; label: string }> => {
  const years = [];
  for (let i = 1; i <= program.yearsOrSemesters; i++) {
    years.push({
      value: i,
      label: `${program.semesterType === 'years' ? 'Year' : 'Semester'} ${i}`
    });
  }
  return years;
};
