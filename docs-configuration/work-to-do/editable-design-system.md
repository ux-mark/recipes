# Design System Edit Interface Specification

This document outlines the requirements and technical specifications for implementing an editable design system interface for the FairyBites recipe website. The interface will enable real-time modification of design tokens, component styles, and visual properties while maintaining consistency across the application.

## 1. Overview & Objectives

### Purpose
Create a comprehensive editing interface for the design system that allows developers and designers to:
- Modify design tokens and see changes applied in real-time
- Adjust component styles and behaviors
- Ensure visual consistency across the application
- Document component usage and variations

### Integration with Existing Design System
The editing interface will integrate with the existing design system structure defined in `/docs-configuration/design-system-overview.md` and leverage the current component architecture:
- Base Components (UI Primitives) in `/components/ui/`
- Composite Components in `/components/`

## 2. Token Value Management System

### Requirements

#### 2.1 Color Token Management
| Feature | Description | UI Control | Value Constraints |
|---------|-------------|------------|-------------------|
| Primary Color Palette | Edit primary color values and variants | Color picker with hex/RGB/HSL inputs | Valid CSS color values |
| Secondary Color Palette | Edit secondary color values and variants | Color picker with hex/RGB/HSL inputs | Valid CSS color values |
| Accent Color Palette | Edit accent color values and variants | Color picker with hex/RGB/HSL inputs | Valid CSS color values |
| Semantic UI Colors | Edit semantic colors (background, foreground, etc.) | Color picker with relation visualization | Valid CSS color values |
| Dark Mode Colors | Edit dark mode color variants | Toggle between light/dark preview | Valid CSS color values |

#### 2.2 Typography Token Management
| Feature | Description | UI Control | Value Constraints |
|---------|-------------|------------|-------------------|
| Font Families | Edit font family stacks | Dropdown with preview | Web-safe or imported fonts |
| Font Sizes | Edit font size scale | Slider with numeric input | 0.5rem to 4rem |
| Font Weights | Edit font weight values | Dropdown with preview | 100-900 standard weights |
| Line Heights | Edit line height values | Slider with numeric input | 1-2.5 range |

#### 2.3 Spacing Token Management
| Feature | Description | UI Control | Value Constraints |
|---------|-------------|------------|-------------------|
| Spacing Scale | Edit spacing values (xs, sm, md, lg, xl) | Slider with visualization | 0.25rem to 5rem |
| Container Padding | Edit container padding values | Slider with visualization | 0.5rem to 4rem |
| Component Spacing | Edit default component margins/paddings | Slider with visualization | 0.25rem to 3rem |

#### 2.4 Border & Radius Token Management
| Feature | Description | UI Control | Value Constraints |
|---------|-------------|------------|-------------------|
| Border Radius | Edit border radius values | Slider with visualization | 0px to 2rem |
| Border Width | Edit border width values | Slider with visualization | 0px to 8px |
| Border Colors | Edit border colors | Color picker | Valid CSS color values |

#### 2.5 Shadow Token Management
| Feature | Description | UI Control | Value Constraints |
|---------|-------------|------------|-------------------|
| Box Shadows | Edit box shadow values | Multi-control input with preview | Valid CSS shadow values |

### Implementation Details

The Token Manager will:
1. Parse values from existing CSS variables in `app/globals.css`
2. Generate a UI for editing each token type
3. Apply changes in real-time via CSS variable updates
4. Save changes to the appropriate files
5. Generate documentation reflecting changes

**Code Example: Token Value Editor Component**
```tsx
// Token editor component structure
interface TokenEditorProps {
  tokenName: string;
  tokenValue: string;
  tokenType: 'color' | 'size' | 'spacing' | 'typography' | 'shadow';
  onChange: (newValue: string) => void;
}

function TokenEditor({ 
  tokenName, 
  tokenValue, 
  tokenType, 
  onChange 
}: TokenEditorProps) {
  // Render appropriate editor based on tokenType
  return (
    <div className="token-editor">
      <label>{tokenName}</label>
      {tokenType === 'color' && <ColorPicker value={tokenValue} onChange={onChange} />}
      {tokenType === 'size' && <SizeSlider value={tokenValue} onChange={onChange} />}
      {/* Additional editor types */}
    </div>
  );
}
```

