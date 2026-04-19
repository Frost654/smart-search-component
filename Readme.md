# Smart Search Web Component

A reusable, framework-agnostic smart search web component built using Web Components (Lit).  
Designed for banking applications to search across accounts, transactions, customers, and other entities.

---

## Features

- Interactive search input with clear functionality
- Keyboard navigation (Arrow keys, Enter, Escape)
- Filter support (account, transaction, customer)
- Search term highlighting
- Mobile-friendly interactions
- Accessibility support (ARIA roles)
- Theming (Light/Dark and design tokens)
- Dynamic dropdown positioning (viewport aware)
- Overlay handling (z-index, click outside)
- Event-based communication
- Framework agnostic (works with React, Vue, or plain JavaScript)

---

## Installation

Clone the repository:

```bash
git clone <your-repo-url>
cd smart-search-component
npm install
```

## Technical Justification

### Technology Stack

**Web Components + Lit**
- **Framework-agnostic**: Works with React, Vue, Angular, or vanilla JavaScript without additional adapters
- **Native browser standard**: Uses W3C Web Components API, ensuring longevity and no framework lock-in
- **Lightweight**: Lit (~5KB) provides reactive property/attribute binding without the overhead of full frameworks
- **Shadow DOM**: Provides style and DOM encapsulation, preventing conflicts in applications with multiple components

**Why Not Framework-Specific?**
- A banking component is deployed across multiple codebases (some React, some Vue, some legacy)
- Web Components eliminate the need for separate implementations
- Reduces maintenance burden and ensures consistent behavior

### Accessibility & Web Standards

- **ARIA attributes**: Full keyboard navigation with `role="combobox"`, `aria-expanded`, `aria-selected`
- **Semantic HTML**: Proper use of `<input>`, `<button>`, `<div role="option">` elements
- **Keyboard support**: Arrow keys, Enter, Escape follow WAI-ARIA combobox pattern
- **Live regions**: Screen reader announcements on navigation

### Testing Strategy

- **Lean test suite**: 23 essential tests (~270 lines) proportional to component size (~600 lines)
- **Human-maintainable**: Focuses on critical paths rather than exhaustive coverage
- **@open-wc/testing**: Industry standard for testing Web Components
- **Automated browser testing**: Web Test Runner with Chrome for consistent cross-browser validation

Why lean over comprehensive?
- Comprehensive tests (84+ tests) exceeded component size and become maintenance debt
- Essential tests catch real bugs and regressions
- Reduces onboarding friction for new team members

## Usage

### Basic Example

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="./src/smart-search.js"></script>
  </head>
  <body>
    <smart-search theme="light"></smart-search>
    
    <script>
      const search = document.querySelector('smart-search');
      
      // Set your data
      search.data = [
        { id: 1, label: 'Savings Account', type: 'account' },
        { id: 2, label: 'Current Account', type: 'account' },
        { id: 3, label: 'Recent Transaction', type: 'transaction' },
      ];
      
      // Listen for selection events
      search.addEventListener('select', (event) => {
        console.log('Selected:', event.detail);
      });
    </script>
  </body>
</html>
```

### With React

```jsx
import './src/smart-search.js';

function App() {
  const handleSelect = (event) => {
    console.log('Selected:', event.detail);
  };

  return (
    <smart-search 
      onSelect={handleSelect}
      theme="dark"
    />
  );
}
```

## Development

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Testing

Run the test suite:

```bash
npm run test
```

Tests include:
- **Basic Rendering** (3 tests): Component structure, themes, clear button
- **Search Filtering** (5 tests): Query matching, configuration (minChars, maxResults), type filtering
- **Item Selection** (3 tests): Click selection, event emissions, dropdown closure
- **Keyboard Navigation** (3 tests): Arrow keys, Enter/Escape, focus management
- **User Actions** (2 tests): Clear button, outside click handling
- **Configuration** (4 tests): Custom filters, custom mappers, debounce timing
- **Edge Cases** (3 tests): Empty data, case-insensitive search, text highlighting

The test suite uses Web Test Runner with Chrome browser for automated testing.

## API Reference

### Properties

- **data** - Array of searchable items (required)
- **theme** - Visual theme: `light` or `dark` (default: `light`)
- **placeholder** - Input placeholder text (default: `Search...`)
- **minChars** - Minimum characters to trigger search (default: 1)
- **debounceTime** - Search debounce time in ms (default: 300)
- **maxResults** - Maximum results to display (default: 10)
- **customFilter** - Custom filter function for advanced search

### Events

- **select** - Emitted when a result is selected. Details include the selected item.
- **search** - Emitted when search query changes.
- **focus** - Emitted when search input gains focus.

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC