import Link from 'next/link';
import { Tag } from 'lucide-react';
import { RecipeTag } from '@/lib/types';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface TagsMenuProps {
  orientation?: 'horizontal' | 'vertical';
  tags: RecipeTag[];
}

export default function TagsMenu({ orientation = 'horizontal', tags }: TagsMenuProps) {
  // If vertical orientation is requested, show tags as a list
  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <Tag className="mr-2 h-4 w-4" />
          Categories
        </h3>
        <Separator />
        <div className="flex flex-col gap-2 ml-1">
          {tags.map((tag) => (
            <Link
              key={tag.name}
              href={`/tags/${encodeURIComponent(tag.name)}`}
              className="text-sm hover:text-primary-500 transition-colors"
            >
              {tag.name} <span className="text-neutral-400">({tag.count})</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  
  // Default horizontal orientation with dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-1">
          <Tag className="h-4 w-4 mr-1" />
          Categories
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {tags.map((tag) => (
          <DropdownMenuItem key={tag.name} asChild>
            <Link href={`/tags/${encodeURIComponent(tag.name)}`} className="flex justify-between">
              <span>{tag.name}</span>
              <span className="text-neutral-400">({tag.count})</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}