## 3. Style Management Interface

### Requirements

#### 3.1 Global Style Management
| Feature | Description | UI Control | Value Constraints |
|---------|-------------|------------|-------------------|
| Theme Toggling | Toggle between light/dark mode | Switch | Boolean |
| CSS Variable Preview | View all CSS variables in context | Searchable table | Read-only with edit actions |
| Typography Preview | Preview text styles | Interactive text samples | - |
| Color Palette Viewer | View color relationships | Color grid with contrast ratios | - |

#### 3.2 CSS Class Management
| Feature | Description | UI Control | Value Constraints |
|---------|-------------|------------|-------------------|
| Tailwind Class Explorer | View and edit Tailwind classes | Searchable interface with toggles | Valid Tailwind classes |
| Class Composition | Create and save class combinations | Multi-select with preview | Valid class combinations |
| Visual Rule Editor | Edit CSS rules visually | Property-value interface | Valid CSS rules |

### Implementation Details

The Style Manager will:
1. Generate a visual representation of all styles in the system
2. Allow direct editing of Tailwind configuration values
3. Provide real-time preview of style changes
4. Update relevant files (globals.css, tailwind.config.js)

**Code Example: Style Manager Interface**
```tsx
function StyleManager() {
  const [activeTab, setActiveTab] = useState('colors');
  
  return (
    <div className="style-manager">
      <nav className="tabs">
        <button 
          className={activeTab === 'colors' ? 'active' : ''} 
          onClick={() => setActiveTab('colors')}
        >
          Colors
        </button>
        <button 
          className={activeTab === 'typography' ? 'active' : ''} 
          onClick={() => setActiveTab('typography')}
        >
          Typography
        </button>
        {/* Additional tabs */}
      </nav>
      
      <div className="tab-content">
        {activeTab === 'colors' && <ColorPaletteEditor />}
        {activeTab === 'typography' && <TypographyEditor />}
        {/* Additional tab content */}
      </div>
    </div>
  );
}
```

## 4. Component Edit Interface

### Base Component Editors

#### 4.1 Button Editor
| Property | Description | UI Control | Value Constraints |
|----------|-------------|------------|-------------------|
| Variant | Edit button variant styles | Dropdown (default, destructive, outline, ghost, link) | Predefined variants |
| Size | Edit button sizes | Dropdown (default, sm, lg, icon) | Predefined sizes |
| States | Edit hover, focus, active states | State toggle with property editor | Valid CSS values |
| Icon Position | Configure icon placement | Toggle (left, right) | Left/right |
| Border Radius | Adjust button corners | Slider | 0px to button height/2 |
| Typography | Edit text styles | Typography controls | Font properties |

#### 4.2 Card Editor
| Property | Description | UI Control | Value Constraints |
|----------|-------------|------------|-------------------|
| Border | Edit card border styles | Border controls | Valid border values |
| Shadow | Edit card shadow | Shadow controls | Valid shadow values |
| Padding | Edit internal spacing | Spacing controls | Valid spacing values |
| Background | Edit card background | Color picker | Valid color values |
| Radius | Edit corner radius | Slider | 0px to 2rem |

**Subcomponents:** CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction

#### 4.3 Dialog Editor
| Property | Description | UI Control | Value Constraints |
|----------|-------------|------------|-------------------|
| Size | Edit dialog size | Width/height controls | Valid size values |
| Overlay | Edit overlay appearance | Color picker with opacity | Valid color with opacity |
| Animation | Edit open/close animations | Animation controls | Valid animation values |

**Subcomponents:** DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription

#### 4.4 Sheet Editor
| Property | Description | UI Control | Value Constraints |
|----------|-------------|------------|-------------------|
| Position | Edit sheet position | Dropdown (left, right, top, bottom) | Predefined positions |
| Width/Height | Edit sheet dimensions | Size controls | Valid size values |
| Animation | Edit slide animations | Animation controls | Valid animation values |

**Subcomponents:** SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription

