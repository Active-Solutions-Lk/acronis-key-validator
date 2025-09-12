// components/ui/combobox.jsx
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const VirtualizedList = React.memo(({ 
  items, 
  height = 200, 
  itemHeight = 32, 
  onSelect, 
  selectedValue 
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
        {visibleItems.map((item) => (
          <div
            key={item.value}
            className={cn(
              "absolute w-full px-2 py-1 cursor-pointer hover:bg-gray-100 flex items-center justify-between transition-colors duration-150",
              selectedValue === item.value && "bg-blue-50 text-blue-600"
            )}
            style={{
              top: item.index * itemHeight,
              height: itemHeight
            }}
            onClick={() => onSelect(item.value)}
          >
            <span className="truncate">{item.label}</span>
            {selectedValue === item.value && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </div>
        ))}
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

const Combobox = React.memo(({
  cities = [],
  value = '',
  onValueChange,
  placeholder = 'Select option...',
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

  // Get selected option display
  const selectedOption = useMemo(() => {
    return normalizedOptions.find(option => option.value === value)
  }, [normalizedOptions, value])

  const handleSelect = useCallback((selectedValue) => {
    onValueChange?.(selectedValue)
    setOpen(false)
    setSearchValue('')
  }, [onValueChange])

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
      <button
        type="button"
        className={cn(
          "w-full px-3 py-2 text-left text-gray-800 border border-gray-300 rounded-md  bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:shadow-md focus:outline-none transition-all duration-150",
          disabled && "bg-gray-50 cursor-not-allowed opacity-60",
          open && "border-blue-500 ring-1 ring-blue-500"
        )}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="flex items-center justify-between">
          <span className={cn(
            "block truncate",
            !selectedOption && "text-gray-500"
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform duration-150",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden">
          {/* Search Input */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 text-gray-900 transform -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full pl-8 pr-2 py-1 text-sm border text-gray-900 border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
                selectedValue={value}
                height={200}
                itemHeight={32}
              />
            ) : (
              <div className="max-h-48 overflow-auto py-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-500 flex items-center justify-between transition-colors duration-150",
                      value === option.value && "bg-blue-50 text-gray-600"
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && (
                      <Check className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                ))}
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

Combobox.displayName = 'Combobox'
VirtualizedList.displayName = 'VirtualizedList'

export { Combobox }