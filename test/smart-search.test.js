import { fixture, html, expect, oneEvent, aTimeout } from '../node_modules/@open-wc/testing/index.js';
import '../src/smart-search.js';

describe('smart-search', () => {
  const mockData = [
    { id: 1, label: 'Savings Account', type: 'account' },
    { id: 2, label: 'Current Account', type: 'account' },
    { id: 3, label: 'Transaction A', type: 'transaction' },
  ];

  describe('Basic Rendering', () => {
    it('renders input with correct attributes', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      const input = el.shadowRoot.querySelector('input');
      expect(input).to.exist;
      expect(input.getAttribute('role')).to.equal('combobox');
    });

    it('applies theme attribute', async () => {
      const el = await fixture(html`<smart-search theme="dark"></smart-search>`);
      expect(el.theme).to.equal('dark');
    });

    it('renders clear button only when query exists', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = mockData;
      let clearBtn = el.shadowRoot.querySelector('.clear-btn');
      expect(clearBtn).to.not.exist;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      clearBtn = el.shadowRoot.querySelector('.clear-btn');
      expect(clearBtn).to.exist;
    });
  });

  describe('Search Filtering', () => {
    it('filters results based on input', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'sav';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      expect(el.filtered.length).to.equal(1);
    });

    it('shows empty results message when no matches', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'xyz123notfound';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      const noResults = el.shadowRoot.querySelector('.no-results');
      expect(noResults).to.exist;
    });

    it('filters by type when filter button clicked', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'a';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      const filterButtons = el.shadowRoot.querySelectorAll('.filter');
      filterButtons[1].click();
      await el.updateComplete;
      expect(el.selectedFilter).to.equal('account');
    });

    it('respects minChars configuration', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.minChars = 3;
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'sa';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      expect(el.filtered.length).to.equal(0);
      input.value = 'sav';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      expect(el.filtered.length).to.be.greaterThan(0);
    });

    it('limits results with maxResults', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.maxResults = 1;
      const largeData = Array.from({ length: 10 }, (_, i) => ({
        id: i, label: `Account ${i}`, type: 'account'
      }));
      el.data = largeData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'account';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      expect(el.filtered.length).to.equal(1);
    });
  });

  describe('Item Selection', () => {
    it('selects item and emits select event', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'sav';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      const item = el.shadowRoot.querySelector('.item');
      setTimeout(() => item.click());
      const event = await oneEvent(el, 'select');
      expect(event.detail.label).to.equal('Savings Account');
    });

    it('emits change event with correct structure', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'sav';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      const item = el.shadowRoot.querySelector('.item');
      setTimeout(() => item.click());
      const event = await oneEvent(el, 'change');
      expect(event.detail.value).to.include.keys('id', 'label', 'type');
    });

    it('closes dropdown after selection', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'sav';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      expect(el.open).to.be.true;
      const item = el.shadowRoot.querySelector('.item');
      item.click();
      await el.updateComplete;
      expect(el.open).to.be.false;
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates results with arrow keys', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'account';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      await el.updateComplete;
      expect(el.activeIndex).to.equal(0);
    });

    it('selects with Enter key', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'account';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      setTimeout(() => {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      });
      const event = await oneEvent(el, 'select');
      expect(event.detail).to.exist;
    });

    it('closes dropdown with Escape key', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'account';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      expect(el.open).to.be.true;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await el.updateComplete;
      expect(el.open).to.be.false;
    });
  });

  describe('User Actions', () => {
    it('clears search on clear button click', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      const clearBtn = el.shadowRoot.querySelector('.clear-btn');
      clearBtn.click();
      await el.updateComplete;
      expect(el.query).to.equal('');
      expect(el.open).to.be.false;
    });

    it('closes dropdown when clicking outside', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      expect(el.open).to.be.true;
      document.dispatchEvent(new MouseEvent('click'));
      await el.updateComplete;
      expect(el.open).to.be.false;
    });
  });

  describe('Configuration', () => {
    it('supports custom filter function', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.customFilter = (item, query) => item.label.toLowerCase().startsWith(query.toLowerCase());
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'sav';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      expect(el.filtered.length).to.equal(1);
    });

    it('supports custom data mapper', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.dataMapper = (item) => ({
        id: item.id,
        label: item.label.toUpperCase(),
        type: item.type,
        meta: item
      });
      el.data = mockData;
      expect(el.data[0].label).to.equal('SAVINGS ACCOUNT');
    });

    it('supports debounce delay', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.debounceTime = 100;
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'sav';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      expect(el.filtered.length).to.equal(0);
      await aTimeout(150);
      expect(el.filtered.length).to.be.greaterThan(0);
    });

    it('allows setting supported filter types', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.supportedTypes = ['all', 'account', 'transaction'];
      expect(el.filtersList).to.deep.equal(['all', 'account', 'transaction']);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty data array', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = [];
      const input = el.shadowRoot.querySelector('input');
      input.value = 'test';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      expect(el.filtered.length).to.equal(0);
    });

    it('handles case-insensitive search', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'SAVINGS';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      expect(el.filtered.length).to.equal(1);
    });

    it('highlights query text in results', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = mockData;
      const input = el.shadowRoot.querySelector('input');
      input.value = 'sav';
      input.dispatchEvent(new Event('input'));
      await el.updateComplete;
      const item = el.shadowRoot.querySelector('.item');
      expect(item.innerHTML).to.include('<mark>');
    });
  });
});
