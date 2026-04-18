import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import '../src/smart-search.js';

describe('smart-search', () => {
  const mockData = [
    { id: 1, label: 'Savings Account', type: 'account' },
    { id: 2, label: 'Current Account', type: 'account' },
    { id: 3, label: 'Transaction A', type: 'transaction' },
  ];

  it('renders the component', async () => {
    const el = await fixture(html`<smart-search></smart-search>`);
    const input = el.shadowRoot.querySelector('input');
    expect(input).to.exist;
  });

  it('filters results based on input', async () => {
    const el = await fixture(html`<smart-search></smart-search>`);
    el.data = mockData;

    const input = el.shadowRoot.querySelector('input');
    input.value = 'sav';
    input.dispatchEvent(new Event('input'));

    await el.updateComplete;

    expect(el.filtered.length).to.equal(1);
    expect(el.filtered[0].label).to.equal('Savings Account');
  });

  it('shows no results message when nothing matches', async () => {
    const el = await fixture(html`<smart-search></smart-search>`);
    el.data = mockData;

    const input = el.shadowRoot.querySelector('input');
    input.value = 'xyz';
    input.dispatchEvent(new Event('input'));

    await el.updateComplete;

    expect(el.filtered.length).to.equal(0);
  });

  it('selects an item and emits event', async () => {
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

  it('filters by category', async () => {
    const el = await fixture(html`<smart-search></smart-search>`);
    el.data = mockData;

    const input = el.shadowRoot.querySelector('input');
    input.value = 'account';
    input.dispatchEvent(new Event('input'));

    await el.updateComplete;

    const filterButtons = el.shadowRoot.querySelectorAll('.filter');
    filterButtons[1].click(); // account filter

    await el.updateComplete;

    expect(el.filtered.every(item => item.type === 'account')).to.be.true;
  });
});