#### 4.5 DropdownMenu Editor
| Property | Description | UI Control | Value Constraints |
|----------|-------------|------------|-------------------|
| Item Styles | Edit dropdown item styles | Property editor | Valid CSS values |
| Animation | Edit open/close animations | Animation controls | Valid animation values |
| Position | Configure menu positioning | Position controls | Valid position values |

**Subcomponents:** DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator

#### 4.6 Input Editor
| Property | Description | UI Control | Value Constraints |
|----------|-------------|------------|-------------------|
| Size | Edit input dimensions | Size controls | Valid size values |
| States | Edit focus, error, disabled states | State toggle with property editor | Valid CSS values |
| Border | Edit border styles | Border controls | Valid border values |
| Typography | Edit text styles | Typography controls | Font properties |

#### 4.7 Avatar Editor
| Property | Description | UI Control | Value Constraints |
|----------|-------------|------------|-------------------|
| Size | Edit avatar size | Size slider | 1rem to 8rem |
| Border | Edit avatar border | Border controls | Valid border values |
| Fallback | Edit fallback appearance | Color and text controls | Valid values |

#### 4.8 Separator Editor
| Property | Description | UI Control | Value Constraints |
|----------|-------------|------------|-------------------|
| Color | Edit separator color | Color picker | Valid color values |
| Thickness | Edit separator thickness | Size slider | 1px to 8px |
| Style | Edit separator style | Dropdown (solid, dashed, dotted) | Valid border styles |

#### 4.9 Badge Editor
| Property | Description | UI Control | Value Constraints |
|----------|-------------|------------|-------------------|
| Variant | Edit badge variants | Dropdown (default, secondary, destructive, outline) | Predefined variants |
| Size | Edit badge size | Size controls | Valid size values |
| Border Radius | Edit corner radius | Size slider | 0px to 2rem |
| Colors | Edit badge colors | Color picker | Valid color values |

### Composite Component Editors

#### 4.10 Recipe Card Editor
| Property | Description | UI Control | Value Constraints |
|----------|-------------|------------|-------------------|
| Layout | Edit card layout | Layout controls | Valid layout options |
| Image Ratio | Edit image aspect ratio | Aspect ratio controls | Valid ratio values |
| Badge Styles | Edit tag badge styles | Badge editor | Badge properties |
| Typography | Edit text styles | Typography controls | Font properties |

**Referenced Components:** Card, CardHeader, CardContent, CardFooter, Badge, AspectRatio

#### 4.11 Site Header Editor
| Property | Description | UI Control | Value Constraints |
|----------|-------------|------------|-------------------|
| Layout | Edit header layout | Layout controls | Valid layout options |
| Mobile Menu | Edit mobile menu appearance | Sheet editor | Sheet properties |
| Navigation | Edit navigation styles | Typography and spacing controls | Valid values |

**Referenced Components:** Sheet, Button, Link

#### 4.12 Tags Menu Editor
| Property | Description | UI Control | Value Constraints |
|----------|-------------|------------|-------------------|
| Orientation | Edit menu orientation | Toggle (horizontal, vertical) | Horizontal/vertical |
| Tag Appearance | Edit tag styles | Typography and color controls | Valid values |

**Referenced Components:** DropdownMenu, Badge, Link

#### 4.13 Site Footer Editor
| Property | Description | UI Control | Value Constraints |
|----------|-------------|------------|-------------------|
| Layout | Edit footer layout | Layout controls | Valid layout options |
| Section Spacing | Edit section spacing | Spacing controls | Valid spacing values |
| Typography | Edit text styles | Typography controls | Font properties |

**Referenced Components:** Link, Separator

## 5. Required ShadCN Components for Edit Interface

The edit interface requires the following UI components (latest versions recommended):

1. **Tabs & TabsContent** - For organizing different editing sections
   - Required for switching between token types, component categories, and style sections

2. **Popover** - For color pickers and context menus
   - Required for editing color values and displaying contextual options

3. **Slider** - For numeric value adjustment
   - Required for spacing, sizing, border-radius, and other numeric properties

4. **Select** - For option selection
   - Required for variant selection, font family choice, and other enumerated options

