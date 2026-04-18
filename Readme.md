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

The tests use Web Test Runner with Puppeteer for automated browser testing.

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