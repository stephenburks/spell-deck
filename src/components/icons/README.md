# Icon System

This project uses a unified icon system that loads SVG files through the `Icon` component.

## Usage

```jsx
import { Icon } from './icons';

// Spell icons
<Icon name="abjuration" folder="spell" size={24} />
<Icon name="evocation" folder="spell" size={32} color="#ff6b6b" />

// Class icons
<Icon name="wizard" folder="classes" size={20} />
<Icon name="bard" folder="classes" size={24} className="class-icon" />

// UI icons
<Icon name="range" folder="ui" size={16} />
<Icon name="duration" folder="ui" size={18} />
```

## Available Icons

### Spell Icons (`folder="spell"`)

- abjuration, concentration, conjuration, consumed, cost
- divination, enchantment, evocation, illusion, instantaneous
- material, necromancy, octagon, ritual, somatic
- transmutation, upcast, vocal

### Class Icons (`folder="classes"`)

- artificer, barbarian, bard, cleric, druid, fighter
- monk, paladin, ranger, rogue, sorcerer, warlock, wizard

### UI Icons (`folder="ui"`)

- casting-time, components, duration, range, concentration

## Adding New Icons

1. Add your SVG file to the appropriate folder:
    - `src/components/icons/spell/` for spell-related icons
    - `src/components/icons/classes/` for class icons
    - `src/components/icons/ui/` for UI icons

2. Import the SVG in `src/components/IconRegistry.jsx`:

    ```jsx
    import newIcon from './icons/spell/new-icon.svg'
    ```

3. Add it to the appropriate registry object:
    ```jsx
    const iconRegistry = {
    	spell: {
    		// ... existing icons
    		'new-icon': newIcon
    	}
    }
    ```

## Props

- `name` (required): The icon name (without .svg extension)
- `folder` (optional): Icon category - "spell", "classes", or "ui" (defaults to "spell")
- `size` (optional): Icon size in pixels (defaults to 24)
- `color` (optional): Icon color (defaults to "currentColor")
- `className` (optional): CSS classes to apply
- `...props`: Any other props are passed through to the SVG element

## Examples in the codebase

```jsx
// Spell card UI icons
<Icon name="casting-time" folder="ui" />
<Icon name="range" folder="ui" />
<Icon name="components" folder="ui" />
<Icon name="duration" folder="ui" />
<Icon name="concentration" folder="ui" />

// Class icons
<Icon name="wizard" folder="classes" size={20} />
<Icon name="bard" folder="classes" size={20} />

// Spell school icons
<Icon name="abjuration" folder="spell" size={24} />
<Icon name="evocation" folder="spell" size={24} />
```
