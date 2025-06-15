# Rich Habits React Architecture

## Project Structure

```
client/src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, inputs, etc.)
│   ├── layout/          # Layout components and composers
│   ├── forms/           # Form components and field components
│   ├── home/            # Home page specific components
│   ├── events/          # Event-related components
│   ├── retail/          # E-commerce components
│   └── custom-apparel/  # Custom apparel components
├── contexts/            # React contexts for state management
├── features/            # Feature-based modules with barrel exports
│   ├── events/          # Event management feature
│   ├── retail/          # E-commerce feature
│   └── custom-apparel/  # Custom apparel feature
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and configurations
├── pages/               # Page components
├── styles/              # CSS files and utility classes
├── types/               # TypeScript type definitions
└── utils/               # Helper functions and utilities
```

## Key Architectural Decisions

### 1. Feature-Based Organization
Components are organized by business domain (events, retail, custom-apparel) with barrel exports for clean imports.

### 2. Layout Composition
Multiple layout variants:
- `Layout`: Standard layout with header/footer
- `EventLayout`: Optimized for event pages
- `RetailLayout`: Optimized for e-commerce
- `MinimalLayout`: Clean layout for checkout flows

### 3. Performance Optimizations
- Memoized components using React.memo
- Optimized custom hooks with useCallback/useMemo
- Lazy loading for images
- Centralized error handling

### 4. Type Safety
- Centralized type definitions in `types/common.ts`
- Zod validation schemas for forms
- Strict TypeScript configuration

### 5. Code Quality
- Consistent export patterns
- Removed duplicate components
- Cleaned unused imports
- Eliminated console.log statements

## Custom Hooks

### `useImageError`
Provides consistent image error handling across all components.

### `useCartOptimized`
Optimized cart management with memoized calculations.

### `useAsync`
Generic async state management for loading states.

## Validation Schemas

Located in `lib/validationSchemas.ts`:
- Event registration validation
- Team registration validation
- Contact form validation
- Custom apparel inquiry validation

## Performance Utils

Located in `utils/performanceUtils.tsx`:
- `OptimizedImage`: Memoized image component
- `usePriceFormatter`: Memoized price formatting
- `useClassNames`: Memoized class name builder

## Best Practices

1. **Component Naming**: Use PascalCase for components, match file names
2. **Imports**: Use barrel exports from feature modules
3. **Error Handling**: Use the `useImageError` hook for images
4. **Performance**: Wrap expensive components with React.memo
5. **Validation**: Use centralized Zod schemas for all forms
6. **Layouts**: Use appropriate layout variant for each page type

## Getting Started

1. All new components should use the established patterns
2. Import from feature modules using barrel exports
3. Use the provided custom hooks for common functionality
4. Follow the validation schema patterns for new forms
5. Use the layout composers for consistent page structure
