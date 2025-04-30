export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  prepTime: string;
  cookTime: string;
  servings: string;
  rating: number;
  createdDate: string;
  source: {
    name: string;
    url: string;
  };
  images: string[];
  aside?: string;
  variations?: string;
}

export interface RecipeTag {
  name: string;
  count: number;
}