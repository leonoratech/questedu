/**
 * Multilingual Content Service
 * 
 * Provides services for managing multilingual content including migration,
 * validation, and content operations
 */

import {
    DEFAULT_LANGUAGE,
    RequiredMultilingualArray,
    RequiredMultilingualText,
    SupportedLanguage
} from '../../lib/multilingual-types';
import {
    createMultilingualArray,
    createMultilingualText,
    getCompatibleArray,
    getCompatibleText,
    getMultilingualContentStatus,
    isMultilingualContent
} from '../../lib/multilingual-utils';
import {
    COURSE_MULTILINGUAL_ARRAY_FIELDS,
    COURSE_MULTILINGUAL_TEXT_FIELDS,
    HybridAdminCourse,
    HybridAdminCourseTopic,
    MultilingualAdminCourse,
    MultilingualAdminCourseTopic,
    TOPIC_MULTILINGUAL_TEXT_FIELDS
} from '../models/data-model';
import {
    AdminCourse,
    AdminCourseTopic
} from './admin-course-service';

// ================================
// MIGRATION SERVICES
// ================================

/**
 * Migrate a legacy course to multilingual format
 */
export function migrateCourseToMultilingual(
  legacyCourse: AdminCourse,
  targetLanguage: SupportedLanguage = DEFAULT_LANGUAGE
): MultilingualAdminCourse {
  // Convert required text fields
  const migratedCourse: any = {
    ...legacyCourse,
    title: createMultilingualText(legacyCourse.title, targetLanguage),
    description: createMultilingualText(legacyCourse.description, targetLanguage)
  };

  // Convert optional array fields
  if (legacyCourse.whatYouWillLearn) {
    migratedCourse.whatYouWillLearn = createMultilingualArray(legacyCourse.whatYouWillLearn, targetLanguage);
  }
  if (legacyCourse.prerequisites) {
    migratedCourse.prerequisites = createMultilingualArray(legacyCourse.prerequisites, targetLanguage);
  }
  if (legacyCourse.targetAudience) {
    migratedCourse.targetAudience = createMultilingualArray(legacyCourse.targetAudience, targetLanguage);
  }
  if (legacyCourse.tags) {
    migratedCourse.tags = createMultilingualArray(legacyCourse.tags, targetLanguage);
  }
  if (legacyCourse.skills) {
    migratedCourse.skills = createMultilingualArray(legacyCourse.skills, targetLanguage);
  }

  return migratedCourse as MultilingualAdminCourse;
}

/**
 * Migrate a legacy course topic to multilingual format
 */
export function migrateTopicToMultilingual(
  legacyTopic: AdminCourseTopic,
  targetLanguage: SupportedLanguage = DEFAULT_LANGUAGE
): MultilingualAdminCourseTopic {
  const migratedTopic: any = {
    ...legacyTopic,
    title: createMultilingualText(legacyTopic.title, targetLanguage)
  };

  // Convert optional fields
  if (legacyTopic.description) {
    migratedTopic.description = createMultilingualText(legacyTopic.description, targetLanguage);
  }
  if (legacyTopic.learningObjectives) {
    migratedTopic.learningObjectives = createMultilingualArray(legacyTopic.learningObjectives, targetLanguage);
  }

  // Convert materials if present
  if (legacyTopic.materials) {
    migratedTopic.materials = legacyTopic.materials.map(material => ({
      ...material,
      title: createMultilingualText(material.title, targetLanguage),
      description: material.description ? createMultilingualText(material.description, targetLanguage) : undefined
    }));
  }

  return migratedTopic as MultilingualAdminCourseTopic;
}

/**
 * Batch migrate multiple courses to multilingual format
 */
export function batchMigrateCourses(
  legacyCourses: AdminCourse[],
  targetLanguage: SupportedLanguage = DEFAULT_LANGUAGE
): MultilingualAdminCourse[] {
  return legacyCourses.map(course => migrateCourseToMultilingual(course, targetLanguage));
}

/**
 * Batch migrate multiple topics to multilingual format
 */
export function batchMigrateTopics(
  legacyTopics: AdminCourseTopic[],
  targetLanguage: SupportedLanguage = DEFAULT_LANGUAGE
): MultilingualAdminCourseTopic[] {
  return legacyTopics.map(topic => migrateTopicToMultilingual(topic, targetLanguage));
}

// ================================
// CONTENT VALIDATION SERVICES
// ================================

/**
 * Validate course multilingual content completeness
 */
