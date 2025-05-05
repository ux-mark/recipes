'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRef } from 'react';

interface IngredientsListProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
  error?: string;
}

export function IngredientsList({ ingredients, onChange, error }: IngredientsListProps) {
  const addIngredient = () => {
    onChange([...ingredients, '']);
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    onChange(newIngredients);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    
    // Always keep at least one ingredient field
    if (newIngredients.length === 0) {
      newIngredients.push('');
    }
    
    onChange(newIngredients);
  };

  const moveIngredient = (fromIndex: number, toIndex: number) => {
    const newIngredients = [...ingredients];
    const [movedItem] = newIngredients.splice(fromIndex, 1);
    newIngredients.splice(toIndex, 0, movedItem);
    onChange(newIngredients);
  };

  return (
    <div className="space-y-2">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      
      <div className="space-y-2">
        {ingredients.map((ingredient, index) => (
          <SimpleIngredient
            key={index}
            index={index}
            ingredient={ingredient}
            onChange={(value) => updateIngredient(index, value)}
            onRemove={() => removeIngredient(index)}
            onMoveUp={index > 0 ? () => moveIngredient(index, index - 1) : undefined}
            onMoveDown={index < ingredients.length - 1 ? () => moveIngredient(index, index + 1) : undefined}
          />
        ))}
      </div>
      
      <Button 
        type="button" 
        onClick={addIngredient}
        variant="outline"
        className="mt-2"
      >
        Add Ingredient
      </Button>
    </div>
  );
}

interface SimpleIngredientProps {
  index: number;
  ingredient: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function SimpleIngredient({ 
  ingredient, 
  onChange, 
  onRemove,
  onMoveUp,
  onMoveDown 
}: SimpleIngredientProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col">
        {onMoveUp && (
          <button 
            type="button" 
            onClick={onMoveUp}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Move up"
          >
            ▲
          </button>
        )}
        {onMoveDown && (
          <button 
            type="button" 
            onClick={onMoveDown}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Move down"
          >
            ▼
          </button>
        )}
      </div>
      
      <Input
        ref={inputRef}
        value={ingredient}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter ingredient"
        className="flex-grow"
      />
      
      <Button 
        type="button" 
        onClick={onRemove}
        variant="ghost"
        className="text-red-500"
      >
        &times;
      </Button>
    </div>
  );
}