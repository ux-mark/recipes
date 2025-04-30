const fs = require('fs');

describe('Recipe Utility Functions', () => {
    test('loads recipes from JSON file', () => {
        const recipes = loadRecipes('path/to/recipes.json');
        expect(recipes).toBeInstanceOf(Array);
        expect(recipes.length).toBeGreaterThan(0);
    });

    test('filters recipes by ingredient', () => {
        const recipes = loadRecipes('path/to/recipes.json');
        const filtered = filterRecipesByIngredient(recipes, 'chicken');
        expect(filtered).toBeInstanceOf(Array);
        filtered.forEach(recipe => {
            expect(recipe.ingredients).toContain('chicken');
        });
    });
});