# Recipe Edit Interface Documentation

This document explains how to use the recipe edit interface feature of the Fairy Bites website.

## Enabling the Edit Interface

The recipe edit interface is protected by a feature flag to prevent unauthorized access. To enable it:

1. Create a `.env.local` file in the root directory (if it doesn't exist already)
2. Add the following environment variable:
   ```
   EDIT_INTERFACE=1
   ```
3. Restart the application for the changes to take effect

When the edit interface is enabled, you'll see an "Edit" link in the navigation bar and edit buttons on recipe pages.

## Accessing the Edit Interface

Once enabled, you can access the recipe management features in several ways:

- Click the "Edit" link in the main navigation menu
- Click the "Edit Recipe" button on any recipe detail page
- Navigate directly to `/admin/recipes`

## Managing Recipes

### Recipe List

The recipe management dashboard at `/admin/recipes` provides an overview of all recipes and allows you to:

- Search for recipes by name
- Create new recipes
- Edit existing recipes

### Creating a Recipe

To create a new recipe:

1. Click "Create New Recipe" from the recipe management dashboard
2. Fill in the recipe details in the form that appears
3. Click "Save Recipe" to save your new recipe

The recipe form includes fields for all recipe attributes including:
- Basic information (name, description, prep time, etc.)
- Ingredients
- Instructions
- Images
- Tags
- Source information
- Rating

### Editing a Recipe

To edit an existing recipe:

1. Find the recipe in the recipe management dashboard
2. Click the "Edit" button for that recipe
3. Make your changes in the form
4. Click "Save Recipe" to update the recipe

### Deleting a Recipe

To delete a recipe:

1. Navigate to the edit page for the recipe
2. Click the "Delete Recipe" button at the top of the page
3. Confirm the deletion in the confirmation dialog

⚠️ **Warning**: Recipe deletion is permanent and cannot be undone.

## Working with Recipe Images

### Adding Images

You can add images to a recipe during creation or editing:

1. Navigate to the "Images" section of the recipe form
2. Click "Select Images" to open the file browser
3. Select one or more image files to upload
4. The images will be uploaded and displayed in the form

The first image in the list will be used as the main image for the recipe in listings and cards.

### Removing Images

To remove an image from a recipe:

1. Hover over the image in the recipe form
2. Click the "×" button that appears in the top-right corner of the image
3. The image will be removed from the recipe and deleted from storage

## Autosave Feature

The recipe editor includes an autosave feature that saves drafts while you work:

- Drafts are saved automatically every 30 seconds
- Drafts are stored in your browser's local storage
- If you leave the page and return, you'll be prompted to restore your draft

## Best Practices

- **Image optimization**: The system automatically creates optimized versions of uploaded images for different screen sizes
- **Tags**: Use consistent tags to help with recipe organization and discovery
- **Detailed instructions**: Break down recipe instructions into clear, distinct steps
- **Mobile preview**: Test how recipes look on mobile devices as well as desktop

## Troubleshooting

If you encounter issues with the recipe edit interface:

1. Verify that `EDIT_INTERFACE=1` is set in your environment variables
2. Check the browser console for any error messages
3. Ensure you have proper permissions to write to the recipe data file

### Common Console Errors

#### Vercel Analytics Script Error

If you see the following errors in your browser console:

```
Failed to load resource: the server responded with a status of 404 (Not Found) (script.js, line 0)
[Vercel Web Analytics] Failed to load script from /_vercel/insights/script.js
```

This is normal during local development and can be safely ignored. The error occurs because:

- Vercel Web Analytics is configured for your production deployment
- The analytics script doesn't exist in your local development environment
- This error doesn't affect any functionality of your application

If you want to eliminate this error during local development, you have two options:

1. **Disable analytics locally**: Add a condition in your layout file to only include analytics in production
2. **Set up Vercel Analytics locally**: Follow the [Vercel Analytics documentation](https://vercel.com/docs/analytics/quickstart) if you need analytics during development

## Security Considerations

The edit interface is intended for use by authorized content administrators only. Always use secure, random passwords and consider implementing additional authentication if deploying in a public environment.