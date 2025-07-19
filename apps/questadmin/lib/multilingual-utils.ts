/**
 * Multilingual Content Utilities for QuestEdu Admin Application
 * 
 * This file contains utility functions for handling multilingual content,
 * including translation helpers, content validation, and fallback mechanisms
 */

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_NAMES,
  LanguageCompletionStatus,
  LanguageContext,
  MultilingualArray,
  MultilingualContentStatus,
  MultilingualText,
  RequiredMultilingualArray,
  RequiredMultilingualText,
  SUPPORTED_LANGUAGES,
  SupportedLanguage
} from './multilingual-types';

// ================================
// CONTENT RETRIEVAL UTILITIES
// ================================

/**
 * Get text content in the specified language with fallback
 */
export function getLocalizedText(
  content: MultilingualText | string | undefined,
  language: SupportedLanguage = DEFAULT_LANGUAGE,
  fallbackLanguage: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  if (!content) return '';
  
  // Handle legacy string content (for backward compatibility)
  if (typeof content === 'string') {
    return content;
  }
  
  // Try preferred language first
  if (content[language]) {
    return content[language]!;
  }
  
  // Fall back to fallback language
  if (content[fallbackLanguage]) {
    return content[fallbackLanguage]!;
  }
  
  // Fall back to any available language
  for (const lang of SUPPORTED_LANGUAGES) {
    if (content[lang]) {
      return content[lang]!;
    }
  }
  
  return '';
}

/**
 * Get array content in the specified language with fallback
 */
export function getLocalizedArray(
  content: MultilingualArray | string[] | undefined,
  language: SupportedLanguage = DEFAULT_LANGUAGE,
  fallbackLanguage: SupportedLanguage = DEFAULT_LANGUAGE
): string[] {
  if (!content) return [];
  
  // Handle legacy string array content (for backward compatibility)
  if (Array.isArray(content)) {
    return content;
  }
  
  // Try preferred language first
  if (content[language]) {
    return content[language]!;
  }
  
  // Fall back to fallback language
  if (content[fallbackLanguage]) {
    return content[fallbackLanguage]!;
  }
  
  // Fall back to any available language
  for (const lang of SUPPORTED_LANGUAGES) {
    if (content[lang]) {
      return content[lang]!;
    }
  }
  
  return [];
}

// ================================
// CONTENT CREATION UTILITIES
// ================================

/**
 * Create multilingual text content from a single language value
 */
export function createMultilingualText(
  text: string,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): RequiredMultilingualText {
  return {
    [language]: text
  } as RequiredMultilingualText;
}

/**
 * Create multilingual array content from a single language value
 */
export function createMultilingualArray(
  array: string[],
  language: SupportedLanguage = DEFAULT_LANGUAGE
): RequiredMultilingualArray {
  return {
    [language]: array
  } as RequiredMultilingualArray;
}

/**
 * Update multilingual text content with new translation
 */
export function updateMultilingualText(
  content: MultilingualText,
  text: string,
  language: SupportedLanguage
): MultilingualText {
  return {
    ...content,
    [language]: text
  };
}

/**
 * Update multilingual array content with new translation
 */
export function updateMultilingualArray(
  content: MultilingualArray,
  array: string[],
  language: SupportedLanguage
): MultilingualArray {
  return {
    ...content,
    [language]: array
  };
}

// ================================
// CONTENT VALIDATION UTILITIES
// ================================

/**
 * Check if multilingual text has content in the specified language
 */
export function hasLanguageContent(
  content: MultilingualText | undefined,
  language: SupportedLanguage
): boolean {
  return !!(content && content[language] && content[language]!.trim().length > 0);
}

/**
 * Check if multilingual array has content in the specified language
 */
export function hasLanguageArrayContent(
  content: MultilingualArray | undefined,
  language: SupportedLanguage
): boolean {
  return !!(content && content[language] && content[language]!.length > 0);
}

/**
 * Get available languages for multilingual content
 */
export function getAvailableLanguages(content: MultilingualText | MultilingualArray): SupportedLanguage[] {
  if (!content) return [];
  
  return SUPPORTED_LANGUAGES.filter(lang => {
    const langContent = content[lang];
    if (Array.isArray(langContent)) {
      return langContent.length > 0;
    }
    return !!(langContent && langContent.trim().length > 0);
  });
}

/**
 * Calculate completion status for a language in multilingual content
 */
export function calculateLanguageCompletion(
  contentObject: Record<string, MultilingualText | MultilingualArray | any>,
  language: SupportedLanguage,
  requiredFields: string[]
): LanguageCompletionStatus {
  const missingFields: string[] = [];
  let completedFields = 0;
  
  for (const field of requiredFields) {
    const content = contentObject[field];
    if (content && typeof content === 'object' && !Array.isArray(content)) {
      // Check if it's multilingual content
      if (hasLanguageContent(content as MultilingualText, language) || 
          hasLanguageArrayContent(content as MultilingualArray, language)) {
        completedFields++;
      } else {
        missingFields.push(field);
      }
    } else {
      // Non-multilingual field, count as completed
      completedFields++;
    }
  }
  
  const completionPercentage = requiredFields.length > 0 
    ? Math.round((completedFields / requiredFields.length) * 100)
    : 100;
  
  return {
    language,
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage
  };
}

/**
 * Get overall multilingual content status
 */
