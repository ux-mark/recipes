'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

// Common recipe tags for suggestions
const SUGGESTED_TAGS = [
  'breakfast', 'lunch', 'dinner', 'dessert', 'snack',
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free',
  'quick', 'easy', 'healthy', 'comfort-food',
  'italian', 'mexican', 'asian', 'mediterranean', 'american',
  'baking', 'grilling', 'slow-cooker', 'instant-pot',
  'soup', 'salad', 'pasta', 'bread', 'chicken', 'beef', 'seafood',
  'holiday', 'seasonal', 'low-carb', 'high-protein'
];

export function TagSelector({ selectedTags = [], onChange }: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  
  // Initialize available tags
  useEffect(() => {
    // Get tags that aren't already selected
    const notSelected = SUGGESTED_TAGS.filter(tag => !selectedTags.includes(tag));
    setAvailableTags(notSelected);
  }, [selectedTags]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setNewTag(value);
    
    if (value) {
      // Filter suggestions based on input
      const filtered = availableTags.filter(tag => 
        tag.toLowerCase().includes(value)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  // Add a new tag
  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    
    const normalizedTag = tag.trim().toLowerCase();
    
    // Check if tag already exists
    if (selectedTags.includes(normalizedTag)) return;
    
    const updatedTags = [...selectedTags, normalizedTag];
    onChange(updatedTags);
    setNewTag('');
    setShowSuggestions(false);
  };
  
  // Remove a tag
  const removeTag = (index: number) => {
    const updatedTags = selectedTags.filter((_, i) => i !== index);
    onChange(updatedTags);
  };
  
  // Handle form submission - now handling as a regular div with button click
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault(); // Still prevent default behavior
    addTag(newTag);
  };
  
  return (
    <div className="space-y-4">
      {/* Changed from form to div to avoid nested forms */}
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            value={newTag}
            onChange={handleInputChange}
            placeholder="Add a tag..."
            className="w-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(newTag);
              }
            }}
          />
          
          {/* Tag suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white mt-1 border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredSuggestions.map((tag) => (
                <div
                  key={tag}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    addTag(tag);
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button type="button" onClick={handleAddTag}>Add</Button>
      </div>
      
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag, index) => (
          <div
            key={index}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      
      {/* Suggested tags */}
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Suggested tags:</h3>
        <div className="flex flex-wrap gap-2">
          {availableTags.slice(0, 12).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}