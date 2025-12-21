# D&D 5e Spell Library

A comprehensive React application for managing Dungeons & Dragons 5th Edition spells. Built for
players and dungeon masters who want a powerful, intuitive spell management system that works
entirely in your browser.

## ✨ Features

### 🎲 Spells of the Day

Discover new spells with daily randomized selections organized by character class. Perfect for
finding inspiration or learning about spells you might have overlooked.

### 📚 Personal Spellbook

Save and organize your favorite spells for quick reference. Build your personal collection and never
lose track of that perfect spell again.

### ⚔️ Spell Deck

Manage spells during active gameplay with real-time spell slot tracking. Add spells to your session,
"burn" leveled spells when used, and keep cantrips available for unlimited use.

### 🔍 Complete Spell Database

Search and filter through all D&D 5e spells with advanced filtering options:

- **Smart Search**: Fuzzy search across spell names, descriptions, and components
- **Class Filtering**: Browse spells by character class with themed styling
- **Level & School Filtering**: Narrow down by spell level and magic school
- **Detailed Information**: View comprehensive spell details including components, range, duration,
  and full descriptions

### 🎨 Additional Features

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Local Storage**: All your data persists locally in your browser - no accounts needed
- **Performance Optimized**: Virtualized lists and smart caching for smooth browsing
- **Accessibility**: Built with screen readers and keyboard navigation in mind

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

    ```bash
    git clone <repository-url>
    cd d-d-5e-spell-library
    ```

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

## 🛠️ Tech Stack

- **React 18** - Modern UI framework with hooks and concurrent features
- **Chakra UI** - Component library and design system for consistent styling
- **TanStack Query** - Powerful data fetching, caching, and synchronization
- **React Window** - Virtualized lists for optimal performance with large datasets
- **Fuse.js** - Fuzzy search functionality for intelligent spell discovery
- **Local Storage API** - Client-side data persistence without external dependencies

## 🙏 Data Sources & Attribution

This project wouldn't exist without these incredible open-source resources and the communities that
maintain them:

### D&D 5e API

All spell data is sourced from the comprehensive **D&D 5e API** maintained by the community at
[5e-bits](https://github.com/5e-bits/5e-srd-api). This API provides structured access to the D&D 5e
System Reference Document, making it possible to build applications like this one.

**Repository**: [github.com/5e-bits/5e-srd-api](https://github.com/5e-bits/5e-srd-api)  
**API Endpoint**: [www.dnd5eapi.co](https://www.dnd5eapi.co/)

### Icons & Visual Assets

The beautiful class icons, spell school symbols, and UI iconography are sourced from the
community-maintained collection at **tw-dnd** by
[intrinsical](https://github.com/intrinsical/tw-dnd). These SVG icons bring the D&D aesthetic to
life and make the interface both functional and visually appealing.

**Repository**: [github.com/intrinsical/tw-dnd](https://github.com/intrinsical/tw-dnd)

### Special Thanks

- The **D&D 5e community** for maintaining comprehensive, accessible spell databases
- **Wizards of the Coast** for making the System Reference Document available under the OGL
- All the **open-source contributors** who make projects like this possible

## 📖 How to Use

1. **Start Exploring**: Begin with "Spells of the Day" to discover new spells
2. **Build Your Collection**: Use "Spellbook" to save spells you want to remember
3. **Manage Sessions**: Use "Spell Deck" during gameplay to track spell usage
4. **Deep Dive**: Explore the complete "Spell Library" with advanced search and filtering
5. **Learn More**: Check the "README" tab for detailed information about the project

## 🔧 Development & Contributing

This is an open-source project built with modern web technologies. The application runs entirely in
your browser with no backend required, ensuring your data stays private and the app works offline
after the initial load.

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🗺️ Road Map

Want to see what's coming next or contribute ideas? Check out our [Road Map](ideas.md) for upcoming
features, technical improvements, and future possibilities.

---

**Built with ❤️ for the D&D community** • No data collection • Privacy-first • Open Source
