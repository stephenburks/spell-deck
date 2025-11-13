# CSS Naming Convention Guide

## Overview
This project uses a component-based naming convention that's clean, readable, and scales well with React applications.

## Naming Patterns

### 1. Component Classes
Use the component name as the base class:
```css
.spell-card { }
.spell-list { }
.dice-d20 { }
```

### 2. Component Parts (BEM-style)
Use double underscores for component sub-elements:
```css
.spell-card__description { }
.spell-card__level { }
.spell-card__classes { }
```

### 3. State Modifiers
Use descriptive state classes with `has-` or `is-` prefixes:
```css
.has-higher-level { }
.is-loading { }
.is-active { }
```

### 4. Utility Classes
Semantic, reusable classes for common patterns:
```css
.section-divider { }
.scrollable-content { }
.loading-container { }
.stats-grid { }
```

### 5. Layout Components
Container and structural classes:
```css
.app-container { }
.spell-list-container { }
.loading-container { }
```

## CSS Variables

### Layout Variables
```css
--dice-size: 5rem;
--dice-height: 4.325rem;
```

### Color Variables
Use descriptive prefixes:
```css
--color-dnd-red: #c73032;
--color-barbarian: #e7623e;
--color-wizard: #2a50a1;
```

## Examples

### Good ✅
```css
.spell-card { }
.spell-card__description { }
.spell-card.has-concentration { }
.concentration-indicator { }
```

### Avoid ❌
```css
.spellCard { }  /* camelCase */
.spell-card-description-text-content { }  /* too long */
.sc-desc { }  /* abbreviations */
.spell_card { }  /* underscores for components */
```

## Benefits
- **Readable**: Class names clearly describe their purpose
- **Maintainable**: Easy to find and update related styles
- **Scalable**: Consistent patterns for adding new components
- **Component-focused**: Aligns with React architecture
- **No conflicts**: Scoped naming prevents style collisions