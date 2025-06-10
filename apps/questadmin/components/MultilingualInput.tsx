/**
 * Multilingual Input Components
 * 
 * Provides form input components for editing multilingual content
 */

'use client';

import { AlertCircle, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import {
    DEFAULT_LANGUAGE,
    MultilingualArray,
    MultilingualText,
    RequiredMultilingualArray,
    RequiredMultilingualText,
    SupportedLanguage
} from '../lib/multilingual-types';
import {
    createMultilingualArray,
    createMultilingualText,
    getAvailableLanguages,
    getLocalizedArray,
    getLocalizedText,
    hasLanguageArrayContent,
    hasLanguageContent,
    updateMultilingualArray,
    updateMultilingualText
} from '../lib/multilingual-utils';
import { LanguageTabs } from './LanguageSelector';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

// ================================
// TYPES
// ================================

interface MultilingualInputProps {
  label: string;
  value: MultilingualText | RequiredMultilingualText | undefined;
  onChange: (value: RequiredMultilingualText) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
}

interface MultilingualTextareaProps extends Omit<MultilingualInputProps, 'onChange'> {
  onChange: (value: RequiredMultilingualText) => void;
  rows?: number;
}

interface MultilingualArrayInputProps {
  label: string;
  value: MultilingualArray | RequiredMultilingualArray | undefined;
  onChange: (value: RequiredMultilingualArray) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
  addItemPlaceholder?: string;
}

// ================================
// MULTILINGUAL TEXT INPUT
// ================================

export const MultilingualInput: React.FC<MultilingualInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  className = "",
  description
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  
  // Initialize value if undefined
  const multilingualValue = value || createMultilingualText("", DEFAULT_LANGUAGE);
  
  // Get available languages (languages that have content)
  const availableLanguages = getAvailableLanguages(multilingualValue);
  const allLanguages = availableLanguages.length > 0 ? availableLanguages : [DEFAULT_LANGUAGE];
  
  // Get content status for each language
  const contentStatus: Record<SupportedLanguage, boolean> = { en: false, te: false };
  allLanguages.forEach(lang => {
    contentStatus[lang] = hasLanguageContent(multilingualValue, lang);
  });
  
  const handleInputChange = (inputValue: string) => {
    const updatedValue = updateMultilingualText(multilingualValue, inputValue, currentLanguage);
    onChange(updatedValue as RequiredMultilingualText);
  };
  
  const handleAddLanguage = (language: SupportedLanguage) => {
    const updatedValue = updateMultilingualText(multilingualValue, "", language);
    onChange(updatedValue as RequiredMultilingualText);
    setCurrentLanguage(language);
  };
  
  const currentValue = getLocalizedText(multilingualValue, currentLanguage, DEFAULT_LANGUAGE);
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-1">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      
      <LanguageTabs
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        availableLanguages={allLanguages}
        contentStatus={contentStatus}
        onAddLanguage={handleAddLanguage}
      />
      
      <div className="space-y-2">
        <Input
          value={currentValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={!hasLanguageContent(multilingualValue, currentLanguage) ? 'border-yellow-300' : ''}
        />
        
        {!hasLanguageContent(multilingualValue, currentLanguage) && (
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <AlertCircle className="h-3 w-3" />
            <span>Content missing for this language</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ================================
// MULTILINGUAL TEXTAREA
// ================================

export const MultilingualTextarea: React.FC<MultilingualTextareaProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  rows = 4,
  className = "",
  description
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  
  // Initialize value if undefined
  const multilingualValue = value || createMultilingualText("", DEFAULT_LANGUAGE);
  
  // Get available languages
  const availableLanguages = getAvailableLanguages(multilingualValue);
  const allLanguages = availableLanguages.length > 0 ? availableLanguages : [DEFAULT_LANGUAGE];
  
  // Get content status for each language
  const contentStatus: Record<SupportedLanguage, boolean> = { en: false, te: false };
  allLanguages.forEach(lang => {
    contentStatus[lang] = hasLanguageContent(multilingualValue, lang);
  });
  
  const handleInputChange = (inputValue: string) => {
    const updatedValue = updateMultilingualText(multilingualValue, inputValue, currentLanguage);
    onChange(updatedValue as RequiredMultilingualText);
  };
  
  const handleAddLanguage = (language: SupportedLanguage) => {
    const updatedValue = updateMultilingualText(multilingualValue, "", language);
    onChange(updatedValue as RequiredMultilingualText);
    setCurrentLanguage(language);
  };
  
  const currentValue = getLocalizedText(multilingualValue, currentLanguage, DEFAULT_LANGUAGE);
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-1">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      
      <LanguageTabs
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        availableLanguages={allLanguages}
        contentStatus={contentStatus}
        onAddLanguage={handleAddLanguage}
      />
      
      <div className="space-y-2">
        <Textarea
          value={currentValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={!hasLanguageContent(multilingualValue, currentLanguage) ? 'border-yellow-300' : ''}
        />
        
        {!hasLanguageContent(multilingualValue, currentLanguage) && (
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <AlertCircle className="h-3 w-3" />
            <span>Content missing for this language</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ================================
// MULTILINGUAL ARRAY INPUT
// ================================

export const MultilingualArrayInput: React.FC<MultilingualArrayInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  className = "",
  description,
  addItemPlaceholder = "Add new item"
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [newItem, setNewItem] = useState("");
  
  // Initialize value if undefined
  const multilingualValue = value || createMultilingualArray([], DEFAULT_LANGUAGE);
  
  // Get available languages
  const availableLanguages = getAvailableLanguages(multilingualValue);
  const allLanguages = availableLanguages.length > 0 ? availableLanguages : [DEFAULT_LANGUAGE];
  
  // Get content status for each language
  const contentStatus: Record<SupportedLanguage, boolean> = { en: false, te: false };
  allLanguages.forEach(lang => {
    contentStatus[lang] = hasLanguageArrayContent(multilingualValue, lang);
  });
  
  const currentArray = getLocalizedArray(multilingualValue, currentLanguage, DEFAULT_LANGUAGE);
  
  const handleAddItem = () => {
    if (newItem.trim()) {
      const updatedArray = [...currentArray, newItem.trim()];
      const updatedValue = updateMultilingualArray(multilingualValue, updatedArray, currentLanguage);
      onChange(updatedValue as RequiredMultilingualArray);
      setNewItem("");
    }
  };
  
  const handleRemoveItem = (index: number) => {
    const updatedArray = currentArray.filter((_, i) => i !== index);
    const updatedValue = updateMultilingualArray(multilingualValue, updatedArray, currentLanguage);
    onChange(updatedValue as RequiredMultilingualArray);
  };
  
  const handleUpdateItem = (index: number, newValue: string) => {
    const updatedArray = currentArray.map((item, i) => i === index ? newValue : item);
    const updatedValue = updateMultilingualArray(multilingualValue, updatedArray, currentLanguage);
    onChange(updatedValue as RequiredMultilingualArray);
  };
  
  const handleAddLanguage = (language: SupportedLanguage) => {
    const updatedValue = updateMultilingualArray(multilingualValue, [], language);
    onChange(updatedValue as RequiredMultilingualArray);
    setCurrentLanguage(language);
  };
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-1">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      
      <LanguageTabs
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        availableLanguages={allLanguages}
        contentStatus={contentStatus}
        onAddLanguage={handleAddLanguage}
      />
      
      <div className="space-y-2">
        {/* Existing items */}
        {currentArray.length > 0 && (
          <div className="space-y-2">
            {currentArray.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => handleUpdateItem(index, e.target.value)}
                  disabled={disabled}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                  disabled={disabled}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Add new item */}
        <div className="flex items-center gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={addItemPlaceholder}
            disabled={disabled}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            disabled={disabled || !newItem.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content status indicator */}
        {!hasLanguageArrayContent(multilingualValue, currentLanguage) && (
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <AlertCircle className="h-3 w-3" />
            <span>No items added for this language</span>
          </div>
        )}
        
        {/* Items count */}
        {currentArray.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {currentArray.length} item{currentArray.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};