export function validateCourseContent(course: HybridAdminCourse) {
  const textFields = COURSE_MULTILINGUAL_TEXT_FIELDS;
  const arrayFields = COURSE_MULTILINGUAL_ARRAY_FIELDS;
  
  const requiredFields = [...textFields, ...arrayFields.slice(0, 1)]; // Only whatYouWillLearn is required
  
  return getMultilingualContentStatus(course, requiredFields);
}

/**
 * Validate topic multilingual content completeness
 */
export function validateTopicContent(topic: HybridAdminCourseTopic) {
  const textFields = TOPIC_MULTILINGUAL_TEXT_FIELDS.slice(0, 1); // Only title is required
  const arrayFields: string[] = []; // No required array fields for topics
  
  const requiredFields = [...textFields, ...arrayFields];
  
  return getMultilingualContentStatus(topic, requiredFields);
}

/**
 * Get content gaps for a course across languages
 */
export function getCourseContentGaps(
  course: HybridAdminCourse,
  targetLanguages: SupportedLanguage[]
) {
  const gaps: { [key in SupportedLanguage]?: string[] } = {};
  
  targetLanguages.forEach(lang => {
    const missing: string[] = [];
    
    // Check required fields
    if (!getCompatibleText(course.title, lang)) {
      missing.push('title');
    }
    if (!getCompatibleText(course.description, lang)) {
      missing.push('description');
    }
    
    // Check optional but important fields
    const whatYouWillLearn = getCompatibleArray(course.whatYouWillLearn, lang);
    if (!whatYouWillLearn || whatYouWillLearn.length === 0) {
      missing.push('whatYouWillLearn');
    }
    
    if (missing.length > 0) {
      gaps[lang] = missing;
    }
  });
  
  return gaps;
}

// ================================
// CONTENT RETRIEVAL SERVICES
// ================================

/**
 * Get course content in a specific language with fallbacks
 */
export function getCourseInLanguage(
  course: HybridAdminCourse,
  language: SupportedLanguage = DEFAULT_LANGUAGE
) {
  return {
    ...course,
    title: getCompatibleText(course.title, language),
    description: getCompatibleText(course.description, language),
    whatYouWillLearn: getCompatibleArray(course.whatYouWillLearn, language),
    prerequisites: getCompatibleArray(course.prerequisites, language),
    targetAudience: getCompatibleArray(course.targetAudience, language),
    tags: getCompatibleArray(course.tags, language),
    skills: getCompatibleArray(course.skills, language)
  };
}

/**
 * Get topic content in a specific language with fallbacks
 */
export function getTopicInLanguage(
  topic: HybridAdminCourseTopic,
  language: SupportedLanguage = DEFAULT_LANGUAGE
) {
  return {
    ...topic,
    title: getCompatibleText(topic.title, language),
    description: getCompatibleText(topic.description, language),
    learningObjectives: getCompatibleArray(topic.learningObjectives, language),
    materials: topic.materials?.map(material => ({
      ...material,
      title: getCompatibleText(material.title, language),
      description: getCompatibleText(material.description, language)
    }))
  };
}

/**
 * Get all topics for a course in a specific language
 */
export function getCourseTopicsInLanguage(
  topics: HybridAdminCourseTopic[],
  language: SupportedLanguage = DEFAULT_LANGUAGE
) {
  return topics.map(topic => getTopicInLanguage(topic, language));
}

// ================================
// CONTENT UPDATE SERVICES
// ================================

/**
 * Update course content in a specific language
 */
export function updateCourseLanguageContent(
  course: HybridAdminCourse,
  language: SupportedLanguage,
  updates: {
    title?: string;
    description?: string;
    whatYouWillLearn?: string[];
    prerequisites?: string[];
    targetAudience?: string[];
    tags?: string[];
    skills?: string[];
  }
): HybridAdminCourse {
  const updatedCourse = { ...course };
  
  // Ensure fields are in multilingual format
  if (!isMultilingualContent(updatedCourse.title)) {
    updatedCourse.title = createMultilingualText(
      typeof updatedCourse.title === 'string' ? updatedCourse.title : '',
      DEFAULT_LANGUAGE
    );
  }
  if (!isMultilingualContent(updatedCourse.description)) {
    updatedCourse.description = createMultilingualText(
      typeof updatedCourse.description === 'string' ? updatedCourse.description : '',
      DEFAULT_LANGUAGE
    );
  }
  
  // Update text fields
  if (updates.title !== undefined) {
    (updatedCourse.title as RequiredMultilingualText)[language] = updates.title;
  }
  if (updates.description !== undefined) {
    (updatedCourse.description as RequiredMultilingualText)[language] = updates.description;
  }
  
  // Update array fields
  ['whatYouWillLearn', 'prerequisites', 'targetAudience', 'tags', 'skills'].forEach(field => {
    const fieldKey = field as keyof typeof updates;
    if (updates[fieldKey] !== undefined) {
      if (!isMultilingualContent(updatedCourse[fieldKey])) {
        updatedCourse[fieldKey] = createMultilingualArray(
          Array.isArray(updatedCourse[fieldKey]) ? updatedCourse[fieldKey] as string[] : [],
          DEFAULT_LANGUAGE
        ) as any;
      }
      (updatedCourse[fieldKey] as RequiredMultilingualArray)[language] = updates[fieldKey] as string[];
    }
  });
  
  return updatedCourse;
}

