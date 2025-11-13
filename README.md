# D&D 5e Spell Deck

A React application for browsing Dungeons & Dragons 5th Edition spells organized by class. Built with Chakra UI and powered by the D&D 5e API.

## Features

- Browse spells by character class (Wizard, Cleric, Druid, etc.)
- Detailed spell information including descriptions, components, and casting details
- Responsive card-based layout
- Local storage caching for improved performance
- Custom D&D-themed styling with class-specific colors

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

### Build

Create a production build:
```bash
npm run build
```

## Tech Stack

- **React 18** - UI framework
- **Chakra UI** - Component library and theming
- **React Query** - Data fetching and caching
- **D&D 5e API** - Spell data source
- **Framer Motion** - Animations (via Chakra UI)

## API

This app uses the [D&D 5e API](https://www.dnd5eapi.co/) to fetch spell data. The first load may take a moment as it retrieves all spell information, but subsequent visits use cached data for faster loading.
