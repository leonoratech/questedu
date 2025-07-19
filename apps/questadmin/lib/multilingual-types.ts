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
export const DEFAULT_LANGUAGE_NAME = LANGUAGE_NAMES[DEFAULT_LANGUAGE];