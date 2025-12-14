# Implementation Plan

- [x]   1. Set up new data infrastructure and utilities
    - Create localStorage management utilities for the three new data stores (spellbook,
      session-deck, daily-spells)
    - Implement data validation functions for spell objects and arrays
    - Create spell grouping utilities for level-based organization (Cantrips, Level 1-9)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.4_

- [x]   2. Create enhanced SpellCard component with context-aware actions
    - Modify existing SpellCard component to accept context prop and dynamic action callbacks
    - Implement context-specific action buttons (daily, spellbook, session, deck contexts)
    - Add visual differentiation for cantrips vs leveled spells in session context
    - _Requirements: 7.1, 4.5, 7.5_

- [x]   3. Implement DailySpellsTab component
    - Create component that generates and displays 12 random spells daily
    - Implement midnight refresh logic using date comparison
    - Add localStorage persistence for daily spell selection
    - Integrate with enhanced SpellCard component for "Add to Spellbook" and "Add to Session"
      actions
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]   4. Implement SpellbookTab component
    - Create personal spell library management component
    - Implement add/remove spell functionality with duplicate prevention
    - Add level-based spell organization and display
    - Integrate "Add to Session" functionality from spellbook to session deck
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ]   5. Implement SessionDeckTab component
    - Create session spell management with unique session IDs for each spell instance
    - Implement burn spell functionality for leveled spells (levels 1-9)
    - Add cantrip unlimited-use logic and visual indicators
    - Implement "Clear Session" functionality
    - Add level-based organization for session spells
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [ ]   6. Create comprehensive spell fetching hook
    - Implement useAllSpells hook that fetches complete spell database
    - Optimize data loading to work with existing API infrastructure
    - Add proper error handling and loading states
    - _Requirements: 5.1, 7.4_

- [ ]   7. Implement SpellDeckTab with search and filtering
    - Create searchable spell index component using complete spell database
    - Implement text search with debouncing (300ms delay)
    - Add dropdown filters for class, level, and school with multi-select capability
    - Implement combined search and filter logic (search within filtered results)
    - Add results counter showing number of matching spells
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ]   8. Create main SpellInterface container component
    - Implement new main container component with Chakra UI Tabs
    - Set up four horizontal tabs: "Spells of the Day", "Spellbook", "Session Deck", "Spell Deck"
    - Add tab state management and persistence during user session
    - Initialize localStorage data on component mount
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.2_

- [ ]   9. Integrate SpellInterface into App.js and remove old components
    - Replace SpellDeck component with new SpellInterface in App.js
    - Remove old class-based components (class-tabs.jsx, sessionTab.jsx)
    - Clean up unused imports and dependencies
    - _Requirements: 7.2, 7.3_

- [ ]   10. Data migration and cleanup
    - Create migration utility to convert existing session localStorage data to new format
    - Preserve user's current session spells during transition
    - Remove deprecated API functions and hooks that are no longer needed
    - _Requirements: 6.4, 6.5, 7.4_

- [ ]\* 11. Testing and validation
    - Write unit tests for localStorage utilities and data validation functions
    - Create integration tests for cross-tab functionality (spellbook to session, etc.)
    - Test midnight refresh logic for daily spells
    - Validate search and filter performance with large datasets
    - _Requirements: 6.6, 2.2, 5.4, 5.5_