export function getMultilingualContentStatus(
  contentObject: Record<string, MultilingualText | MultilingualArray | any>,
  requiredFields: string[]
): MultilingualContentStatus {
  const languages = SUPPORTED_LANGUAGES.map(lang => 
    calculateLanguageCompletion(contentObject, lang, requiredFields)
  );
  
  const totalFields = requiredFields.length * SUPPORTED_LANGUAGES.length;
  const translatedFields = languages.reduce((sum, lang) => 
    sum + (requiredFields.length - lang.missingFields.length), 0
  );
  
  return {
    languages,
    primaryLanguage: DEFAULT_LANGUAGE,
    isFullyTranslated: languages.every(lang => lang.isComplete),
    totalFields,
    translatedFields
  };
}

// ================================
// MIGRATION UTILITIES
// ================================

/**
 * Convert legacy string content to multilingual format
 */
export function migrateLegacyText(
  legacyText: string,
  targetLanguage: SupportedLanguage = DEFAULT_LANGUAGE
): RequiredMultilingualText {
  return createMultilingualText(legacyText, targetLanguage);
}

/**
 * Convert legacy string array content to multilingual format
 */
export function migrateLegacyArray(
  legacyArray: string[],
  targetLanguage: SupportedLanguage = DEFAULT_LANGUAGE
): RequiredMultilingualArray {
  return createMultilingualArray(legacyArray, targetLanguage);
}

/**
 * Migrate an entire object from legacy to multilingual format
 */
export function migrateLegacyContent<T extends Record<string, any>>(
  legacyObject: T,
  stringFields: (keyof T)[],
  arrayFields: (keyof T)[] = []
): T {
  const migratedObject = { ...legacyObject };
  
  // Migrate string fields
  for (const field of stringFields) {
    const value = legacyObject[field];
    if (typeof value === 'string') {
      migratedObject[field] = createMultilingualText(value) as T[typeof field];
    }
  }
  
  // Migrate array fields
  for (const field of arrayFields) {
    const value = legacyObject[field];
    if (Array.isArray(value) && value.every((item: any) => typeof item === 'string')) {
      migratedObject[field] = createMultilingualArray(value) as T[typeof field];
    }
  }
  
  return migratedObject;
}

// ================================
// LANGUAGE CONTEXT UTILITIES
// ================================

/**
 * Create a language context for components
 */
export function createLanguageContext(
  currentLanguage: SupportedLanguage = DEFAULT_LANGUAGE
): LanguageContext {
  return {
    currentLanguage,
    fallbackLanguage: DEFAULT_LANGUAGE,
    availableLanguages: SUPPORTED_LANGUAGES,
    isRTL: false // Add RTL support for future languages if needed
  };
}

/**
 * Get language display name
 */
export function getLanguageDisplayName(language: SupportedLanguage): string {
  return LANGUAGE_NAMES[language] || language;
}

/**
 * Get language emoji flag (for UI display)
 */
export function getLanguageFlag(language: SupportedLanguage): string {
  const flags: Record<SupportedLanguage, string> = {
    [SupportedLanguage.ENGLISH]: '🇺🇸',
    [SupportedLanguage.TELUGU]: '🇮🇳'
  };
  return flags[language] || '🌐';
}

// ================================
// VALIDATION HELPERS
// ================================

/**
 * Validate that required multilingual content has at least the default language
 */
export function validateRequiredMultilingualText(content: MultilingualText): boolean {
  return hasLanguageContent(content, DEFAULT_LANGUAGE);
}

/**
 * Validate that required multilingual array has at least the default language
 */
export function validateRequiredMultilingualArray(content: MultilingualArray): boolean {
  return hasLanguageArrayContent(content, DEFAULT_LANGUAGE);
}

/**
 * Check if content is multilingual (has structure for multiple languages)
 */
export function isMultilingualContent(content: any): content is MultilingualText | MultilingualArray {
  if (!content || typeof content !== 'object') return false;
  
  // Check if it has at least one supported language key
  return SUPPORTED_LANGUAGES.some(lang => content.hasOwnProperty(lang));
}

/**
 * Ensure backward compatibility - return string if legacy, or localized text if multilingual
 */
export function getCompatibleText(
  content: string | MultilingualText | undefined,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  return getLocalizedText(content, language);
}

/**
 * Ensure backward compatibility - return array if legacy, or localized array if multilingual
 */
export function getCompatibleArray(
  content: string[] | MultilingualArray | undefined,
  language: SupportedLanguage = DEFAULT_LANGUAGE
): string[] {
  if (!content) return [];
  if (Array.isArray(content)) return content;
  return getLocalizedArray(content, language);
}


/**
 * Get all available languages from a question object
 */

export function getQuestionLanguages(question: any): SupportedLanguage[] {
  const languages = new Set<SupportedLanguage>();
  
  // Check question text
  if (isMultilingualContent(question.question)) {
    Object.keys(question.question as Record<string, string>).forEach(lang => {
      languages.add(lang as SupportedLanguage);
    });
  } else {
    languages.add('en' as SupportedLanguage);
  }
  
  // Check explanation text
  if (question.explanation && isMultilingualContent(question.explanation)) {
    Object.keys(question.explanation as Record<string, string>).forEach(lang => {
      languages.add(lang as SupportedLanguage);
    });
  }
  
  // Check options
  if (question.options && isMultilingualContent(question.options)) {
    Object.keys(question.options as Record<string, string[]>).forEach(lang => {
      languages.add(lang as SupportedLanguage);
    });
  }
  
  // Check correct answer
  if (question.correctAnswer && isMultilingualContent(question.correctAnswer)) {
    Object.keys(question.correctAnswer as Record<string, string>).forEach(lang => {
      languages.add(lang as SupportedLanguage);
    });
  }
  
  // Check tags
  if (question.tags && isMultilingualContent(question.tags)) {
    Object.keys(question.tags as Record<string, string[]>).forEach(lang => {
      languages.add(lang as SupportedLanguage);
    });
  }
  
  return Array.from(languages);
}
