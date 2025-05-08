# Design System Architectural Overview

## Introduction

The design system for the Recipe Website provides a comprehensive and unified approach to UI components and visual styling. It serves as a central reference and playground for all UI elements used across the application, ensuring consistency, accessibility, and ease of development.

## Architecture

### Core Structure

The design system is implemented as a dedicated section within the Next.js application, located at `/app/design-system`. It follows the App Router pattern with the following key structure:

```
/app/design-system/
  ├── layout.tsx              # Main wrapper layout with navigation
  ├── page.tsx                # Overview landing page
  ├── components/             # Component documentation
  │   ├── layout.tsx          # Component section layout
  │   ├── page.tsx            # Components index page
  │   ├── button/             # Button component docs
  │   ├── input/              # Input component docs
  │   ├── header-navigation/  # Header navigation docs
  │   └── recipe-card/        # Recipe card docs
  ├── styles/                 # Typography and style patterns
  │   └── page.tsx
  └── tokens/                 # Design tokens and variables
      └── page.tsx
```

### Component Architecture

The design system is built on a two-tier component architecture:

1. **Base Components (UI Primitives)** - Located in `/components/ui/`
   - Built using Radix UI primitives for accessibility and functionality
   - Styled with Tailwind CSS for consistent design language
   - Each component follows a modular pattern with clearly defined interfaces
   - Examples include Button, Card, Dialog, Sheet, Input

2. **Composite Components** - Located in `/components/`
   - Composed using the base UI components
   - Implement specific application features and functionality
   - Examples include SiteHeader, TagsMenu, RecipeCard

### Styling and Theme System

The design system uses a token-based approach to styling:

1. **Design Tokens**
   - Defined in `app/globals.css` as CSS custom properties
   - Mapped to Tailwind theme in `tailwind.config.js`
   - Includes light and dark mode variants

2. **Color System**
   - Primary palette: Red-based (e63946) with multiple shades
   - Secondary palette: Blue-based (1d3557) with multiple shades
   - Accent palette: Blue-tinted (457b9d)
   - Semantic colors: background, foreground, card, muted, etc.

3. **Typography System**
   - Font families: Inter (sans) and Playfair Display (serif)
   - Consistent type scale using Tailwind's size classes
   - Defined text styles for headings, body text, and UI elements

### Feature Flag System

The design system is protected behind a feature flag to control access:

1. **Environment Variable Control**
   - `ENABLE_DESIGN_SYSTEM=true` controls visibility
   - Checked in middleware to restrict access in production

2. **Client-Side Flag Detection**
   - `isDesignSystemEnabled` state in components like SiteHeader
   - API endpoint `/api/status` provides feature flag status

## Component Details

### UI Primitives

1. **Button (`components/ui/button.tsx`)**
   - Variants: default, destructive, outline, ghost, link
   - Sizes: default, sm, lg, icon
   - Uses class-variance-authority for variant styling
   - Supports asChild prop for polymorphic rendering

2. **Card (`components/ui/card.tsx`)**
   - Compound component with CardHeader, CardTitle, CardDescription, CardContent, CardFooter
   - Flexible layout system for content organization
   - Consistent styling with rounded corners and subtle shadows

3. **Dialog (`components/ui/dialog.tsx`)**
   - Modal windows with focus management
   - Accessible overlay, header, content, and footer components
   - Built on Radix UI Dialog primitive

4. **Sheet (`components/ui/sheet.tsx`)**
   - Slide-out panel UI with multiple position options
   - Used for mobile navigation and contextual panels
   - Variants for side positions: left, right, top, bottom

5. **DropdownMenu (`components/ui/dropdown-menu.tsx`)**
   - Multi-level dropdown menus
   - Support for checkboxes, radio items, and sub-menus
   - Used for navigation, filters, and action menus

6. **Input (`components/ui/input.tsx`)**
   - Consistent form input styling
   - Supports all HTML input attributes
   - Accessible states for focus, invalid, disabled

7. **Avatar (`components/ui/avatar.tsx`)**
   - Image representation with fallback support
   - Built on Radix UI Avatar primitive
   - Consistent sizing and styling

8. **Separator (`components/ui/separator.tsx`)**
   - Horizontal and vertical dividers
   - Accessible with proper ARIA roles
   - Consistent styling with theme colors

### Custom Components

1. **SiteHeader**
   - Main navigation component with responsive design
   - Integrates Sheet component for mobile navigation
   - Includes feature flag detection for admin features

2. **TagsMenu**
   - Provides filtering by recipe tags
   - Uses DropdownMenu for desktop and vertical list for mobile
   - Dynamically populated from content

3. **RecipeCard**
   - Displays recipe preview information
   - Uses Card component with custom styling
   - Consistent image handling and information display

## Integration with Tailwind CSS

The design system leverages Tailwind CSS for styling with several key configuration points:

1. **Tailwind Configuration**
   - Extended theme in `tailwind.config.js`
   - Custom colors mapped to design tokens
   - Border radius, shadows, and other properties standardized

2. **CSS Variables**
   - Design tokens defined in `app/globals.css`
   - Dark mode support via class-based theme switching
   - Token naming follows consistent pattern

3. **Utility Classes**
   - Uses Tailwind's utility-first approach
   - Custom utilities defined for specific patterns
   - Consistent class naming conventions

## Accessibility Features

The design system prioritizes accessibility through:

1. **Keyboard Navigation**
   - All interactive elements fully keyboard accessible
   - Focus management in dialogs and modals
   - Visible focus indicators

2. **ARIA Support**
   - Proper ARIA roles, states, and properties
   - Screen reader announcements for dynamic content
   - Leverages Radix UI's accessibility features

3. **Color Contrast**
   - Meets WCAG 2.1 AA standards for text contrast
   - Distinct focus and interactive states
   - Non-reliance on color alone for information

## Future Enhancements

1. Theme switcher to preview components in different themes
2. Responsive testing tools to view components at various screen sizes
3. Automated visual regression testing
4. Performance metrics for each component
5. Version history to track component changes
6. Integration with design tools (Figma, Sketch)

## References and Resources

- [shadcn UI](https://ui.shadcn.com/) - Component implementation approach
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Next.js App Router](https://nextjs.org/docs/app) - Routing and layout structure