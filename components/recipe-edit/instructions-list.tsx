'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useRef } from 'react';

interface InstructionsListProps {
  instructions: string[];
  onChange: (instructions: string[]) => void;
  error?: string;
}

export function InstructionsList({ instructions, onChange, error }: InstructionsListProps) {
  const addInstruction = () => {
    onChange([...instructions, '']);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    onChange(newInstructions);
  };

  const removeInstruction = (index: number) => {
    const newInstructions = [...instructions];
    newInstructions.splice(index, 1);
    
    // Always keep at least one instruction field
    if (newInstructions.length === 0) {
      newInstructions.push('');
    }
    
    onChange(newInstructions);
  };

  const moveInstruction = (fromIndex: number, toIndex: number) => {
    const newInstructions = [...instructions];
    const [movedItem] = newInstructions.splice(fromIndex, 1);
    newInstructions.splice(toIndex, 0, movedItem);
    onChange(newInstructions);
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      
      <div className="space-y-4">
        {instructions.map((instruction, index) => (
          <SimpleInstruction
            key={index}
            index={index}
            instruction={instruction}
            onChange={(value) => updateInstruction(index, value)}
            onRemove={() => removeInstruction(index)}
            onMoveUp={index > 0 ? () => moveInstruction(index, index - 1) : undefined}
            onMoveDown={index < instructions.length - 1 ? () => moveInstruction(index, index + 1) : undefined}
          />
        ))}
      </div>
      
      <Button 
        type="button" 
        onClick={addInstruction}
        variant="outline"
        className="mt-2"
      >
        Add Instruction
      </Button>
    </div>
  );
}

interface SimpleInstructionProps {
  index: number;
  instruction: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function SimpleInstruction({ 
  index, 
  instruction, 
  onChange, 
  onRemove,
  onMoveUp,
  onMoveDown 
}: SimpleInstructionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  return (
    <div className="flex gap-2">
      <div className="self-start mt-2 flex flex-col items-center">
        <div className="text-gray-500 font-semibold mb-1">#{index + 1}</div>
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
      
      <div className="flex-grow">
        <Textarea
          ref={textareaRef}
          value={instruction}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter instruction step"
          className="w-full min-h-[100px]"
        />
      </div>
      
      <Button 
        type="button" 
        onClick={onRemove}
        variant="ghost"
        className="text-red-500 self-start"
      >
        &times;
      </Button>
    </div>
  );
}