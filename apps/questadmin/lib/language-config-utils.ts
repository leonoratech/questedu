/**
 * Language Configuration Utilities for Course Management
 * 
 * This file contains utility functions for managing language configuration
 * in courses, including migration helpers and validation functions
 */

import { AdminCourse } from '@/data/services/admin-course-service'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/multilingual-types'

/**
 * Language configuration interface for courses
 */
export interface CourseLanguageConfig {
  primaryLanguage: string
  supportedLanguages: string[]
  enableTranslation: boolean
}

/**
 * Get the language configuration from a course, with fallbacks for legacy data
 */
export function getCourseLanguageConfig(course: AdminCourse): CourseLanguageConfig {
  return {
    primaryLanguage: course.primaryLanguage || course.language || DEFAULT_LANGUAGE,
    supportedLanguages: course.supportedLanguages || course.subtitles || [DEFAULT_LANGUAGE],
    enableTranslation: course.enableTranslation || false
  }
}

/**
 * Check if a course has modern language configuration
 */
export function hasModernLanguageConfig(course: AdminCourse): boolean {
  return !!(course.primaryLanguage && course.supportedLanguages)
}

/**
 * Create default language configuration for a course
 */
export function createDefaultLanguageConfig(language: string = DEFAULT_LANGUAGE): CourseLanguageConfig {
  return {
    primaryLanguage: language,
    supportedLanguages: [language],
    enableTranslation: false
  }
}

/**
 * Validate language configuration
 */
export function validateLanguageConfig(config: CourseLanguageConfig): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check primary language
  if (!config.primaryLanguage) {
    errors.push('Primary language is required')
  } else if (!SUPPORTED_LANGUAGES.includes(config.primaryLanguage as SupportedLanguage)) {
    errors.push(`Primary language '${config.primaryLanguage}' is not supported`)
  }
  
  // Check supported languages
  if (!config.supportedLanguages || config.supportedLanguages.length === 0) {
    errors.push('At least one supported language is required')
  } else {
    // Primary language must be in supported languages
    if (!config.supportedLanguages.includes(config.primaryLanguage)) {
      errors.push('Primary language must be included in supported languages')
    }
    
    // Check if all supported languages are valid
    const invalidLanguages = config.supportedLanguages.filter(
      lang => !SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)
    )
    if (invalidLanguages.length > 0) {
      errors.push(`Unsupported languages: ${invalidLanguages.join(', ')}`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Migrate legacy language fields to modern language configuration
 */
export function migrateLegacyLanguageFields(course: AdminCourse): CourseLanguageConfig {
  const primaryLanguage = course.language || DEFAULT_LANGUAGE
  let supportedLanguages = [primaryLanguage]
  
  // Include subtitle languages if they exist and are different
  if (course.subtitles && Array.isArray(course.subtitles)) {
    const additionalLanguages = course.subtitles.filter(lang => lang !== primaryLanguage)
    supportedLanguages = [primaryLanguage, ...additionalLanguages]
  }
  
  return {
    primaryLanguage,
    supportedLanguages,
    enableTranslation: false // Default to false for migrated courses
  }
}

/**
 * Check if a course supports a specific language
 */
export function courseSupportsLanguage(course: AdminCourse, language: string): boolean {
  const config = getCourseLanguageConfig(course)
  return config.supportedLanguages.includes(language)
}

/**
 * Get the effective content for a course in a specific language
 * Falls back to primary language if content is not available in requested language
 */
export function getCourseContentInLanguage(course: AdminCourse, language: string) {
  const config = getCourseLanguageConfig(course)
  const fallbackLanguage = config.primaryLanguage
  
  return {
    title: course.multilingualTitle?.[language] || course.multilingualTitle?.[fallbackLanguage] || course.title,
    description: course.multilingualDescription?.[language] || course.multilingualDescription?.[fallbackLanguage] || course.description,
    tags: course.multilingualTags?.[language] || course.multilingualTags?.[fallbackLanguage] || course.tags || [],
    skills: course.multilingualSkills?.[language] || course.multilingualSkills?.[fallbackLanguage] || course.skills || [],
    prerequisites: course.multilingualPrerequisites?.[language] || course.multilingualPrerequisites?.[fallbackLanguage] || course.prerequisites || [],
    whatYouWillLearn: course.multilingualWhatYouWillLearn?.[language] || course.multilingualWhatYouWillLearn?.[fallbackLanguage] || course.whatYouWillLearn || [],
    targetAudience: course.multilingualTargetAudience?.[language] || course.multilingualTargetAudience?.[fallbackLanguage] || course.targetAudience || []
  }
}

/**
 * Create course update data that includes language configuration
 */
export function createCourseUpdateWithLanguageConfig(
  updates: Partial<AdminCourse>,
  languageConfig?: Partial<CourseLanguageConfig>
): Partial<AdminCourse> {
  const updateData = { ...updates }
  
  if (languageConfig) {
    if (languageConfig.primaryLanguage) {
      updateData.primaryLanguage = languageConfig.primaryLanguage
      // Also update legacy language field for backward compatibility
      updateData.language = languageConfig.primaryLanguage
    }
    
    if (languageConfig.supportedLanguages) {
      updateData.supportedLanguages = languageConfig.supportedLanguages
      // Also update legacy subtitles field for backward compatibility
      updateData.subtitles = languageConfig.supportedLanguages
    }
    
    if (languageConfig.enableTranslation !== undefined) {
      updateData.enableTranslation = languageConfig.enableTranslation
    }
  }
  
  return updateData
}

/**
 * Helper function to determine if a course needs language configuration migration
 */
export function needsLanguageConfigMigration(course: AdminCourse): boolean {
  return !hasModernLanguageConfig(course) && Boolean(course.language || course.subtitles)
}

/**
 * Get language statistics for a course collection
 */
export function getCourseLanguageStats(courses: AdminCourse[]) {
  const stats = {
    totalCourses: courses.length,
    coursesWithModernConfig: 0,
    coursesNeedingMigration: 0,
    languageDistribution: {} as Record<string, number>,
    multilingualCourses: 0
  }
  
  courses.forEach(course => {
    if (hasModernLanguageConfig(course)) {
      stats.coursesWithModernConfig++
      const config = getCourseLanguageConfig(course)
      
      // Count primary language
      stats.languageDistribution[config.primaryLanguage] = 
        (stats.languageDistribution[config.primaryLanguage] || 0) + 1
      
      // Count multilingual courses
      if (config.supportedLanguages.length > 1) {
        stats.multilingualCourses++
      }
    } else if (needsLanguageConfigMigration(course)) {
      stats.coursesNeedingMigration++
    }
  })
  
  return stats
}

export default {
  getCourseLanguageConfig,
  hasModernLanguageConfig,
  createDefaultLanguageConfig,
  validateLanguageConfig,
  migrateLegacyLanguageFields,
  courseSupportsLanguage,
  getCourseContentInLanguage,
  createCourseUpdateWithLanguageConfig,
  needsLanguageConfigMigration,
  getCourseLanguageStats
}
