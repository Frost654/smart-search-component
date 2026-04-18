import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import '../src/smart-search.js';

describe('smart-search', () => {
  const mockData = [
    { id: 1, label: 'Savings Account', type: 'account' },
    { id: 2, label: 'Current Account', type: 'account' },
    { id: 3, label: 'Transaction A', type: 'transaction' },
  ];

  const alternativeFormatData = [
    { _id: '001', name: 'Premium Account', category: 'account' },
    { _id: '002', title: 'Wire Transfer', category: 'transaction' },
    { _id: '003', name: 'John Doe', category: 'customer' },
  ];

  const enrichedBankingData = [
    { 
      id: 'acc-001', 
      label: 'Business Checking', 
      type: 'account',
      description: 'Multi-user business account',
      displayName: 'Business Checking (****1234)'
    },
    { 
      id: 'tr-001', 
      label: 'Payment to Vendor ABC',
      type: 'transaction',
      description: '$5,000.00',
      displayName: 'Payment - ABC Corp'
    },
    { 
      id: 'cust-001', 
      label: 'Sarah Johnson',
      type: 'customer',
      description: 'Frequent beneficiary',
      displayName: 'Sarah Johnson (Mobile: ***-**-7890)'
    },
  ];

  const nestedBankingData = [
    { 
      id: 'acc-01',
      account: { name: 'Savings Plus', number: '**** 1234' },
      type: 'account'
    },
    { 
      id: 'ben-01',
      beneficiary: { firstName: 'James', lastName: 'Wilson' },
      type: 'beneficiary'
    }
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

  describe('Data Format Flexibility', () => {
    it('handles alternative field names (_id, name, title, category)', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = alternativeFormatData;

      const input = el.shadowRoot.querySelector('input');
      input.value = 'premium';
      input.dispatchEvent(new Event('input'));

      await el.updateComplete;

      expect(el.filtered.length).to.equal(1);
      expect(el.filtered[0].label).to.equal('Premium Account');
      expect(el.filtered[0].type).to.equal('account');
    });

    it('normalizes _id to id field', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = alternativeFormatData;

      expect(el.data[0].id).to.equal('001');
      expect(el.data[1].id).to.equal('002');
    });

    it('handles enriched banking data with descriptions', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.data = enrichedBankingData;

      const input = el.shadowRoot.querySelector('input');
      input.value = 'business';
      input.dispatchEvent(new Event('input'));

      await el.updateComplete;

      expect(el.filtered.length).to.equal(1);
      expect(el.filtered[0].description).to.equal('Multi-user business account');
    });

    it('supports custom data mapper for complex transformations', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      
      const customMapper = (item) => ({
        id: item.id,
        label: item.account?.name || item.beneficiary?.firstName,
        type: item.type,
        meta: item
      });

      el.dataMapper = customMapper;
      el.data = nestedBankingData;

      const input = el.shadowRoot.querySelector('input');
      input.value = 'savings';
      input.dispatchEvent(new Event('input'));

      await el.updateComplete;

      expect(el.filtered.length).to.equal(1);
      expect(el.filtered[0].label).to.equal('Savings Plus');
    });

    it('supports dynamic filter types for different contexts', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      el.supportedTypes = ['all', 'account', 'transaction', 'customer', 'beneficiary'];
      el.data = enrichedBankingData;

      expect(el.filtersList).to.deep.equal(['all', 'account', 'transaction', 'customer', 'beneficiary']);
    });

    it('preserves original data in meta field', async () => {
      const el = await fixture(html`<smart-search></smart-search>`);
      const original = { 
        _id: 'test-001',
        name: 'Test Account',
        category: 'account',
        customField: 'custom value'
      };
      
      el.data = [original];

      expect(el.data[0].meta.customField).to.equal('custom value');
    });
  });
});