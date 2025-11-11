'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Input } from './input'
import { Tag } from '@/types'
import { tagService } from '@/services/tagService'
import { cn } from '@/lib/utils'

interface TagsInputProps {
  value: Tag[]
  onChange: (tags: Tag[]) => void
  placeholder?: string
  className?: string
}

export function TagsInput({ value, onChange, placeholder, className }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<Tag[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedTagIds = value.map((tag) => tag.id)

  useEffect(() => {
    const searchTags = async () => {
      if (inputValue.trim().length >= 2) {
        try {
          const results = await tagService.searchTags(inputValue)
          // Filtrar tags já selecionadas
          const filtered = results.filter((tag) => !selectedTagIds.includes(tag.id))
          setSuggestions(filtered.slice(0, 10))
          setShowSuggestions(true)
        } catch (error) {
          console.error('Error searching tags:', error)
          setSuggestions([])
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }

    const timeoutId = setTimeout(searchTags, 300)
    return () => clearTimeout(timeoutId)
  }, [inputValue, selectedTagIds])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectTag = (tag: Tag) => {
    if (!selectedTagIds.includes(tag.id)) {
      onChange([...value, tag])
      setInputValue('')
      setShowSuggestions(false)
      setSelectedIndex(-1)
      inputRef.current?.focus()
    }
  }

  const handleRemoveTag = (tagId: number) => {
    onChange(value.filter((tag) => tag.id !== tagId))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && suggestions.length > 0 && selectedIndex >= 0) {
      e.preventDefault()
      handleSelectTag(suggestions[selectedIndex])
    } else if (e.key === 'Enter' && inputValue.trim() && suggestions.length > 0) {
      e.preventDefault()
      handleSelectTag(suggestions[0])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      handleRemoveTag(value[value.length - 1].id)
    }
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="flex flex-wrap gap-2 p-2 min-h-[42px] border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        {value.map((tag) => (
          <div
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-bege-medium text-brown-dark text-sm border border-brown-light"
          >
            <span>{tag.name}</span>
            {tag.category && (
              <span className="text-xs text-brown-soft">({tag.category})</span>
            )}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag.id)}
              className="ml-1 hover:bg-brown-light rounded-full p-0.5 transition-colors"
              aria-label={`Remover ${tag.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setSelectedIndex(-1)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-bege-light border border-brown-light rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((tag, index) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleSelectTag(tag)}
              className={cn(
                'w-full text-left px-4 py-2 hover:bg-bege-medium transition-colors',
                selectedIndex === index && 'bg-bege-medium'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-brown-dark font-medium">{tag.name}</span>
                <span className="text-xs text-brown-soft">{tag.category}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

