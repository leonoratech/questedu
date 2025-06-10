/**
 * Language Selector Component
 * 
 * Provides a UI for selecting languages when editing multilingual content
 */

'use client';

import { AlertCircle, Check, Globe, Plus } from 'lucide-react';
import React, { useState } from 'react';
import {
    DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES,
    SupportedLanguage
} from '../lib/multilingual-types';
import {
    getLanguageDisplayName,
    getLanguageFlag
} from '../lib/multilingual-utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';

// ================================
// TYPES
// ================================

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  availableLanguages?: SupportedLanguage[];
  showAddLanguageButton?: boolean;
  onAddLanguage?: (language: SupportedLanguage) => void;
  contentStatus?: Record<SupportedLanguage, boolean>; // Whether content exists for each language
  className?: string;
}

interface LanguageTabsProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  availableLanguages: SupportedLanguage[];
  contentStatus?: Record<SupportedLanguage, boolean>;
  onAddLanguage?: (language: SupportedLanguage) => void;
  className?: string;
}

interface LanguageStatusIndicatorProps {
  language: SupportedLanguage;
  hasContent: boolean;
  isActive: boolean;
}

// ================================
// LANGUAGE STATUS INDICATOR
// ================================

const LanguageStatusIndicator: React.FC<LanguageStatusIndicatorProps> = ({
  language,
  hasContent,
  isActive
}) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
      isActive 
        ? 'bg-primary text-primary-foreground border-primary' 
        : 'bg-background hover:bg-muted border-border'
    }`}>
      <span className="text-sm">{getLanguageFlag(language)}</span>
      <span className="text-sm font-medium">{getLanguageDisplayName(language)}</span>
      {hasContent ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <AlertCircle className="h-3 w-3 text-yellow-500" />
      )}
      {language === DEFAULT_LANGUAGE && (
        <Badge variant="secondary" className="text-xs">Primary</Badge>
      )}
    </div>
  );
};

// ================================
// LANGUAGE SELECTOR DROPDOWN
// ================================

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  availableLanguages = SUPPORTED_LANGUAGES,
  showAddLanguageButton = false,
  onAddLanguage,
  contentStatus = {},
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={currentLanguage} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{getLanguageFlag(currentLanguage)}</span>
              <span>{getLanguageDisplayName(currentLanguage)}</span>
              {contentStatus[currentLanguage] ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <AlertCircle className="h-3 w-3 text-yellow-500" />
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((lang) => (
            <SelectItem key={lang} value={lang}>
              <div className="flex items-center gap-2">
                <span>{getLanguageFlag(lang)}</span>
                <span>{getLanguageDisplayName(lang)}</span>
                {contentStatus[lang] && <Check className="h-3 w-3 text-green-500" />}
                {lang === DEFAULT_LANGUAGE && (
                  <Badge variant="secondary" className="text-xs">Primary</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {showAddLanguageButton && onAddLanguage && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            // Find languages not yet in availableLanguages
            const missingLanguages = SUPPORTED_LANGUAGES.filter(
              lang => !availableLanguages.includes(lang)
            );
            if (missingLanguages.length > 0) {
              onAddLanguage(missingLanguages[0]);
            }
          }}
          disabled={availableLanguages.length >= SUPPORTED_LANGUAGES.length}
        >
          <Plus className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

// ================================
// LANGUAGE TABS
// ================================

export const LanguageTabs: React.FC<LanguageTabsProps> = ({
  currentLanguage,
  onLanguageChange,
  availableLanguages,
  contentStatus = {},
  onAddLanguage,
  className = ""
}) => {
  const [showAddLanguages, setShowAddLanguages] = useState(false);
  
  const missingLanguages = SUPPORTED_LANGUAGES.filter(
    lang => !availableLanguages.includes(lang)
  );
  
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Language Tabs */}
      <div className="flex flex-wrap gap-2">
        {availableLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className="transition-colors"
          >
            <LanguageStatusIndicator
              language={lang}
              hasContent={contentStatus[lang] || false}
              isActive={lang === currentLanguage}
            />
          </button>
        ))}
        
        {/* Add Language Button */}
        {onAddLanguage && missingLanguages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddLanguages(!showAddLanguages)}
            className="flex items-center gap-2"
          >
            <Plus className="h-3 w-3" />
            <span>Add Language</span>
          </Button>
        )}
      </div>
      
      {/* Add Language Options */}
      {showAddLanguages && missingLanguages.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md">
          <span className="text-sm text-muted-foreground">Add translation for:</span>
          {missingLanguages.map((lang) => (
            <Button
              key={lang}
              variant="ghost"
              size="sm"
              onClick={() => {
                onAddLanguage!(lang);
                setShowAddLanguages(false);
              }}
              className="flex items-center gap-2 h-8"
            >
              <span>{getLanguageFlag(lang)}</span>
              <span>{getLanguageDisplayName(lang)}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

// ================================
// LANGUAGE COMPLETION INDICATOR
// ================================

interface LanguageCompletionIndicatorProps {
  contentStatus: Record<SupportedLanguage, boolean>;
  totalLanguages?: number;
  className?: string;
}

export const LanguageCompletionIndicator: React.FC<LanguageCompletionIndicatorProps> = ({
  contentStatus,
  totalLanguages = SUPPORTED_LANGUAGES.length,
  className = ""
}) => {
  const completedLanguages = Object.values(contentStatus).filter(Boolean).length;
  const completionPercentage = Math.round((completedLanguages / totalLanguages) * 100);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground">
          {completedLanguages}/{totalLanguages} languages
        </span>
        <Badge 
          variant={completionPercentage === 100 ? "default" : "secondary"}
          className="text-xs"
        >
          {completionPercentage}%
        </Badge>
      </div>
      
      {/* Language dots */}
      <div className="flex gap-1">
        {SUPPORTED_LANGUAGES.slice(0, totalLanguages).map((lang) => (
          <div
            key={lang}
            className={`w-2 h-2 rounded-full ${
              contentStatus[lang] ? 'bg-green-500' : 'bg-gray-300'
            }`}
            title={`${getLanguageDisplayName(lang)}: ${
              contentStatus[lang] ? 'Complete' : 'Missing'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ================================
// LANGUAGE HELPER TEXT
// ================================

interface LanguageHelperTextProps {
  currentLanguage: SupportedLanguage;
  isTranslating?: boolean;
  className?: string;
}

export const LanguageHelperText: React.FC<LanguageHelperTextProps> = ({
  currentLanguage,
  isTranslating = false,
  className = ""
}) => {
  const isPrimary = currentLanguage === DEFAULT_LANGUAGE;
  
  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <span>{getLanguageFlag(currentLanguage)}</span>
      {isPrimary ? (
        <span>Editing primary language content</span>
      ) : isTranslating ? (
        <span>Translating content to {getLanguageDisplayName(currentLanguage)}</span>
      ) : (
        <span>Editing {getLanguageDisplayName(currentLanguage)} content</span>
      )}
    </div>
  );
};
