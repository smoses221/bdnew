# CSS Structure and Organization

This document outlines the CSS architecture for the BD Library project.

## Directory Structure

```
src/styles/
├── index.css              # Main CSS entry point
├── variables.css          # CSS custom properties and design tokens
├── global.css            # Global styles, reset, and utilities
├── components/           # Component-specific styles
│   └── NavigationBar.css
└── pages/               # Page-specific styles
    ├── HomePage.css
    ├── AboutPage.css
    ├── LoginPage.css
    └── AdminPage.css
```

## Import Strategy

1. **Main Entry Point**: `styles/index.css` imports all other CSS files in the correct order
2. **Order of Imports**:
   - Variables and design tokens
   - Global styles and reset
   - Component styles
   - Page styles
   - Utility classes

## CSS Architecture Principles

### 1. CSS Custom Properties (Variables)
- Defined in `variables.css`
- Consistent design tokens for colors, spacing, typography, etc.
- Easy theme switching support

### 2. Component-Specific Styles
- Each component has its own CSS file in `styles/components/`
- Scoped class names to avoid conflicts
- Responsive design included

### 3. Page-Specific Styles
- Each page has its own CSS file in `styles/pages/`
- Layout and page-specific styling
- Responsive breakpoints

### 4. Global Utilities
- Common utility classes in `global.css`
- Spacing, typography, and layout helpers
- Responsive utilities

## Design System

### Colors
- Primary: `--primary-color` (#667eea)
- Secondary: `--secondary-color` (#52c41a)
- Neutrals: `--gray-*` (50-900 scale)
- Status colors: success, warning, error, info

### Typography
- Font family: Inter (with fallbacks)
- Font sizes: `--font-size-*` (xs to 4xl)
- Font weights: `--font-weight-*` (light to bold)
- Line heights: `--line-height-*` (tight to loose)

### Spacing
- Consistent spacing scale: `--space-*` (1-20)
- Based on 4px increments

### Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

## Usage Guidelines

### Component CSS
```css
/* Component-specific styles */
.component-name {
  /* Base styles */
}

.component-name__element {
  /* Element styles */
}

.component-name--modifier {
  /* Modifier styles */
}
```

### Page CSS
```css
/* Page-specific styles */
.page-name {
  /* Page container styles */
}

.page-name .section {
  /* Page section styles */
}
```

### Using CSS Variables
```css
.my-component {
  color: var(--primary-color);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: var(--transition-base);
}
```

## Best Practices

1. **Use CSS Variables**: Always use design tokens instead of hardcoded values
2. **Mobile First**: Write CSS mobile-first, then add desktop styles
3. **Component Scoping**: Use descriptive class names to avoid conflicts
4. **Consistent Naming**: Follow BEM methodology for class naming
5. **Performance**: Minimize CSS bundle size and avoid unused styles

## File Naming Conventions

- Component CSS: `ComponentName.css`
- Page CSS: `PageName.css`
- Global files: `lowercase.css`
- Use PascalCase for component/page files
- Use kebab-case for global utility files

## Responsive Design

All components and pages should be responsive. Use the predefined breakpoints:

```css
/* Mobile first approach */
.component {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop styles */
  }
}
```
