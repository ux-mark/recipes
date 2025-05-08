const { render, screen } = require('@testing-library/react');
const RecipeCard = require('../../components/recipe-card');

test('renders Recipe Card with correct data', () => {
    const recipe = {
        title: 'Test Recipe',
        image: 'test-image.jpg',
        description: 'This is a test recipe description.',
    };

    render(<RecipeCard recipe={recipe} />);
    
    const titleElement = screen.getByText(/Test Recipe/i);
    const descriptionElement = screen.getByText(/This is a test recipe description./i);
    
    expect(titleElement).toBeInTheDocument();
    expect(descriptionElement).toBeInTheDocument();
});