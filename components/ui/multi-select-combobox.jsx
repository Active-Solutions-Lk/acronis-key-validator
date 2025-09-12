// components/ui/multi-select-combobox.jsx
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { X, ChevronDown, Check, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const VirtualizedList = React.memo(({ 
  items, 
  height = 200, 
  itemHeight = 32, 
  onSelect, 
  selectedValues = []
}) => {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef()

  const visibleItems = useMemo(() => {
    const containerHeight = height
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    )

    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index
    }))
  }, [items, scrollTop, itemHeight, height])

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item) => {
          const isSelected = selectedValues.includes(item.value)
          return (
            <div
              key={item.value}
              className={cn(
                "absolute w-full px-2 py-1 cursor-pointer hover:bg-gray-100 flex items-center justify-between transition-colors duration-150",
                isSelected && "bg-blue-50 text-blue-600"
              )}
              style={{
                top: item.index * itemHeight,
                height: itemHeight
              }}
              onClick={() => onSelect(item.value)}
            >
              <div className="flex items-center">
                <div className={cn(
                  "w-4 h-4 mr-2 border rounded flex items-center justify-center",
                  isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                )}>
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="truncate">{item.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const MultiSelectCombobox = React.memo(({
  cities = [],
  value = [],
  onValueChange,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  virtualizeOptions = false,
  searchDebounceMs = 200,
  className,
  disabled = false
}) => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const debouncedSearch = useDebounce(searchValue, searchDebounceMs)
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Normalize data structure
  const normalizedOptions = useMemo(() => {
    if (!Array.isArray(cities)) return []
    
    return cities.map(city => {
      if (typeof city === 'string') {
        return { value: city, label: city }
      }
      return {
        value: city.value || city.id || city,
        label: city.label || city.name || city.value || city.id || city
      }
    })
  }, [cities])

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!debouncedSearch.trim()) return normalizedOptions
    
    const searchLower = debouncedSearch.toLowerCase()
    return normalizedOptions.filter(option =>
      option.label.toLowerCase().includes(searchLower) ||
      option.value.toString().toLowerCase().includes(searchLower)
    )
  }, [normalizedOptions, debouncedSearch])

  // Get selected options display
  const selectedOptions = useMemo(() => {
    return normalizedOptions.filter(option => value.includes(option.value))
  }, [normalizedOptions, value])

  const handleSelect = useCallback((selectedValue) => {
    const newValues = value.includes(selectedValue)
      ? value.filter(v => v !== selectedValue)
      : [...value, selectedValue]
    
    onValueChange?.(newValues)
  }, [value, onValueChange])

  const handleRemove = useCallback((removedValue, e) => {
    e.stopPropagation()
    const newValues = value.filter(v => v !== removedValue)
    onValueChange?.(newValues)
  }, [value, onValueChange])

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setOpen(prev => !prev)
      if (!open) {
        // Focus search input when opening
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 50)
      }
    }
  }, [disabled, open])

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
        setSearchValue('')
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setOpen(false)
      setSearchValue('')
    }
  }, [])

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Selected values display */}
      <div
        className={cn(
          "w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:shadow-md transition-all duration-150 min-h-10",
          disabled && "bg-gray-50 cursor-not-allowed opacity-60",
          open && "border-blue-500 ring-1 ring-blue-500"
        )}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {selectedOptions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.map((option) => (
              <div 
                key={option.value} 
                className="flex items-center bg-blue-100 text-blue-800 rounded px-2 py-1 text-sm"
              >
                <span className="truncate max-w-xs">{option.label}</span>
                <button
                  type="button"
                  className="ml-1 hover:bg-blue-200 rounded-full"
                  onClick={(e) => handleRemove(option.value, e)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform duration-150",
              open && "rotate-180"
            )}
          />
        </div>
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden">
          {/* Search Input */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 text-gray-400 transform -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          {/* Options List */}
          {filteredOptions.length > 0 ? (
            virtualizeOptions && filteredOptions.length > 100 ? (
              <VirtualizedList
                items={filteredOptions}
                onSelect={handleSelect}
                selectedValues={value}
                height={200}
                itemHeight={32}
              />
            ) : (
              <div className="max-h-48 overflow-auto py-1">
                {filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value)
                  return (
                    <div
                      key={option.value}
                      className={cn(
                        "px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center transition-colors duration-150",
                        isSelected && "bg-blue-50 text-blue-600"
                      )}
                      onClick={() => handleSelect(option.value)}
                    >
                      <div className="flex items-center">
                        <div className={cn(
                          "w-4 h-4 mr-2 border rounded flex items-center justify-center",
                          isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="truncate">{option.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  )
})

MultiSelectCombobox.displayName = 'MultiSelectCombobox'
VirtualizedList.displayName = 'VirtualizedList'

export { MultiSelectCombobox }