/**
 * Update topic content in a specific language
 */
export function updateTopicLanguageContent(
  topic: HybridAdminCourseTopic,
  language: SupportedLanguage,
  updates: {
    title?: string;
    description?: string;
    learningObjectives?: string[];
  }
): HybridAdminCourseTopic {
  const updatedTopic = { ...topic };
  
  // Ensure fields are in multilingual format
  if (!isMultilingualContent(updatedTopic.title)) {
    updatedTopic.title = createMultilingualText(
      typeof updatedTopic.title === 'string' ? updatedTopic.title : '',
      DEFAULT_LANGUAGE
    );
  }
  
  // Update text fields
  if (updates.title !== undefined) {
    (updatedTopic.title as RequiredMultilingualText)[language] = updates.title;
  }
  if (updates.description !== undefined) {
    if (!isMultilingualContent(updatedTopic.description)) {
      updatedTopic.description = createMultilingualText(
        typeof updatedTopic.description === 'string' ? updatedTopic.description : '',
        DEFAULT_LANGUAGE
      );
    }
    (updatedTopic.description as RequiredMultilingualText)[language] = updates.description;
  }
  
  // Update array fields
  if (updates.learningObjectives !== undefined) {
    if (!isMultilingualContent(updatedTopic.learningObjectives)) {
      updatedTopic.learningObjectives = createMultilingualArray(
        Array.isArray(updatedTopic.learningObjectives) ? updatedTopic.learningObjectives : [],
        DEFAULT_LANGUAGE
      );
    }
    (updatedTopic.learningObjectives as RequiredMultilingualArray)[language] = updates.learningObjectives;
  }
  
  return updatedTopic;
}

// ================================
// ANALYTICS AND REPORTING
// ================================

/**
 * Get translation progress for a course
 */
export function getCourseTranslationProgress(
  course: HybridAdminCourse,
  targetLanguages: SupportedLanguage[] = [SupportedLanguage.ENGLISH, SupportedLanguage.TELUGU]
) {
  const progress: { [key in SupportedLanguage]?: number } = {};
  
  targetLanguages.forEach(lang => {
    let completedFields = 0;
    let totalFields = 0;
    
    // Required fields
    totalFields += 2; // title, description
    if (getCompatibleText(course.title, lang)) completedFields++;
    if (getCompatibleText(course.description, lang)) completedFields++;
    
    // Important optional fields
    const importantFields = ['whatYouWillLearn', 'prerequisites', 'targetAudience'];
    importantFields.forEach(field => {
      const value = course[field as keyof HybridAdminCourse];
      if (value) {
        totalFields++;
        const content = getCompatibleArray(value as any, lang);
        if (content && content.length > 0) completedFields++;
      }
    });
    
    progress[lang] = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 100;
  });
  
  return progress;
}

/**
 * Get overall translation statistics for multiple courses
 */
export function getTranslationStatistics(
  courses: HybridAdminCourse[],
  targetLanguages: SupportedLanguage[] = [SupportedLanguage.ENGLISH, SupportedLanguage.TELUGU]
) {
  const stats = {
    totalCourses: courses.length,
    languageStats: {} as { [key in SupportedLanguage]?: { completed: number; partial: number; missing: number; avgProgress: number } }
  };
  
  targetLanguages.forEach(lang => {
    let completed = 0;
    let partial = 0;
    let missing = 0;
    let totalProgress = 0;
    
    courses.forEach(course => {
      const progress = getCourseTranslationProgress(course, [lang])[lang] || 0;
      totalProgress += progress;
      
      if (progress === 100) completed++;
      else if (progress > 0) partial++;
      else missing++;
    });
    
    stats.languageStats[lang] = {
      completed,
      partial,
      missing,
      avgProgress: courses.length > 0 ? Math.round(totalProgress / courses.length) : 0
    };
  });
  
  return stats;
}