5. **Switch** - For boolean toggles
   - Required for feature toggling and boolean property editing

6. **ColorPicker** (custom) - For color selection
   - Required for all color value editing

7. **Accordion** - For collapsible sections
   - Required for organizing large sets of editable properties

8. **Dialog** - For confirmation and complex inputs
   - Required for saving changes and complex property editing

9. **ResizablePanel** - For adjustable interface sections
   - Required for flexible editing layout

10. **Form** components - For structured input
    - Required for property editing and validation

11. **Toast** - For notifications
    - Required for user feedback on actions

12. **Command** - For keyboard shortcuts and command palette
    - Required for efficient navigation and actions

## 6. Implementation Recommendations

### 6.1 Architecture

Implement the editable design system using the following architecture:

1. **State Management**
   - Use React Context for global state management
   - Create separate contexts for tokens, components, and styles
   - Implement reducers for predictable state mutations

2. **File Structure**
```
/design-system
  /edit
    /components
      /token-editors
        ColorTokenEditor.tsx
        TypographyTokenEditor.tsx
        SpacingTokenEditor.tsx
        BorderTokenEditor.tsx
        ShadowTokenEditor.tsx
      /component-editors
        ButtonEditor.tsx
        CardEditor.tsx
        DialogEditor.tsx
        # ... other component editors
      /style-editors
        GlobalStyleEditor.tsx
        ClassEditor.tsx
    /lib
      /hooks
        useTokenUpdate.ts
        useComponentStyles.ts
        useStyleGenerator.ts
      /providers
        TokenEditorProvider.tsx
        ComponentEditorProvider.tsx
    /utils
      cssGenerator.ts
      tokenParser.ts
      fileWriter.ts
```

3. **Data Flow**
   - Read existing tokens from CSS files and Tailwind config
   - Store in editor state
   - Apply changes to preview via CSS-in-JS or dynamic stylesheet
   - Write changes to files on save

### 6.2 File Modification Strategy

1. **For Token Updates**
   - Parse and modify `app/globals.css` for CSS variables
   - Update `tailwind.config.js` for Tailwind theme extensions
   - Generate documentation in Markdown

2. **For Component Style Updates**
   - Modify component-specific CSS files or classes
   - Update class variance authority (cva) definitions
   - Update relevant Tailwind utilities

### 6.3 Preview Mechanism

1. Implement a live preview system using:
   - Isolated component rendering
   - Dynamic CSS injection
   - Side-by-side comparison (before/after)
   - Responsive viewport testing

### 6.4 Persistence and Version Control

1. **File Writing**
   - Write changes to files using server actions or API endpoints
   - Implement backup mechanism before changes

2. **Version History**
   - Store token and style change history
   - Allow reverting to previous versions
   - Enable named snapshots of design system states

## 7. Accessibility Considerations

1. Ensure all edit controls are fully keyboard accessible
2. Provide color contrast checking for all color editing
3. Validate all style changes against WCAG guidelines
4. Display accessibility warnings for non-compliant styles
5. Include screen reader previews for component states

## 8. Performance Optimizations

1. Implement debounced updates for real-time editing
2. Use virtualization for large token lists
3. Lazy load component editors
4. Cache computed styles and tokens
5. Use efficient diffing to minimize CSS updates

## 9. Security Considerations

1. Implement proper access control for design system editing
2. Validate all style inputs to prevent CSS injection attacks
3. Sanitize any user-provided values
4. Log all design system changes with user attribution
5. Implement approval workflow for production changes

## 10. Development Roadmap

### Phase 1: Token Editor
- Implement color token editing
- Implement typography token editing
- Implement spacing token editing
- Implement basic file persistence

### Phase 2: Component Editors
- Implement base component editors
- Implement composite component editors
- Create component preview system

### Phase 3: Style Management
- Implement global style editor
- Implement CSS class management
- Integrate with token system

### Phase 4: Integration & Polish
- Add version control and history
- Implement accessibility checking
- Optimize performance
- Add comprehensive documentation

### Phase 5: Advanced Features
- Add AI-assisted style suggestions
- Implement design token export/import
- Create shareable design system snapshots
- Add visual regression testing