// components/ui/tag-input.jsx
import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const TagInput = React.forwardRef(({ 
  value = [], 
  onChange, 
  placeholder = 'Enter codes...', 
  className,
  disabled = false,
  onValidationChange, // Callback for validation changes
  validations = {} // Accept validation status from parent
}, ref) => {
  const [inputValue, setInputValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  // Parse initial value if it's a string
  const tags = Array.isArray(value) ? value : 
               typeof value === 'string' ? value.split(',').map(tag => tag.trim()).filter(tag => tag) : 
               [];

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      onChange(newTags);
      // Notify parent about new tag that needs validation
      if (onValidationChange) {
        onValidationChange({ ...validations, [trimmedTag]: 'pending' });
      }
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    onChange(newTags);
    // Remove validation status and notify parent
    if (onValidationChange) {
      const newValidations = { ...validations };
      delete newValidations[tagToRemove];
      onValidationChange(newValidations);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove the last tag when backspace is pressed on empty input
      removeTag(tags[tags.length - 1]);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const separators = /[\n,]+/;
    const newTags = paste.split(separators).map(tag => tag.trim()).filter(tag => tag);
    
    if (newTags.length > 0) {
      const uniqueTags = [...new Set([...tags, ...newTags])];
      onChange(uniqueTags);
      // Initialize all new tags as pending validation and notify parent
      if (onValidationChange) {
        const newValidations = { ...validations };
        newTags.forEach(tag => {
          newValidations[tag] = 'pending';
        });
        onValidationChange(newValidations);
      }
      setInputValue('');
    }
  };

  const handleContainerClick = () => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  };

  return (
    <div 
      ref={ref}
      className={cn(
        "min-h-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:shadow-md transition-all duration-150",
        disabled && "bg-gray-50 cursor-not-allowed opacity-60",
        focused && "border-blue-500 ring-1 ring-blue-500",
        className
      )}
      onClick={handleContainerClick}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div className="flex flex-wrap gap-2 items-center">
        {tags.map((tag) => {
          const validationStatus = validations[tag] || 'pending';
          let tagClass = "flex items-center rounded px-2 py-1 text-sm ";
          let tagTitle = ""; // Tooltip text
          
          switch (validationStatus) {
            case 'valid':
              tagClass += "bg-blue-100 text-blue-800 border border-blue-300";
              tagTitle = "Valid code";
              break;
            case 'invalid':
              tagClass += "bg-red-100 text-red-800 border border-red-300 font-medium";
              tagTitle = "Invalid code - not found in database";
              break;
            case 'pending':
            default:
              tagClass += "bg-gray-100 text-gray-800 border border-gray-300";
              tagTitle = "Checking validity...";
              break;
          }
          
          return (
            <div key={tag} className={tagClass} title={tagTitle}>
              <span className="truncate max-w-xs">{tag}</span>
              <button
                type="button"
                className="ml-1 hover:bg-opacity-50 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onPaste={handlePaste}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-20 outline-none bg-transparent"
          disabled={disabled}
        />
      </div>
    </div>
  );
});

TagInput.displayName = 'TagInput';

export { TagInput };