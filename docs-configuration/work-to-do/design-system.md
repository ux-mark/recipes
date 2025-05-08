# Recipe Website Design System

## Overview

This document outlines the requirements and implementation plan for a centralized design system for the recipe website. The design system will be hidden behind an environment flag and will serve as a comprehensive catalog of all UI components used across the site.

## Goals

1. Create a unified design language for the entire recipe website
2. Document all UI components in a central location
3. Provide a playground for component testing and iteration
4. Allow for style changes to be made centrally and propagated throughout the site
5. Improve development velocity and consistency
6. Facilitate better collaboration between designers and developers

## Technical Requirements

### Environment Flag Setup

- Implement an environment variable (e.g., `ENABLE_DESIGN_SYSTEM=true`) to control access
- Configure this in both local development and production environments
- Add middleware to prevent unauthorized access in production

### Directory Structure

```
/design-system
  /pages
    /index.tsx       # Main entry point
    /components.tsx  # Component catalog
    /styles.tsx      # Typography, colors, spacing
    /tokens.tsx      # Design tokens documentation
  /components
    /ComponentPreview.tsx  # For displaying component examples
    /ColorPalette.tsx      # For displaying color tokens
    /Typography.tsx        # For displaying typography styles
  /lib
    /hooks           # Design system specific hooks
    /context         # Context providers for the design system
  /styles
    /tokens.ts       # Design tokens definition
```

### Component Documentation Requirements

For each component, document:

1. **Purpose**: What the component is for and when to use it
2. **Props**: All available props with types and descriptions
3. **Variants**: Different states and configurations
4. **Code Example**: Usage examples
5. **Accessibility**: ARIA roles, keyboard navigation, etc.
6. **Related Components**: Similar components or ones often used together

## Components to Document (Initial Phase)

Based on the existing project structure using shadcn UI components, document these components:

1. **Base Components**
   - Button (variants: default, destructive, outline, ghost, link)
   - Card and its subcomponents (CardHeader, CardContent, CardFooter)
   - Dialog (modal windows)
   - DropdownMenu (used for tags navigation)
   - Sheet (used for mobile navigation)
   - Input and Textarea
   - Avatar
   - Separator

2. **Custom Components**
   - Recipe Card (from /components/recipe-card.tsx)
   - Site Header (from /components/site-header.tsx) 
   - Tags Menu (from /components/tags-menu.tsx)
   - Site Footer (from /components/site-footer.tsx)

3. **Layout & Typography**
   - Text styles and headings
   - Layout containers and spacing system
   - Color system

## Implementation Plan

### Phase 1: Foundation

1. Create the `/design-system` directory with the basic structure
2. Implement the environment flag protection
3. Set up the main layout and navigation within the design system
4. Document design tokens (colors, typography, spacing, etc.)

### Phase 2: Component Documentation

1. Catalog existing components from the codebase
2. Create documentation pages for each component category
3. Implement interactive examples
4. Add code snippets and usage guidelines

### Phase 3: Integration & Tooling

1. Link the design system to the actual components (not duplicates)
2. Add component search and filtering functionality
3. Implement visual testing tools
4. Add theme switching capabilities for testing

## Technical Implementation Details

### Environment Flag Integration

Add to `.env.local` and `.env`:
```
ENABLE_DESIGN_SYSTEM=true
```

Update middleware to check for this flag:

```typescript
// Middleware route protection logic
if (pathname.startsWith('/design-system')) {
  const enableDesignSystem = process.env.ENABLE_DESIGN_SYSTEM === 'true';
  
  if (!enableDesignSystem) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  // In production, could add additional auth requirements
  if (process.env.NODE_ENV === 'production') {
    // Additional authentication logic here
  }
}
```

### Component Integration Strategy

1. **shadcn UI Components**: Document how our site uses shadcn UI components from `/components/ui/*` and their configuration in `components.json`
2. **Style Variants**: Document the custom variants used in the project (like button variants: default, destructive, outline, etc.)
3. **Tailwind Theming**: Show how our Tailwind theme connects with shadcn UI theming system and CSS variables
4. **Custom Components**: Document how custom components extend shadcn UI primitives
5. **Props Documentation**: Use TypeScript types to automatically generate props documentation where possible

## Future Enhancements

1. Theme switcher to preview components in different themes
2. Responsive testing tools to view components at various screen sizes
3. Automated visual regression testing
4. Performance metrics for each component
5. Version history to track component changes
6. Integration with design tools (Figma, Sketch, etc.)

## Resources & References

- [Storybook](https://storybook.js.org/) - For inspiration on component documentation
- [shadcn UI](https://ui.shadcn.com/) - For component implementation and documentation approach
- [Radix UI](https://www.radix-ui.com/) - For understanding the primitives that power our components
- [Tailwind CSS](https://tailwindcss.com/) - For styling conventions and design tokens
- [Next.js Docs](https://nextjs.org/docs) - For integration with Next.js

## Next Steps

1. Create the basic directory structure for the design system
2. Implement the environment flag protection
3. Document the core design tokens (colors, typography, etc.)
4. Begin documenting the most frequently used components