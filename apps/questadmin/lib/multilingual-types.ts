/**
 * Multilingual Support Types for QuestEdu Admin Application
 * 
 * This file contains TypeScript interfaces and utilities for handling multi-language content
 * Supports English (en) and Telugu (te) languages initially, extensible for more languages
 */

// ================================
// SUPPORTED LANGUAGES
// ================================

export enum SupportedLanguage {
  ENGLISH = 'en',
  TELUGU = 'te'
}

export const SUPPORTED_LANGUAGES = Object.values(SupportedLanguage);

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  [SupportedLanguage.ENGLISH]: 'English',
  [SupportedLanguage.TELUGU]: 'తెలుగు'
};

export const DEFAULT_LANGUAGE = SupportedLanguage.ENGLISH;

// ================================
// MULTILINGUAL CONTENT TYPES
// ================================

/**
 * Base type for multilingual content
 * Each field can have content in multiple languages with fallback to default language
 */
export type MultilingualText = {
  [key in SupportedLanguage]?: string;
};

/**
 * Required multilingual text (must have at least the default language)
 */
export type RequiredMultilingualText = MultilingualText & {
  [DEFAULT_LANGUAGE]: string;
};

/**
 * Multilingual array content (for lists like learning objectives, prerequisites)
 */
export type MultilingualArray = {
  [key in SupportedLanguage]?: string[];
};

/**
 * Required multilingual array (must have at least the default language)
 */
export type RequiredMultilingualArray = MultilingualArray & {
  [DEFAULT_LANGUAGE]: string[];
};

// ================================
// CONTENT VALIDATION TYPES
// ================================

/**
 * Language completion status for content
 */
export interface LanguageCompletionStatus {
  language: SupportedLanguage;
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
}

/**
 * Overall multilingual content status
 */
export interface MultilingualContentStatus {
  languages: LanguageCompletionStatus[];
  primaryLanguage: SupportedLanguage;
  isFullyTranslated: boolean;
  totalFields: number;
  translatedFields: number;
}

// ================================
// TRANSLATION METADATA
// ================================

/**
 * Translation metadata for tracking content translation status
 */
export interface TranslationMetadata {
  lastTranslated?: Date;
  translatedBy?: string; // User ID who provided the translation
  isAutoTranslated?: boolean;
  translationQuality?: 'draft' | 'reviewed' | 'approved';
  notes?: string;
}

/**
 * Translation tracking for multilingual content
 */
export type MultilingualTranslationMetadata = {
  [key in SupportedLanguage]?: TranslationMetadata;
};

// ================================
// UTILITY TYPES
// ================================

/**
 * Extract all string fields from a type for multilingual conversion
 */
export type ExtractStringFields<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

/**
 * Extract all string array fields from a type for multilingual conversion
 */
export type ExtractStringArrayFields<T> = {
  [K in keyof T]: T[K] extends string[] ? K : never;
}[keyof T];

/**
 * Convert string fields to multilingual in a type
 */
export type WithMultilingual<T, StringFields extends keyof T, ArrayFields extends keyof T = never> = 
  Omit<T, StringFields | ArrayFields> & 
  {
    [K in StringFields]: T[K] extends string ? RequiredMultilingualText : never;
  } & 
  {
    [K in ArrayFields]: T[K] extends string[] ? RequiredMultilingualArray : never;
  };

// ================================
// LANGUAGE CONTEXT
// ================================

/**
 * Language context for components and services
 */
export interface LanguageContext {
  currentLanguage: SupportedLanguage;
  fallbackLanguage: SupportedLanguage;
  availableLanguages: SupportedLanguage[];
  isRTL: boolean;
}

/**
 * Language preference for users
 */
export interface UserLanguagePreference {
  preferredLanguage: SupportedLanguage;
  fallbackLanguages: SupportedLanguage[];
  autoDetect: boolean;
}

// ================================
// EXPORT TYPES FOR EASIER IMPORT
// ================================

export type {
    MultilingualText as ML, MultilingualArray as MLA, RequiredMultilingualText as RML, RequiredMultilingualArray as RMLA
};

